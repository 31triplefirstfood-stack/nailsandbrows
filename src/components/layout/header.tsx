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
import { useSidebarStore } from "@/store/sidebar";
import Image from "next/image";

const menuItems = [
    { label: "แดชบอร์ด", href: "/dashboard", icon: LayoutDashboard },

    { label: "บันทึก", href: "/", icon: PlusCircle },
    { label: "นัดหมาย", href: "/appointments", icon: CalendarDays },
    { label: "รายจ่าย", href: "/expenses", icon: Wallet },
    { label: "ตั้งค่า", href: "/settings", icon: Settings },
];

const pageTitles: Record<string, string> = {
    "/dashboard": "แดชบอร์ด",
    "/report": "รายงาน",
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
    const setIsOpen = useSidebarStore((state) => state.setIsOpen);
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
                {/* Left side: Mobile menu & Page title */}
                <div className="flex items-center gap-3">
                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsOpen(true)}
                        className="lg:hidden flex items-center justify-center h-9 w-9 -ml-1 rounded-lg text-gray-500 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    {/* Page title */}
                    <div className="flex items-center gap-2">
                        <h1 className="text-lg font-semibold text-gray-800">
                            {getPageTitle(pathname)}
                        </h1>
                    </div>
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
        </>
    );
}
