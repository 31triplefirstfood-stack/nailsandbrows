import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    const { pin } = await req.json();

    // Check DB first, fall back to env
    let correctPin = process.env.PAGE_PIN || "1234";
    try {
        const settings = await prisma.systemSettings.findFirst();
        if (settings?.pagePin) {
            correctPin = settings.pagePin;
        }
    } catch {
        // DB not available, use env
    }

    return NextResponse.json({ ok: pin === correctPin });
}
