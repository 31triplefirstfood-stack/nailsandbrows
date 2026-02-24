import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET dashboard summary data
export async function GET() {
    try {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayEnd.getDate() + 1);

        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        // Today's revenue
        const todayTransactions = await prisma.transaction.findMany({
            where: { date: { gte: todayStart, lt: todayEnd } },
        });
        const todayRevenue = todayTransactions.reduce(
            (sum, t) => sum + Number(t.totalAmount),
            0
        );

        // Monthly revenue
        const monthTransactions = await prisma.transaction.findMany({
            where: { date: { gte: monthStart, lt: monthEnd } },
        });
        const monthRevenue = monthTransactions.reduce(
            (sum, t) => sum + Number(t.totalAmount),
            0
        );

        // Monthly expenses
        const monthExpenses = await prisma.expense.findMany({
            where: { date: { gte: monthStart, lt: monthEnd } },
        });
        const monthExpenseTotal = monthExpenses.reduce(
            (sum, e) => sum + Number(e.amount),
            0
        );

        // Today's appointments
        const todayAppointments = await prisma.appointment.count({
            where: { date: { gte: todayStart, lt: todayEnd } },
        });

        // Today's customers (distinct from transactions)
        const todayCustomers = todayTransactions.length;

        // Upcoming appointments (today + future, not cancelled)
        const upcomingAppointments = await prisma.appointment.findMany({
            where: {
                date: { gte: todayStart },
                status: { not: "CANCELLED" },
            },
            include: { service: true },
            orderBy: [{ date: "asc" }, { time: "asc" }],
            take: 5,
        });

        // Recent transactions
        const recentTransactions = await prisma.transaction.findMany({
            include: {
                items: { include: { service: true } },
            },
            orderBy: { date: "desc" },
            take: 5,
        });

        return NextResponse.json({
            todayRevenue,
            monthRevenue,
            monthExpenseTotal,
            todayAppointments,
            todayCustomers,
            upcomingAppointments,
            recentTransactions,
        });
    } catch (error) {
        console.error("GET /api/dashboard error:", error);
        return NextResponse.json(
            { error: "ไม่สามารถดึงข้อมูล Dashboard ได้" },
            { status: 500 }
        );
    }
}
