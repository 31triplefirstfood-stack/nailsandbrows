import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
    try {
        const { currentPin, newPin } = await req.json();

        if (!newPin || newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
            return NextResponse.json(
                { error: "PIN ต้องเป็นตัวเลข 4 หลัก" },
                { status: 400 }
            );
        }

        // Verify current PIN
        let correctPin = process.env.PAGE_PIN || "1234";
        const settings = await prisma.systemSettings.findFirst();
        if (settings?.pagePin) {
            correctPin = settings.pagePin;
        }

        if (currentPin !== correctPin) {
            return NextResponse.json(
                { error: "รหัส PIN ปัจจุบันไม่ถูกต้อง" },
                { status: 403 }
            );
        }

        // Update PIN in DB
        if (settings) {
            await prisma.systemSettings.update({
                where: { id: settings.id },
                data: { pagePin: newPin },
            });
        } else {
            await prisma.systemSettings.create({
                data: { pagePin: newPin },
            });
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Error changing PIN:", error);
        return NextResponse.json(
            { error: "ไม่สามารถเปลี่ยน PIN ได้" },
            { status: 500 }
        );
    }
}
