"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    Menu,
    LayoutDashboard,
    ClipboardList,
    PlusCircle,
    CalendarDays,
    BarChart3,
    Wallet,
    Settings,
    Sparkles,
    X,
    Bell,
    User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const menuItems = [
    { label: "แดชบอร์ด", href: "/", icon: LayoutDashboard },
    { label: "รายการ", href: "/items", icon: ClipboardList },
    { label: "บันทึก", href: "/records", icon: PlusCircle },
    { label: "นัดหมาย", href: "/appointments", icon: CalendarDays },
    { label: "รายงาน", href: "/reports", icon: BarChart3 },
    { label: "รายจ่าย", href: "/expenses", icon: Wallet },
    { label: "ตั้งค่า", href: "/settings", icon: Settings },
];

const pageTitles: Record<string, string> = {
    "/": "แดชบอร์ด",
    "/items": "รายการบริการ",
    "/records": "บันทึกรายการ",
    "/appointments": "นัดหมาย",
    "/reports": "รายงาน",
    "/expenses": "รายจ่าย",
    "/settings": "ตั้งค่า",
};

function getPageTitle(pathname: string): string {
    if (pageTitles[pathname]) return pageTitles[pathname];
    for (const [path, title] of Object.entries(pageTitles)) {
        if (path !== "/" && pathname.startsWith(path)) return title;
    }
    return "Nails & Brows POS";
}

export function Header() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-4 lg:px-6 bg-white/80 backdrop-blur-md border-b border-rose-100">
                {/* Mobile menu button */}
                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="lg:hidden flex items-center justify-center h-9 w-9 rounded-lg text-gray-500 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                >
                    <Menu className="h-5 w-5" />
                </button>

                {/* Page title */}
                <div className="flex items-center gap-2">
                    <h1 className="text-lg font-semibold text-gray-800">
                        {getPageTitle(pathname)}
                    </h1>
                </div>

                {/* Right side actions */}
                <div className="flex items-center gap-2">
                    <button className="relative flex items-center justify-center h-9 w-9 rounded-lg text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-colors">
                        <Bell className="h-[18px] w-[18px]" />
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                    </button>
                    <div className="flex items-center gap-2 pl-2 border-l border-gray-100">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-500 text-white text-xs font-semibold shadow-sm">
                            <User className="h-4 w-4" />
                        </div>
                        <div className="hidden sm:flex flex-col">
                            <span className="text-xs font-medium text-gray-700">Admin</span>
                            <span className="text-[10px] text-gray-400">ผู้ดูแลระบบ</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile sidebar overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    {/* Drawer */}
                    <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl animate-in slide-in-from-left duration-300">
                        {/* Logo */}
                        <div className="flex items-center justify-between px-4 h-16 border-b border-rose-100">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-rose-400 to-pink-500 shadow-md shadow-rose-200">
                                    <Sparkles className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-gray-800 tracking-tight">
                                        Nails & Brows
                                    </span>
                                    <span className="text-[10px] text-rose-400 font-medium -mt-0.5">
                                        POS System
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center justify-center h-8 w-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Navigation */}
                        <nav className="py-4 px-3 space-y-1">
                            {menuItems.map((item) => {
                                const isActive =
                                    item.href === "/"
                                        ? pathname === "/"
                                        : pathname.startsWith(item.href);

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                                            isActive
                                                ? "bg-gradient-to-r from-rose-50 to-pink-50 text-rose-600 shadow-sm shadow-rose-100"
                                                : "text-gray-500 hover:bg-rose-50/50 hover:text-rose-500"
                                        )}
                                    >
                                        <item.icon
                                            className={cn(
                                                "h-5 w-5 shrink-0",
                                                isActive ? "text-rose-500" : "text-gray-400"
                                            )}
                                        />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </div>
            )}
        </>
    );
}
