import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    console.log("Adding transactions for new employees...");

    const services = await prisma.serviceItem.findMany();

    const eyelashExtensionService = services.find(s => s.name === "Eyelash extension 1500") || services[0];
    const spaPediService = services.find(s => s.name === "Spa Pedi") || services[0];
    const plainPolishService = services.find(s => s.name === "+ Plain Nails Polish") || services[0];
    const gelPolishService = services.find(s => s.name === "+ Gel Nails Polish") || services[0];

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    await prisma.transaction.create({
        data: {
            employeeName: "พนักงาน ฟ้า",
            customerName: "คุณสมหญิง",
            totalAmount: 1500,
            paymentMethod: "CREDIT_CARD",
            description: "ต่อขนตา",
            date: today,
            items: { create: [{ serviceId: eyelashExtensionService.id, quantity: 1, price: 1500 }] }
        },
    });

    await prisma.transaction.create({
        data: {
            employeeName: "พนักงาน น้ำ",
            customerName: "คุณพรนภา",
            totalAmount: 400,
            paymentMethod: "CASH",
            description: "สปาเท้า",
            date: today,
            items: { create: [{ serviceId: spaPediService.id, quantity: 1, price: 400 }] }
        },
    });

    await prisma.transaction.create({
        data: {
            employeeName: "พนักงาน ฟ้า",
            customerName: "คุณนลิน",
            totalAmount: 850,
            paymentMethod: "TRANSFER",
            description: "ต่อเล็บเจล + ทาสี",
            date: yesterday,
            items: {
                create: [
                    { serviceId: plainPolishService.id, quantity: 1, price: 650 },
                    { serviceId: gelPolishService.id, quantity: 1, price: 200 }
                ]
            }
        },
    });

    console.log("3 transactions added.");
}

main().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
