"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    Menu,
    LayoutDashboard,
    ClipboardList,
    PlusCircle,
    CalendarDays,
    Wallet,
    Settings,
    Sparkles,
    X,
    Database,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useSettingsStore } from "@/store/settings";
import Image from "next/image";

const menuItems = [
    { label: "แดชบอร์ด", href: "/dashboard", icon: LayoutDashboard },
    { label: "Report", href: "/items", icon: ClipboardList },
    { label: "บันทึก", href: "/", icon: PlusCircle },
    { label: "นัดหมาย", href: "/appointments", icon: CalendarDays },
    { label: "รายจ่าย", href: "/expenses", icon: Wallet },
    { label: "ตั้งค่า", href: "/settings", icon: Settings },
];

const pageTitles: Record<string, string> = {
    "/dashboard": "แดชบอร์ด",
    "/items": "Report",
    "/": "บันทึกรายการ",
    "/appointments": "นัดหมาย",
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
    const [dbInfo, setDbInfo] = useState<{ used: string; max: string; remaining: string; percent: number } | null>(null);
    const { settings, isLoading } = useSettingsStore();

    useEffect(() => {
        fetch("/api/system/db-size")
            .then((res) => res.json())
            .then((data) => {
                if (data.usedBytes !== undefined) {
                    const formatBytes = (bytes: number) => {
                        if (bytes === 0) return '0 MB';
                        const k = 1024;
                        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
                        const i = Math.floor(Math.log(bytes) / Math.log(k));
                        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
                    };

                    setDbInfo({
                        used: formatBytes(data.usedBytes),
                        max: formatBytes(data.maxBytes),
                        remaining: formatBytes(data.remainingBytes),
                        percent: Math.min(100, (data.usedBytes / data.maxBytes) * 100)
                    });
                }
            })
            .catch((err) => console.error("Failed to fetch DB size", err));
    }, []);

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

                {/* Right side elements */}
                <div className="flex items-center justify-end min-w-[2.25rem]">
                    {dbInfo ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white text-gray-600 rounded-full border border-gray-200 shadow-sm whitespace-nowrap">
                            <Database className="w-4 h-4 text-rose-500 hidden sm:block" />
                            <div className="flex flex-col items-end sm:items-start text-[10px] sm:text-xs leading-tight">
                                <span className="font-semibold text-gray-800">
                                    {dbInfo.used} <span className="text-gray-400 font-normal mx-0.5">/</span> {dbInfo.max}
                                </span>
                                <span className="text-emerald-600 text-[9px] sm:text-[10px]">
                                    เหลือ {dbInfo.remaining}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="w-9 lg:hidden"></div>
                    )}
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
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-rose-400 to-pink-500 shadow-md shadow-rose-200 relative overflow-hidden">
                                    {!isLoading && settings?.storeLogo ? (
                                        <Image src={settings.storeLogo} alt="Store Logo" fill className="object-cover" />
                                    ) : (
                                        <Sparkles className="h-5 w-5 text-white" />
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-gray-800 tracking-tight truncate max-w-[150px]">
                                        {isLoading ? "กำลังโหลด..." : (settings?.storeName || "Nails & Brows")}
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
