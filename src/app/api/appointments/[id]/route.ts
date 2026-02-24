import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { AppointmentSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

// GET single appointment
export async function GET(_request: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: { service: true },
        });

        if (!appointment) {
            return NextResponse.json(
                { error: "ไม่พบนัดหมาย" },
                { status: 404 }
            );
        }

        return NextResponse.json(appointment);
    } catch (error) {
        console.error("GET /api/appointments/[id] error:", error);
        return NextResponse.json(
            { error: "ไม่สามารถดึงข้อมูลนัดหมายได้" },
            { status: 500 }
        );
    }
}

// PUT update appointment
export async function PUT(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const body = await request.json();

        const parsed = AppointmentSchema.partial().safeParse(body);
        if (!parsed.success) {
            const message = parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง";
            return NextResponse.json({ error: message }, { status: 400 });
        }

        const { customerName, phone, serviceId, date, time, status, notes } = parsed.data;

        const appointment = await prisma.appointment.update({
            where: { id },
            data: {
                ...(customerName !== undefined && { customerName }),
                ...(phone !== undefined && { phone }),
                ...(serviceId !== undefined && { serviceId }),
                ...(date !== undefined && { date: new Date(date) }),
                ...(time !== undefined && { time }),
                ...(status !== undefined && { status }),
                ...(notes !== undefined && { notes }),
            },
            include: { service: true },
        });

        return NextResponse.json(appointment);
    } catch (error) {
        console.error("PUT /api/appointments/[id] error:", error);
        return NextResponse.json(
            { error: "ไม่สามารถอัปเดตนัดหมายได้" },
            { status: 500 }
        );
    }
}

// DELETE appointment
export async function DELETE(_request: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        await prisma.appointment.delete({ where: { id } });
        return NextResponse.json({ message: "ลบนัดหมายสำเร็จ" });
    } catch (error) {
        console.error("DELETE /api/appointments/[id] error:", error);
        return NextResponse.json(
            { error: "ไม่สามารถลบนัดหมายได้" },
            { status: 500 }
        );
    }
}
