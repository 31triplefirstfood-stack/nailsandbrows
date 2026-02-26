import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        let settings = await prisma.systemSettings.findFirst();

        if (!settings) {
            settings = await prisma.systemSettings.create({
                data: {
                    storeName: "Nails & Brows",
                    dailyTarget: 1000,
                    monthlyTarget: 30000,
                },
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error("Error fetching settings:", error);
        return NextResponse.json(
            { error: "Failed to fetch settings" },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json();
        const { storeName, storeLogo, dailyTarget, monthlyTarget } = data;

        let settings = await prisma.systemSettings.findFirst();

        if (settings) {
            settings = await prisma.systemSettings.update({
                where: { id: settings.id },
                data: {
                    storeName,
                    storeLogo,
                    dailyTarget,
                    monthlyTarget,
                },
            });
        } else {
            settings = await prisma.systemSettings.create({
                data: {
                    storeName,
                    storeLogo,
                    dailyTarget,
                    monthlyTarget,
                },
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error("Error updating settings:", error);
        return NextResponse.json(
            { error: "Failed to update settings" },
            { status: 500 }
        );
    }
}
