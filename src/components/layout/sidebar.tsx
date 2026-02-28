"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    ClipboardList,
    PlusCircle,
    CalendarDays,
    BarChart3,
    Wallet,
    Settings,
    Sparkles,
    ChevronLeft,
    Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useSettingsStore } from "@/store/settings";
import Image from "next/image";

const menuItems = [
    {
        label: "Record",
        href: "/",
        icon: PlusCircle,
    },
    {
        label: "Report",
        href: "/items",
        icon: ClipboardList,
    },
    {
        label: "Appointment",
        href: "/appointments",
        icon: CalendarDays,
    },

    {
        label: "รายจ่าย",
        href: "/expenses",
        icon: Wallet,
    },
    {
        label: "แดชบอร์ด",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "ตั้งค่า",
        href: "/settings",
        icon: Settings,
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const { settings, isLoading } = useSettingsStore();

    return (
        <>
            <aside
                className={cn(
                    "hidden lg:flex flex-col bg-white border-rose-100 transition-all duration-300 ease-in-out shrink-0",
                    collapsed ? "w-0 border-r-0 overflow-hidden opacity-0" : "w-64 border-r opacity-100"
                )}
            >
                {/* Logo */}
                <div className={cn(
                    "flex items-center gap-3 px-4 h-16 border-b border-rose-100",
                    collapsed && "justify-center px-2"
                )}>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-rose-400 to-pink-500 shadow-md shadow-rose-200 overflow-hidden relative">
                        {!isLoading && settings?.storeLogo ? (
                            <Image src={settings.storeLogo} alt="Store Logo" fill className="object-cover" />
                        ) : (
                            <Sparkles className="h-5 w-5 text-white" />
                        )}
                    </div>
                    {!collapsed && (
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-800 tracking-tight truncate max-w-[140px]">
                                {isLoading ? "กำลังโหลด..." : (settings?.storeName || "Nails & Brows")}
                            </span>
                            <span className="text-[10px] text-rose-400 font-medium -mt-0.5">
                                POS System
                            </span>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive =
                            item.href === "/"
                                ? pathname === "/"
                                : pathname.startsWith(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                                    isActive
                                        ? "bg-gradient-to-r from-rose-50 to-pink-50 text-rose-600 shadow-sm shadow-rose-100"
                                        : "text-gray-500 hover:bg-rose-50/50 hover:text-rose-500",
                                    collapsed && "justify-center px-2"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        "shrink-0 transition-colors duration-200",
                                        isActive
                                            ? "text-rose-500"
                                            : "text-gray-400 group-hover:text-rose-400",
                                        collapsed ? "h-5 w-5" : "h-[18px] w-[18px]"
                                    )}
                                />
                                {!collapsed && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Collapse Toggle */}
                <div className="p-3 border-t border-rose-100">
                    <button
                        onClick={() => setCollapsed(true)}
                        className="flex items-center justify-center w-full py-2 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors gap-2"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="text-sm font-medium">ซ่อนเมนู</span>
                    </button>
                </div>
            </aside>

            {/* Floating Open Button */}
            {collapsed && (
                <div className="hidden lg:flex fixed left-0 top-1/2 -translate-y-1/2 z-50 animate-in slide-in-from-left-4 duration-300">
                    <button
                        onClick={() => setCollapsed(false)}
                        className="flex items-center justify-center h-12 w-8 bg-white border border-rose-200 border-l-0 rounded-r-xl shadow-md text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors group"
                    >
                        <ChevronLeft className="h-4 w-4 rotate-180 group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            )}
        </>
    );
}
