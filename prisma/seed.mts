import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 เริ่มต้น Seeding ข้อมูล...");

    // Clean existing data
    await prisma.transactionItem.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.expense.deleteMany();
    await prisma.serviceItem.deleteMany();
    await prisma.user.deleteMany();
    console.log("🧹 ลบข้อมูลเก่าเรียบร้อย");

    // Admin User
    const admin = await prisma.user.create({
        data: { name: "ผู้ดูแลระบบ", email: "admin@nailsandbrows.com", password: "$2b$10$dummyhashforseeding1234567890", role: "ADMIN" },
    });
    console.log(`✅ สร้างผู้ใช้: ${admin.name}`);

    await prisma.user.create({
        data: { name: "พนักงาน สมศรี", email: "staff@nailsandbrows.com", password: "$2b$10$dummyhashforseeding1234567890", role: "STAFF" },
    });
    console.log("✅ สร้างผู้ใช้: พนักงาน สมศรี");

    // Service Items
    const services = await Promise.all([
        // Nails
        prisma.serviceItem.create({ data: { name: "Spa Medi", category: "NAILS", price: 300, durationMinutes: 60 } }),
        prisma.serviceItem.create({ data: { name: "Spa Pedi", category: "NAILS", price: 400, durationMinutes: 60 } }),
        prisma.serviceItem.create({ data: { name: "Spa Medi+Pedi", category: "NAILS", price: 700, durationMinutes: 120 } }),
        prisma.serviceItem.create({ data: { name: "+ Plain Nails Polish", category: "NAILS", price: 200, durationMinutes: 30 } }),
        prisma.serviceItem.create({ data: { name: "+ Gel Nails Polish", category: "NAILS", price: 200, durationMinutes: 45 } }),
        prisma.serviceItem.create({ data: { name: "Gel, regular Nails Polish", category: "NAILS", price: 300, durationMinutes: 60 } }),
        prisma.serviceItem.create({ data: { name: "Gel Nails + Painting", category: "NAILS", price: 400, durationMinutes: 90 } }),
        prisma.serviceItem.create({ data: { name: "Cut nail", category: "NAILS", price: 200, durationMinutes: 30 } }),
        prisma.serviceItem.create({ data: { name: "Remove Gel 50", category: "NAILS", price: 50, durationMinutes: 15 } }),
        prisma.serviceItem.create({ data: { name: "Remove Gel 100", category: "NAILS", price: 100, durationMinutes: 30 } }),
        prisma.serviceItem.create({ data: { name: "Gel Extension 700", category: "NAILS", price: 700, durationMinutes: 120 } }),
        prisma.serviceItem.create({ data: { name: "Gel Extension 800", category: "NAILS", price: 800, durationMinutes: 120 } }),
        prisma.serviceItem.create({ data: { name: "Gel Extension 900", category: "NAILS", price: 900, durationMinutes: 120 } }),
        prisma.serviceItem.create({ data: { name: "Extensions+Design 1000", category: "NAILS", price: 1000, durationMinutes: 150 } }),
        prisma.serviceItem.create({ data: { name: "Extensions+Design 1100", category: "NAILS", price: 1100, durationMinutes: 150 } }),
        prisma.serviceItem.create({ data: { name: "Refill", category: "NAILS", price: 600, durationMinutes: 90 } }),
        prisma.serviceItem.create({ data: { name: "Paint", category: "NAILS", price: 100, durationMinutes: 30 } }),
        prisma.serviceItem.create({ data: { name: "Gel nails polish 500", category: "NAILS", price: 500, durationMinutes: 60 } }),
        prisma.serviceItem.create({ data: { name: "Cut nails trim cuticle", category: "NAILS", price: 200, durationMinutes: 45 } }),
        prisma.serviceItem.create({ data: { name: "Remove Lash", category: "NAILS", price: 200, durationMinutes: 30 } }),

        // Eyelash
        prisma.serviceItem.create({ data: { name: "Waxing", category: "EYELASH", price: 200, durationMinutes: 30 } }),
        prisma.serviceItem.create({ data: { name: "Tinting", category: "EYELASH", price: 250, durationMinutes: 30 } }),
        prisma.serviceItem.create({ data: { name: "Waxing + Tinting", category: "EYELASH", price: 450, durationMinutes: 60 } }),
        prisma.serviceItem.create({ data: { name: "Tinting + Brows + Lash + ...", category: "EYELASH", price: 700, durationMinutes: 90 } }),
        prisma.serviceItem.create({ data: { name: "Lifting Brows or Lash", category: "EYELASH", price: 800, durationMinutes: 90 } }),
        prisma.serviceItem.create({ data: { name: "++ Other++ 100", category: "EYELASH", price: 100, durationMinutes: 30 } }),
        prisma.serviceItem.create({ data: { name: "++ Other++ 150", category: "EYELASH", price: 150, durationMinutes: 30 } }),
        prisma.serviceItem.create({ data: { name: "Refill Lash 700", category: "EYELASH", price: 700, durationMinutes: 90 } }),
        prisma.serviceItem.create({ data: { name: "Refill Lash 800", category: "EYELASH", price: 800, durationMinutes: 90 } }),
        prisma.serviceItem.create({ data: { name: "Eyelash extension 1000", category: "EYELASH", price: 1000, durationMinutes: 120 } }),
        prisma.serviceItem.create({ data: { name: "Eyelash extension 1100", category: "EYELASH", price: 1100, durationMinutes: 120 } }),
        prisma.serviceItem.create({ data: { name: "Eyelash extension 1200", category: "EYELASH", price: 1200, durationMinutes: 120 } }),
        prisma.serviceItem.create({ data: { name: "Eyelash extension 1300", category: "EYELASH", price: 1300, durationMinutes: 120 } }),
        prisma.serviceItem.create({ data: { name: "Eyelash extension 1400", category: "EYELASH", price: 1400, durationMinutes: 150 } }),
        prisma.serviceItem.create({ data: { name: "Eyelash extension 1500", category: "EYELASH", price: 1500, durationMinutes: 150 } }),
        prisma.serviceItem.create({ data: { name: "Remove Eyelash 300", category: "EYELASH", price: 300, durationMinutes: 45 } }),
        prisma.serviceItem.create({ data: { name: "Remove Eyelash 100", category: "EYELASH", price: 100, durationMinutes: 30 } }),

        // Permanent Makeup
        prisma.serviceItem.create({ data: { name: "Permanent Makeup without touch up", category: "PERMANENT_MAKEUP", price: 4000, durationMinutes: 180 } }),
        prisma.serviceItem.create({ data: { name: "Permanent Makeup", category: "PERMANENT_MAKEUP", price: 3000, durationMinutes: 180 } }),
        prisma.serviceItem.create({ data: { name: "Retouch Permanent makeup", category: "PERMANENT_MAKEUP", price: 1500, durationMinutes: 120 } }),
        prisma.serviceItem.create({ data: { name: "Lip Permanent", category: "PERMANENT_MAKEUP", price: 4000, durationMinutes: 180 } }),
        prisma.serviceItem.create({ data: { name: "Deposit", category: "PERMANENT_MAKEUP", price: 1000, durationMinutes: 30 } }),

        // Course Study
        prisma.serviceItem.create({ data: { name: "Full Semi Permanent Makeup", category: "COURSE_STUDY", price: 20000, durationMinutes: 1440 } }),
        prisma.serviceItem.create({ data: { name: "Class Nails", category: "COURSE_STUDY", price: 6000, durationMinutes: 1440 } }),
    ]);
    console.log(`✅ สร้างรายการบริการ ${services.length} รายการ`);

    // Sample Appointments
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await Promise.all([
        prisma.appointment.create({ data: { customerName: "คุณมะลิ", phone: "081-234-5678", serviceId: services[20].id, date: today, time: "10:00", status: "CONFIRMED" } }),
        prisma.appointment.create({ data: { customerName: "คุณกุหลาบ", phone: "089-876-5432", serviceId: services[5].id, date: today, time: "13:30", status: "PENDING" } }),
        prisma.appointment.create({ data: { customerName: "คุณจัสมิน", phone: "092-111-2222", serviceId: services[0].id, date: tomorrow, time: "11:00", status: "PENDING" } }),
        prisma.appointment.create({ data: { customerName: "คุณดาว", phone: "062-333-4444", serviceId: services[38].id, date: tomorrow, time: "14:00", status: "CONFIRMED" } }),
    ]);
    console.log(`✅ สร้างนัดหมาย ${appointments.length} รายการ`);

    // Sample Transactions
    await prisma.transaction.create({
        data: {
            employeeName: "พนักงาน สมศรี",
            customerName: "คุณหญิง", totalAmount: 1100, paymentMethod: "CASH", description: "ทาเล็บเจล + ต่อเล็บเจล", date: today,
            items: { create: [{ serviceId: services[0].id, quantity: 1, price: 300 }, { serviceId: services[11].id, quantity: 1, price: 800 }] }
        },
    });
    await prisma.transaction.create({
        data: {
            employeeName: "พนักงาน สมศรี",
            customerName: "คุณน้ำ", totalAmount: 3000, paymentMethod: "TRANSFER", description: "ฝังสีคิ้ว", date: today,
            items: { create: [{ serviceId: services[38].id, quantity: 1, price: 3000 }] }
        },
    });
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    await prisma.transaction.create({
        data: {
            employeeName: "พนักงาน สมศรี",
            customerName: "คุณแก้ว", totalAmount: 700, paymentMethod: "PROMPTPAY", description: "ทำเล็บมือ + เท้า", date: yesterday,
            items: { create: [{ serviceId: services[2].id, quantity: 1, price: 700 }] }
        },
    });
    console.log("✅ สร้างรายการขาย 3 รายการ");

    // Sample Expenses
    const expenses = await Promise.all([
        prisma.expense.create({ data: { amount: 1500, description: "สั่งซื้อสีเจลเล็บ 10 สี", category: "วัสดุ/อุปกรณ์", date: today } }),
        prisma.expense.create({ data: { amount: 800, description: "ค่าน้ำ-ค่าไฟ ประจำเดือน", category: "ค่าสาธารณูปโภค", date: today } }),
        prisma.expense.create({ data: { amount: 350, description: "ซื้อกาแฟและขนมสำหรับลูกค้า", category: "เครื่องดื่ม/ของว่าง", date: yesterday } }),
        prisma.expense.create({ data: { amount: 2000, description: "ค่าเช่าร้าน (บางส่วน)", category: "ค่าเช่า", date: yesterday } }),
    ]);
    console.log(`✅ สร้างรายจ่าย ${expenses.length} รายการ`);

    console.log("🎉 Seeding เสร็จสิ้น!");
}

main()
    .catch((e) => { console.error("❌ Seed error:", e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
