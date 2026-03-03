import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        if (!Array.isArray(body)) {
            return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
        }

        // body should be an array of { id: string, order: number }
        const updatePromises = body.map((item: { id: string; order: number }) =>
            prisma.serviceItem.update({
                where: { id: item.id },
                data: { order: item.order },
            })
        );

        await prisma.$transaction(updatePromises);

        return NextResponse.json({ message: "อัปเดตลำดับข้อมูลบริการสำเร็จ" });
    } catch (error) {
        console.error("PUT /api/services/reorder error:", error);
        return NextResponse.json(
            { error: "ไม่สามารถอัปเดตลำดับรายการบริการได้" },
            { status: 500 }
        );
    }
}
