import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET dashboard summary data
export const dynamic = "force-dynamic"; // Force dynamic execution on Vercel

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const yearParam = searchParams.get("year");
        const monthParam = searchParams.get("month");

        // Vercel server runs in UTC. We need to calculate start of today/month
        // for "Asia/Bangkok" (UTC+7) in proper UTC timestamps for Prisma query.
        const nowUtc = new Date();
        const bkkString = nowUtc.toLocaleString("en-US", { timeZone: "Asia/Bangkok" });
        const bkkDate = new Date(bkkString);

        const currentBkkYear = bkkDate.getFullYear();
        const currentBkkMonth = bkkDate.getMonth();
        const currentBkkDay = bkkDate.getDate();

        let targetYear = yearParam ? parseInt(yearParam, 10) : currentBkkYear;
        if (targetYear > 2500) targetYear -= 543; // Convert BE back to AD for DB query

        const targetMonth = monthParam ? parseInt(monthParam, 10) : currentBkkMonth;

        // Is target month currently active? (for today calculations)
        const isCurrentMonth = targetYear === currentBkkYear && targetMonth === currentBkkMonth;

        // 00:00 BKK is 17:00 UTC of the previous day
        const todayStart = isCurrentMonth
            ? new Date(Date.UTC(currentBkkYear, currentBkkMonth, currentBkkDay - 1, 17, 0, 0, 0))
            : new Date(Date.UTC(targetYear, targetMonth, 0, 17, 0, 0, 0)); // End of target month for past months

        const todayEnd = isCurrentMonth
            ? new Date(Date.UTC(currentBkkYear, currentBkkMonth, currentBkkDay, 17, 0, 0, 0))
            : new Date(Date.UTC(targetYear, targetMonth + 1, 0, 17, 0, 0, 0));

        // Start of target month in BKK (1st day 00:00) is 17:00 UTC of the previous month's last day
        const monthStart = new Date(Date.UTC(targetYear, targetMonth, 0, 17, 0, 0, 0));
        // Start of next month in BKK
        const monthEnd = new Date(Date.UTC(targetYear, targetMonth + 1, 0, 17, 0, 0, 0));

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

        // Today's employees
        const todayEmployees = await prisma.user.findMany({
            where: {
                role: { in: ["STAFF", "ADMIN"] },
            },
            select: {
                id: true,
                name: true,
                role: true,
            },
        });

        return NextResponse.json({
            todayRevenue,
            monthlyRevenue: monthRevenue,
            monthlyExpenses: monthExpenseTotal,
            todayAppointments,
            todayCustomers,
            upcomingAppointments,
            recentTransactions,
            todayEmployees,
        });
    } catch (error) {
        console.error("GET /api/dashboard error:", error);
        return NextResponse.json(
            { error: "ไม่สามารถดึงข้อมูล Dashboard ได้" },
            { status: 500 }
        );
    }
}
