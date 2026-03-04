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

        const expenses = await prisma.expense.findMany({
            where: whereClause,
            orderBy: {
                date: "desc",
            },
        });

        // Generate CSV content
        const bom = "\uFEFF"; // BOM for Excel UTF-8 compatibility
        let csvContent = bom + "Date,Amount,Category,Description\n";

        expenses.forEach((expense) => {
            const date = format(new Date(expense.date), "yyyy-MM-dd HH:mm:ss");
            const amount = expense.amount.toString();
            const category = `"${expense.category.replace(/"/g, '""')}"`;
            const description = `"${expense.description.replace(/"/g, '""')}"`;

            csvContent += `${date},${amount},${category},${description}\n`;
        });

        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="expenses_export_${format(new Date(), "yyyyMMdd")}.csv"`,
            },
        });
    } catch (error) {
        console.error("Error exporting expenses:", error);
        return NextResponse.json(
            { error: "Failed to export expenses" },
            { status: 500 }
        );
    }
}
