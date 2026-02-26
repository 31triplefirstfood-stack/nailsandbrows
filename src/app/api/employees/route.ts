import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const employeeSchema = z.object({
    name: z.string().min(1, "กรุณากรอกชื่อพนักงาน"),
    role: z.enum(["STAFF", "ADMIN"]),
});

export async function GET() {
    try {
        const employees = await prisma.user.findMany({
            where: {
                role: { in: ["STAFF", "ADMIN"] },
            },
            select: {
                id: true,
                name: true,
                role: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(employees);
    } catch (error) {
        console.error("GET /api/employees error:", error);
        return NextResponse.json(
            { error: "ไม่สามารถดึงข้อมูลพนักงานได้" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validatedData = employeeSchema.parse(body);

        // Auto-generate email and password since they are no longer required in the UI
        const randomId = Math.floor(Math.random() * 1000000);
        const autoEmail = `staff_${randomId}@nailpos.local`;
        const autoPassword = `staff_pass_${randomId}`;

        const newEmployee = await prisma.user.create({
            data: {
                name: validatedData.name,
                email: autoEmail,
                password: autoPassword,
                role: validatedData.role,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            }
        });

        return NextResponse.json(newEmployee, { status: 201 });
    } catch (error) {
        console.error("POST /api/employees error:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: (error as any).errors[0].message },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: "ไม่สามารถเพิ่มพนักงานได้" },
            { status: 500 }
        );
    }
}
