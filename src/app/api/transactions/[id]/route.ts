import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

// GET single transaction
export async function GET(_request: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const transaction = await prisma.transaction.findUnique({
            where: { id },
            include: {
                items: {
                    include: { service: true },
                },
            },
        });

        if (!transaction) {
            return NextResponse.json(
                { error: "ไม่พบรายการขาย" },
                { status: 404 }
            );
        }

        return NextResponse.json(transaction);
    } catch (error) {
        console.error("GET /api/transactions/[id] error:", error);
        return NextResponse.json(
            { error: "ไม่สามารถดึงข้อมูลรายการขายได้" },
            { status: 500 }
        );
    }
}

// DELETE transaction
export async function DELETE(_request: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        await prisma.transaction.delete({ where: { id } });
        return NextResponse.json({ message: "ลบรายการขายสำเร็จ" });
    } catch (error) {
        console.error("DELETE /api/transactions/[id] error:", error);
        return NextResponse.json(
            { error: "ไม่สามารถลบรายการขายได้" },
            { status: 500 }
        );
    }
}
