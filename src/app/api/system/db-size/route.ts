import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const result: any = await prisma.$queryRaw`SELECT pg_database_size(current_database()) as size_bytes;`;

        // แปลงเป็นตัวเลข (bytes)
        const usedBytes = Number(result[0]?.size_bytes) || 0;

        // กำหนด ขนาดพื้นที่สูงสุดของฐานข้อมูล (ตัวอย่าง: 500MB สำหรับ Free Tier)
        // สามารถตั้งค่าผ่าน .env ได้ เช่น DATABASE_MAX_SIZE_MB=1024
        const maxMb = parseInt(process.env.DATABASE_MAX_SIZE_MB || "500", 10);
        const maxBytes = maxMb * 1024 * 1024;

        const remainingBytes = Math.max(0, maxBytes - usedBytes);

        return NextResponse.json({
            usedBytes,
            maxBytes,
            remainingBytes
        });
    } catch (error) {
        console.error("Error fetching DB size:", error);
        return NextResponse.json({ usedBytes: 0, maxBytes: 500 * 1024 * 1024, remainingBytes: 0 }, { status: 500 });
    }
}
