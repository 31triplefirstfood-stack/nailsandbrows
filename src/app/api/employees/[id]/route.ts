import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const employeeUpdateSchema = z.object({
    name: z.string().min(1, "กรุณากรอกชื่อพนักงาน").optional(),
    startDate: z.string().optional(),
    salary: z.coerce.number().optional().nullable(),
    commissionRate: z.coerce.number().optional().nullable(),
});

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;
        const body = await request.json();
        const validatedData = employeeUpdateSchema.parse(body);

        const updatedEmployee = await prisma.user.update({
            where: {
                id,
            },
            data: {
                ...(validatedData.name && { name: validatedData.name }),
                ...(validatedData.startDate && { startDate: new Date(validatedData.startDate) }),
                ...(validatedData.salary !== undefined && { salary: validatedData.salary }),
                ...(validatedData.commissionRate !== undefined && { commissionRate: validatedData.commissionRate }),
            },
            select: {
                id: true,
                name: true,
                role: true,
                startDate: true,
                salary: true,
                commissionRate: true,
                createdAt: true,
            }
        });

        return NextResponse.json(updatedEmployee);
    } catch (error) {
        console.error("PUT /api/employees/[id] error:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: (error as any).errors[0].message },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: "ไม่สามารถอัปเดตข้อมูลพนักงานได้" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;

        await prisma.user.delete({
            where: {
                id,
            },
        });

        return NextResponse.json({ message: "ลบพนักงานสำเร็จ" });
    } catch (error) {
        console.error("DELETE /api/employees/[id] error:", error);
        return NextResponse.json(
            { error: "ไม่สามารถลบพนักงานได้ หรือมีข้อมูลที่เกี่ยวข้องอยู่" },
            { status: 500 }
        );
    }
}
