import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { ServiceSchema } from "@/lib/validations";

// GET all services
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category");
        const activeOnly = searchParams.get("active");

        const where: Record<string, unknown> = {};
        if (category) where.category = category;
        if (activeOnly === "true") where.isActive = true;

        const services = await prisma.serviceItem.findMany({
            where,
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(services);
    } catch (error) {
        console.error("GET /api/services error:", error);
        return NextResponse.json(
            { error: "ไม่สามารถดึงข้อมูลบริการได้" },
            { status: 500 }
        );
    }
}

// POST create a new service
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = ServiceSchema.safeParse(body);
        if (!parsed.success) {
            const message = parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง";
            return NextResponse.json({ error: message }, { status: 400 });
        }
        const { name, category, price, durationMinutes } = parsed.data;
        const service = await prisma.serviceItem.create({
            data: { name, category, price, durationMinutes },
        });
        return NextResponse.json(service, { status: 201 });
    } catch (error) {
        console.error("POST /api/services error:", error);
        return NextResponse.json({ error: "ไม่สามารถสร้างรายการบริการได้" }, { status: 500 });
    }
}
