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

        const transactions = await prisma.transaction.findMany({
            where: whereClause,
            include: {
                items: {
                    include: {
                        service: true,
                    },
                },
            },
            orderBy: {
                date: "desc",
            },
        });

        // Generate CSV content
        const bom = "\uFEFF"; // BOM for Excel UTF-8 compatibility
        let csvContent = bom + "Date,Customer Name,Payment Method,Total Amount,Items\n";

        transactions.forEach((tx) => {
            const date = format(new Date(tx.date), "yyyy-MM-dd HH:mm:ss");
            const customer = `"${tx.customerName.replace(/"/g, '""')}"`;
            const method = tx.paymentMethod;
            const amount = tx.totalAmount.toString();

            const itemsList = tx.items
                .map((item) => `${item.service.name} (x${item.quantity})`)
                .join("; ");
            const items = `"${itemsList.replace(/"/g, '""')}"`;

            csvContent += `${date},${customer},${method},${amount},${items}\n`;
        });

        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="transactions_export_${format(new Date(), "yyyyMMdd")}.csv"`,
            },
        });
    } catch (error) {
        console.error("Error exporting transactions:", error);
        return NextResponse.json(
            { error: "Failed to export transactions" },
            { status: 500 }
        );
    }
}
