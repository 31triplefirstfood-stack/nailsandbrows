import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const MONTH_TH = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

export async function GET() {
    try {
        const now = new Date();
        const year = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-indexed

        const yearStart = new Date(year, 0, 1);
        const yearEnd = new Date(year + 1, 0, 1);
        const monthStart = new Date(year, currentMonth, 1);
        const monthEnd = new Date(year, currentMonth + 1, 1);

        // Fetch all transactions and expenses for the year
        const [allTransactions, allExpenses] = await Promise.all([
            prisma.transaction.findMany({
                where: { date: { gte: yearStart, lt: yearEnd } },
                include: { items: { include: { service: true } } },
            }),
            prisma.expense.findMany({
                where: { date: { gte: yearStart, lt: yearEnd } },
            }),
        ]);

        // Build monthly data (12 months)
        const monthlyData = Array.from({ length: 12 }, (_, i) => ({
            month: MONTH_TH[i],
            monthIndex: i,
            income: 0,
            expenses: 0,
        }));

        for (const tx of allTransactions) {
            const m = new Date(tx.date).getMonth();
            if (m >= 0 && m < 12) monthlyData[m].income += Number(tx.totalAmount);
        }
        for (const exp of allExpenses) {
            const m = new Date(exp.date).getMonth();
            if (m >= 0 && m < 12) monthlyData[m].expenses += Number(exp.amount);
        }

        // Category breakdown (from transaction items)
        const categoryTotals: Record<string, number> = { NAILS: 0, EYELASH: 0, PERMANENT_MAKEUP: 0, COURSE_STUDY: 0 };
        for (const tx of allTransactions) {
            for (const item of tx.items) {
                const cat = item.service?.category ?? "OTHERS";
                categoryTotals[cat] = (categoryTotals[cat] ?? 0) + Number(item.price) * item.quantity;
            }
        }

        const categoryData = [
            { name: "เล็บ", value: categoryTotals.NAILS, key: "NAILS" },
            { name: "ขนตา", value: categoryTotals.EYELASH, key: "EYELASH" },
            { name: "สักปาก/คิ้ว", value: categoryTotals.PERMANENT_MAKEUP, key: "PERMANENT_MAKEUP" },
            { name: "คอร์สเรียน", value: categoryTotals.COURSE_STUDY, key: "COURSE_STUDY" },
        ].filter((c) => c.value > 0);

        // Current month summary
        const monthIncome = allTransactions
            .filter((t) => new Date(t.date) >= monthStart && new Date(t.date) < monthEnd)
            .reduce((sum, t) => sum + Number(t.totalAmount), 0);
        const monthExpenses = allExpenses
            .filter((e) => new Date(e.date) >= monthStart && new Date(e.date) < monthEnd)
            .reduce((sum, e) => sum + Number(e.amount), 0);
        const monthNetProfit = monthIncome - monthExpenses;

        // Top services (by revenue)
        const serviceRevenue: Record<string, { name: string; category: string; revenue: number; count: number }> = {};
        for (const tx of allTransactions) {
            for (const item of tx.items) {
                const id = item.service?.id ?? "unknown";
                if (!serviceRevenue[id]) {
                    serviceRevenue[id] = { name: item.service?.name ?? "?", category: item.service?.category ?? "NAILS", revenue: 0, count: 0 };
                }
                serviceRevenue[id].revenue += Number(item.price) * item.quantity;
                serviceRevenue[id].count += item.quantity;
            }
        }
        const topServices = Object.values(serviceRevenue)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        return NextResponse.json({
            monthlyData,
            categoryData,
            monthIncome,
            monthExpenses,
            monthNetProfit,
            topServices,
            year,
            currentMonthName: MONTH_TH[currentMonth],
        });
    } catch (error) {
        console.error("GET /api/reports error:", error);
        return NextResponse.json({ error: "ไม่สามารถดึงข้อมูลรายงานได้" }, { status: 500 });
    }
}
