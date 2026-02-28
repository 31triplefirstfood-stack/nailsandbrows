"use client";

import SettingsClient from "./settings-client";
import { PinGate } from "@/components/pin-gate";
import { Suspense } from "react";

export default function SettingsPage() {
    return (
        <PinGate storageKey="pin-settings">
            <div className="pb-10">
                <Suspense fallback={<div className="p-6 text-gray-500">กำลังโหลด...</div>}>
                    <SettingsClient />
                </Suspense>
            </div>
        </PinGate>
    );
}
