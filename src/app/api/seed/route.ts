import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        // Clean existing data
        await prisma.transactionItem.deleteMany();
        await prisma.transaction.deleteMany();
        await prisma.appointment.deleteMany();
        await prisma.expense.deleteMany();
        await prisma.serviceItem.deleteMany();
        await prisma.user.deleteMany();

        // Admin User
        const admin = await prisma.user.create({
            data: { name: "ผู้ดูแลระบบ", email: "admin@nailsandbrows.com", password: "$2b$10$dummyhashforseeding1234567890", role: "ADMIN" },
        });
        await prisma.user.create({
            data: { name: "พนักงาน สมศรี", email: "staff@nailsandbrows.com", password: "$2b$10$dummyhashforseeding1234567890", role: "STAFF" },
        });

        // Service Items
        const services = await Promise.all([
            prisma.serviceItem.create({ data: { name: "ทาเล็บเจล", category: "NAILS", price: 350, durationMinutes: 45 } }),
            prisma.serviceItem.create({ data: { name: "ต่อเล็บเจล", category: "NAILS", price: 800, durationMinutes: 90 } }),
            prisma.serviceItem.create({ data: { name: "ถอดเล็บเจล", category: "NAILS", price: 200, durationMinutes: 30 } }),
            prisma.serviceItem.create({ data: { name: "เพ้นท์ลายเล็บ", category: "NAILS", price: 150, durationMinutes: 30 } }),
            prisma.serviceItem.create({ data: { name: "ทำเล็บมือ + เท้า", category: "NAILS", price: 600, durationMinutes: 75 } }),
            prisma.serviceItem.create({ data: { name: "ฝังสีคิ้ว", category: "BROWS", price: 2500, durationMinutes: 120 } }),
            prisma.serviceItem.create({ data: { name: "แก้คิ้ว", category: "BROWS", price: 1500, durationMinutes: 90 } }),
            prisma.serviceItem.create({ data: { name: "Microblading คิ้ว", category: "BROWS", price: 3000, durationMinutes: 120 } }),
            prisma.serviceItem.create({ data: { name: "ย้อมคิ้ว", category: "BROWS", price: 300, durationMinutes: 20 } }),
            prisma.serviceItem.create({ data: { name: "ลิฟท์ขนตา", category: "OTHERS", price: 500, durationMinutes: 45 } }),
            prisma.serviceItem.create({ data: { name: "ต่อขนตา", category: "OTHERS", price: 800, durationMinutes: 60 } }),
            prisma.serviceItem.create({ data: { name: "แว็กซ์หน้า", category: "OTHERS", price: 250, durationMinutes: 15 } }),
        ]);

        // Sample Appointments
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        await Promise.all([
            prisma.appointment.create({ data: { customerName: "คุณมะลิ", phone: "081-234-5678", serviceId: services[1].id, date: today, time: "10:00", status: "CONFIRMED" } }),
            prisma.appointment.create({ data: { customerName: "คุณกุหลาบ", phone: "089-876-5432", serviceId: services[5].id, date: today, time: "13:30", status: "PENDING" } }),
            prisma.appointment.create({ data: { customerName: "คุณจัสมิน", phone: "092-111-2222", serviceId: services[0].id, date: tomorrow, time: "11:00", status: "PENDING" } }),
            prisma.appointment.create({ data: { customerName: "คุณดาว", phone: "062-333-4444", serviceId: services[9].id, date: tomorrow, time: "14:00", status: "CONFIRMED" } }),
        ]);

        // Sample Transactions
        await prisma.transaction.create({
            data: {
                customerName: "คุณหญิง", totalAmount: 1150, paymentMethod: "CASH", description: "ทาเล็บเจล + ต่อเล็บเจล", date: today,
                items: { create: [{ serviceId: services[0].id, quantity: 1, price: 350 }, { serviceId: services[1].id, quantity: 1, price: 800 }] }
            },
        });
        await prisma.transaction.create({
            data: {
                customerName: "คุณน้ำ", totalAmount: 2500, paymentMethod: "TRANSFER", description: "ฝังสีคิ้ว", date: today,
                items: { create: [{ serviceId: services[5].id, quantity: 1, price: 2500 }] }
            },
        });
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        await prisma.transaction.create({
            data: {
                customerName: "คุณแก้ว", totalAmount: 600, paymentMethod: "PROMPTPAY", description: "ทำเล็บมือ + เท้า", date: yesterday,
                items: { create: [{ serviceId: services[4].id, quantity: 1, price: 600 }] }
            },
        });

        // Sample Expenses
        await Promise.all([
            prisma.expense.create({ data: { amount: 1500, description: "สั่งซื้อสีเจลเล็บ 10 สี", category: "วัสดุ/อุปกรณ์", date: today } }),
            prisma.expense.create({ data: { amount: 800, description: "ค่าน้ำ-ค่าไฟ ประจำเดือน", category: "ค่าสาธารณูปโภค", date: today } }),
            prisma.expense.create({ data: { amount: 350, description: "ซื้อกาแฟและขนมสำหรับลูกค้า", category: "เครื่องดื่ม/ของว่าง", date: yesterday } }),
            prisma.expense.create({ data: { amount: 2000, description: "ค่าเช่าร้าน (บางส่วน)", category: "ค่าเช่า", date: yesterday } }),
        ]);

        return NextResponse.json({
            message: "🎉 Seeding เสร็จสิ้น!",
            data: {
                users: 2,
                services: services.length,
                appointments: 4,
                transactions: 3,
                expenses: 4,
            },
        });
    } catch (error) {
        console.error("Seed error:", error);
        return NextResponse.json(
            { error: "Seed failed", details: String(error) },
            { status: 500 }
        );
    }
}
