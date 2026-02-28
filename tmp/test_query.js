const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const targetYear = 2026;
    const targetMonth = 1; // February (0-indexed)

    const monthStart = new Date(Date.UTC(targetYear, targetMonth, 0, 17, 0, 0, 0));
    const monthEnd = new Date(Date.UTC(targetYear, targetMonth + 1, 0, 17, 0, 0, 0));

    console.log("Querying between:", monthStart.toISOString(), "and", monthEnd.toISOString());

    const txs = await prisma.transaction.findMany({
        where: { date: { gte: monthStart, lt: monthEnd } },
    });

    const expenses = await prisma.expense.findMany({
        where: { date: { gte: monthStart, lt: monthEnd } },
    });

    console.log("Found DX:", txs.length);
    console.log("Found EX:", expenses.length);

    console.log("Total DX sum:", txs.reduce((sum, t) => sum + Number(t.totalAmount), 0));
    console.log("Total EX sum:", expenses.reduce((sum, e) => sum + Number(e.amount), 0));
}

main().catch(console.error).finally(() => prisma.$disconnect());
