import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        let whereClause = {};

        if (startDate && endDate) {
            whereClause = {
                date: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
            };
        }

        const appointments = await prisma.appointment.findMany({
            where: whereClause,
            include: {
                service: true,
            },
            orderBy: {
                date: "desc",
            },
        });

        // Generate CSV content
        const bom = "\uFEFF"; // BOM for Excel UTF-8 compatibility
        let csvContent = bom + "Date,Time,Customer Name,Phone,Service,Status,Notes\n";

        appointments.forEach((appt) => {
            const date = format(new Date(appt.date), "yyyy-MM-dd");
            const time = appt.time;
            const customer = `"${appt.customerName.replace(/"/g, '""')}"`;
            const phone = appt.phone ? `"${appt.phone.replace(/"/g, '""')}"` : "-";
            const serviceName = `"${appt.service.name.replace(/"/g, '""')}"`;
            const status = appt.status;
            const notes = appt.notes ? `"${appt.notes.replace(/"/g, '""')}"` : "-";

            csvContent += `${date},${time},${customer},${phone},${serviceName},${status},${notes}\n`;
        });

        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="appointments_export_${format(new Date(), "yyyyMMdd")}.csv"`,
            },
        });
    } catch (error) {
        console.error("Error exporting appointments:", error);
        return NextResponse.json(
            { error: "Failed to export appointments" },
            { status: 500 }
        );
    }
}
