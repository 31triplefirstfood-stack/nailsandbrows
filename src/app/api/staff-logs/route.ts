import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const range = searchParams.get("range"); // today, weekly, monthly
        const dateParam = searchParams.get("date"); // specific date YYYY-MM-DD

        const where: Record<string, any> = {};

        const now = new Date();
        const y = now.getFullYear();
        const m = now.getMonth();
        const d = now.getDate();

        if (dateParam) {
            const date = new Date(dateParam);
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);
            where.date = { gte: date, lt: nextDay };
        } else if (range === "today") {
            const startOfDay = new Date(y, m, d);
            const endOfDay = new Date(y, m, d + 1);
            where.date = { gte: startOfDay, lt: endOfDay };
        } else if (range === "weekly") {
            const day = now.getDay();
            const diff = now.getDate() - day + (day === 0 ? -6 : 1);
            const startOfWeek = new Date(y, m, diff);
            const endOfDay = new Date(y, m, d + 1);
            where.date = { gte: startOfWeek, lt: endOfDay };
        } else if (range === "monthly") {
            const startOfMonth = new Date(y, m, 1);
            const endOfDay = new Date(y, m, d + 1);
            where.date = { gte: startOfMonth, lt: endOfDay };
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
            { error: "ไม่สามารถดึงข้อมูลผลงานพนักงานได้" },
            { status: 500 }
        );
    }
}
