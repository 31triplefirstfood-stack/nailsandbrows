import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const range = searchParams.get("range"); // today, weekly, monthly
        const dateParam = searchParams.get("date"); // specific date YYYY-MM-DD

        const where: Record<string, any> = {};

        const anchorDate = dateParam ? new Date(dateParam) : new Date();
        const y = anchorDate.getFullYear();
        const m = anchorDate.getMonth();
        const d = anchorDate.getDate();

        if (range === "monthly") {
            const startOfMonth = new Date(y, m, 1);
            const endOfMonth = new Date(y, m + 1, 1);
            where.date = { gte: startOfMonth, lt: endOfMonth };
        } else if (range === "weekly") {
            const day = anchorDate.getDay();
            const diff = anchorDate.getDate() - day;
            const startOfWeek = new Date(y, m, diff);
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 7);
            where.date = { gte: startOfWeek, lt: endOfWeek };
        } else { // today or date
            const startOfDay = new Date(y, m, d);
            const endOfDay = new Date(y, m, d + 1);
            where.date = { gte: startOfDay, lt: endOfDay };
        }

        const transactions = await prisma.transaction.findMany({
            where,
            include: {
                items: {
                    include: { service: true },
                },
            },
            orderBy: { date: "asc" }, // Order by time ascending for the daily breakdown
        });

        const grouped: Record<string, any> = {};

        for (const t of transactions) {
            const empName = t.employeeName || "ไม่ระบุพนักงาน";
            if (!grouped[empName]) {
                grouped[empName] = {
                    employeeName: empName,
                    transactionCount: 0,
                    totalAmount: 0,
                    paymentMethods: {
                        CASH: { amount: 0, count: 0, label: "Cash" },
                        CREDIT_CARD: { amount: 0, count: 0, label: "Card" },
                        PROMPTPAY: { amount: 0, count: 0, label: "QR" },
                        TRANSFER: { amount: 0, count: 0, label: "Transfer" },
                    },
                    transactions: [],
                };
            }

            grouped[empName].transactionCount += 1;
            grouped[empName].totalAmount += Number(t.totalAmount);

            const method = t.paymentMethod as string;
            if (grouped[empName].paymentMethods[method]) {
                grouped[empName].paymentMethods[method].amount += Number(t.totalAmount);
                grouped[empName].paymentMethods[method].count += 1;
            } else {
                grouped[empName].paymentMethods[method] = { amount: Number(t.totalAmount), count: 1, label: method };
            }

            grouped[empName].transactions.push(t);
        }

        const result = Object.values(grouped).sort((a: any, b: any) => b.totalAmount - a.totalAmount);

        return NextResponse.json(result);
    } catch (error) {
        console.error("GET /api/staff-logs error:", error);
        return NextResponse.json(
            { error: "ไม่สามารถดึงข้อมูลReportได้" },
            { status: 500 }
        );
    }
}
