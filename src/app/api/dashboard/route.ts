import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET dashboard summary data
export const dynamic = "force-dynamic"; // Force dynamic execution on Vercel

export async function GET() {
    try {
        // Vercel server runs in UTC. We need to calculate start of today/month
        // for "Asia/Bangkok" (UTC+7) in proper UTC timestamps for Prisma query.
        const nowUtc = new Date();
        const bkkString = nowUtc.toLocaleString("en-US", { timeZone: "Asia/Bangkok" });
        const bkkDate = new Date(bkkString);

        const bkkYear = bkkDate.getFullYear();
        const bkkMonth = bkkDate.getMonth();
        const bkkDay = bkkDate.getDate();

        // 00:00 BKK is 17:00 UTC of the previous day
        const todayStart = new Date(Date.UTC(bkkYear, bkkMonth, bkkDay - 1, 17, 0, 0, 0));
        const todayEnd = new Date(Date.UTC(bkkYear, bkkMonth, bkkDay, 17, 0, 0, 0));

        // Start of this month in BKK (1st day 00:00) is 17:00 UTC of the previous month's last day
        const monthStart = new Date(Date.UTC(bkkYear, bkkMonth, 0, 17, 0, 0, 0));
        // Start of next month in BKK
        const monthEnd = new Date(Date.UTC(bkkYear, bkkMonth + 1, 0, 17, 0, 0, 0));

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
