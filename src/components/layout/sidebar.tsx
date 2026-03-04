"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    ClipboardList,
    PlusCircle,
    CalendarDays,
    Wallet,
    Settings,
    Sparkles,
    ChevronLeft,
    Users,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useSettingsStore } from "@/store/settings";
import { useSidebarStore } from "@/store/sidebar";
import Image from "next/image";

const menuItems = [
    {
        label: "Record",
        href: "/",
        icon: PlusCircle,
    },
    {
        label: "Report",
        href: "/report",
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
    const { isOpen, setIsOpen } = useSidebarStore();

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-rose-100 transition-all duration-300 ease-in-out shrink-0 lg:static lg:translate-x-0",
                    isOpen ? "translate-x-0 w-72 shadow-2xl lg:shadow-none" : "-translate-x-full w-72 lg:w-auto lg:shadow-none",
                    collapsed ? "lg:w-0 lg:border-r-0 lg:overflow-hidden lg:opacity-0" : "lg:w-64 lg:border-r lg:opacity-100"
                )}
            >
                {/* Logo Section */}
                <div className={cn(
                    "flex flex-col items-center justify-center gap-3 px-4 py-8 border-b border-rose-100 relative",
                    collapsed && "lg:py-4 lg:px-2"
                )}>
                    {/* Logo Container */}
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 shadow-lg shadow-rose-200 overflow-hidden relative">
                        {(!isLoading && (settings?.storeLogo || "/nailslogo.jpg")) ? (
                            <Image
                                src={settings?.storeLogo || "/nailslogo.jpg"}
                                alt="Store Logo"
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <Sparkles className="h-8 w-8 text-white" />
                        )}
                    </div>

                    {/* Shop Name */}
                    {(!collapsed || isOpen) && (
                        <div className="flex flex-col items-center text-center">
                            <span className="text-base font-extrabold text-gray-800 tracking-tight">
                                {isLoading ? "กำลังโหลด..." : (settings?.storeName || "Nails & Brows")}
                            </span>
                            <div className="h-1 w-8 bg-rose-400 rounded-full mt-1.5 opacity-50" />
                        </div>
                    )}

                    {/* Mobile Close Button */}
                    <button
                        className="lg:hidden absolute top-4 right-4 flex items-center justify-center p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
                        onClick={() => setIsOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </button>
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
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                                    isActive
                                        ? "bg-gradient-to-r from-rose-50 to-pink-50 text-rose-600 shadow-sm shadow-rose-100"
                                        : "text-gray-500 hover:bg-rose-50/50 hover:text-rose-500",
                                    collapsed && "lg:justify-center lg:px-2"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        "shrink-0 transition-colors duration-200",
                                        isActive
                                            ? "text-rose-500"
                                            : "text-gray-400 group-hover:text-rose-400",
                                        collapsed ? "h-5 w-5 lg:h-[18px] lg:w-[18px]" : "h-[18px] w-[18px]",
                                        collapsed && "lg:h-5 lg:w-5"
                                    )}
                                />
                                {(!collapsed || isOpen) && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Collapse Toggle */}
                <div className="hidden lg:block p-3 border-t border-rose-100">
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
