import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { ExpenseSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

// GET single expense
export async function GET(_request: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const expense = await prisma.expense.findUnique({ where: { id } });

        if (!expense) {
            return NextResponse.json(
                { error: "ไม่พบรายจ่าย" },
                { status: 404 }
            );
        }

        return NextResponse.json(expense);
    } catch (error) {
        console.error("GET /api/expenses/[id] error:", error);
        return NextResponse.json(
            { error: "ไม่สามารถดึงข้อมูลรายจ่ายได้" },
            { status: 500 }
        );
    }
}

// PUT update expense
export async function PUT(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const body = await request.json();

        const parsed = ExpenseSchema.partial().safeParse(body);
        if (!parsed.success) {
            const message = parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง";
            return NextResponse.json({ error: message }, { status: 400 });
        }

        const { amount, description, category, date } = parsed.data;

        const expense = await prisma.expense.update({
            where: { id },
            data: {
                ...(amount !== undefined && { amount }),
                ...(description !== undefined && { description }),
                ...(category !== undefined && { category }),
                ...(date !== undefined && { date: new Date(date) }),
            },
        });

        return NextResponse.json(expense);
    } catch (error) {
        console.error("PUT /api/expenses/[id] error:", error);
        return NextResponse.json(
            { error: "ไม่สามารถอัปเดตรายจ่ายได้" },
            { status: 500 }
        );
    }
}

// DELETE expense
export async function DELETE(_request: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        await prisma.expense.delete({ where: { id } });
        return NextResponse.json({ message: "ลบรายจ่ายสำเร็จ" });
    } catch (error) {
        console.error("DELETE /api/expenses/[id] error:", error);
        return NextResponse.json(
            { error: "ไม่สามารถลบรายจ่ายได้" },
            { status: 500 }
        );
    }
}
