import { create } from "zustand";

export interface SystemSettings {
    id: string;
    storeName: string;
    storeLogo: string | null;
    dailyTarget: number;
    monthlyTarget: number;
}

interface SettingsState {
    settings: SystemSettings | null;
    isLoading: boolean;
    fetchSettings: () => Promise<void>;
    updateSettings: (newSettings: SystemSettings) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
    settings: null,
    isLoading: true,
    fetchSettings: async () => {
        try {
            const response = await fetch("/api/settings");
            if (response.ok) {
                const data = await response.json();
                // Convert Decimal strings from Prisma to numbers
                set({
                    settings: {
                        ...data,
                        dailyTarget: Number(data.dailyTarget),
                        monthlyTarget: Number(data.monthlyTarget),
                    },
                    isLoading: false,
                });
            } else {
                set({ isLoading: false });
            }
        } catch (error) {
            console.error("Failed to fetch settings:", error);
            set({ isLoading: false });
        }
    },
    updateSettings: (newSettings) => set({ settings: newSettings }),
}));
