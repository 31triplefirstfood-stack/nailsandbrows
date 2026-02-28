import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const dateParam = searchParams.get("date");
        const currentDate = dateParam ? new Date(dateParam) : new Date();

        console.log("Checking monthly expenses for date:", currentDate.toISOString());

        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);

        // Check if the fixed expenses for this month have already been created.
        // We'll check for "ค่าเช่าร้าน" within the current month.
        const existingRent = await prisma.expense.findFirst({
            where: {
                description: "ค่าเช่าร้าน",
                date: {
                    gte: startOfMonth,
                    lte: endOfMonth,
                },
            },
        });

        if (existingRent) {
            return NextResponse.json({ message: "Monthly expenses already generated for this month." }, { status: 200 });
        }

        // Generate the fixed expenses
        const fixedExpenses = [
            { description: "ค่าเช่าร้าน", amount: 15000, category: "รายจ่ายคงที่" },
            { description: "ค่าเน็ต", amount: 350, category: "รายจ่ายคงที่" },
            { description: "ค่าเครื่องรูดการ์ด", amount: 300, category: "รายจ่ายคงที่" },
            { description: "ขยะ", amount: 50, category: "รายจ่ายคงที่" },
        ];

        // Format dates correctly depending on what day we want it to show (1st of the month)
        // Ensure that it's just recorded for the first of the month
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1, 12, 0, 0);

        await prisma.expense.createMany({
            data: fixedExpenses.map((expense) => ({
                description: expense.description,
                amount: expense.amount,
                category: expense.category,
                date: firstDayOfMonth,
            })),
        });

        return NextResponse.json({ message: "Monthly expenses generated successfully.", count: fixedExpenses.length }, { status: 201 });
    } catch (error) {
        console.error("Error generating monthly expenses:", error);
        return NextResponse.json({ error: "Failed to generate monthly expenses", details: String(error) }, { status: 500 });
    }
}
