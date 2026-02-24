import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { ServiceSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

// GET single service
export async function GET(_request: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const service = await prisma.serviceItem.findUnique({ where: { id } });

        if (!service) {
            return NextResponse.json(
                { error: "ไม่พบรายการบริการ" },
                { status: 404 }
            );
        }

        return NextResponse.json(service);
    } catch (error) {
        console.error("GET /api/services/[id] error:", error);
        return NextResponse.json(
            { error: "ไม่สามารถดึงข้อมูลบริการได้" },
            { status: 500 }
        );
    }
}

// PUT update service
export async function PUT(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const body = await request.json();

        const parsed = ServiceSchema.partial().safeParse(body);
        if (!parsed.success) {
            const message = parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง";
            return NextResponse.json({ error: message }, { status: 400 });
        }

        const { name, category, price, durationMinutes } = parsed.data;
        // Extract isActive manually since it's not in the base schema
        const isActive = body.isActive !== undefined ? Boolean(body.isActive) : undefined;

        const service = await prisma.serviceItem.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(category !== undefined && { category }),
                ...(price !== undefined && { price }),
                ...(durationMinutes !== undefined && { durationMinutes }),
                ...(isActive !== undefined && { isActive }),
            },
        });

        return NextResponse.json(service);
    } catch (error) {
        console.error("PUT /api/services/[id] error:", error);
        return NextResponse.json(
            { error: "ไม่สามารถอัปเดตรายการบริการได้" },
            { status: 500 }
        );
    }
}

// DELETE service
export async function DELETE(_request: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        await prisma.serviceItem.delete({ where: { id } });
        return NextResponse.json({ message: "ลบรายการบริการสำเร็จ" });
    } catch (error) {
        console.error("DELETE /api/services/[id] error:", error);
        return NextResponse.json(
            { error: "ไม่สามารถลบรายการบริการได้" },
            { status: 500 }
        );
    }
}
