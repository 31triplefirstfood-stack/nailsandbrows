import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    await prisma.user.create({
        data: {
            name: "พนักงาน น้ำ",
            email: "nam@nailsandbrows.com",
            password: "$2b$10$dummyhashforseeding1234567890",
            role: "STAFF",
            salary: 15000,
            commissionRate: 10,
        },
    });

    await prisma.user.create({
        data: {
            name: "พนักงาน ฟ้า",
            email: "fah@nailsandbrows.com",
            password: "$2b$10$dummyhashforseeding1234567890",
            role: "STAFF",
            salary: 18000,
            commissionRate: 15,
        },
    });
    console.log("2 employees added");
}

main().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
