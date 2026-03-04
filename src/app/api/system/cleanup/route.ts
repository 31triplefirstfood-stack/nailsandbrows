import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        if (!startDate || !endDate) {
            return NextResponse.json(
                { error: "กรุณาระบุวันที่เริ่มต้นและสิ้นสุด" },
                { status: 400 }
            );
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        // Adjust end date to include the whole day if it's just a date
        if (endDate.length <= 10) {
            end.setHours(23, 59, 59, 999);
        }

        // Delete Transactions (Cascades to TransactionItems)
        const deleteTransactions = prisma.transaction.deleteMany({
            where: {
                date: {
                    gte: start,
                    lte: end,
                },
            },
        });

        // Delete Expenses
        const deleteExpenses = prisma.expense.deleteMany({
            where: {
                date: {
                    gte: start,
                    lte: end,
                },
            },
        });

        // Delete Appointments
        const deleteAppointments = prisma.appointment.deleteMany({
            where: {
                date: {
                    gte: start,
                    lte: end,
                },
            },
        });

        // Run all deletions in a transaction
        const result = await prisma.$transaction([
            deleteTransactions,
            deleteExpenses,
            deleteAppointments,
        ]);

        return NextResponse.json({
            message: "ลบข้อมูลสำเร็จ",
            deletedTransactions: result[0].count,
            deletedExpenses: result[1].count,
            deletedAppointments: result[2].count,
        });

    } catch (error) {
        console.error("Cleanup API Error:", error);
        return NextResponse.json(
            { error: "เกิดข้อผิดพลาดในการลบข้อมูล" },
            { status: 500 }
        );
    }
}
