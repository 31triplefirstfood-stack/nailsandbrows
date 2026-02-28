"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/store/settings";

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const fetchSettings = useSettingsStore((state) => state.fetchSettings);

    useEffect(() => {
        fetchSettings();

        // Check and generate monthly expenses automatically on load
        const now = new Date().toISOString();
        fetch(`/api/expenses/monthly?date=${now}`).catch(console.error);
    }, [fetchSettings]);

    return <>{children}</>;
}
