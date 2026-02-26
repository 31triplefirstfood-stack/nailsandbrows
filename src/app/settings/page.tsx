"use client";

import SettingsClient from "./settings-client";
import { PinGate } from "@/components/pin-gate";

export default function SettingsPage() {
    return (
        <PinGate storageKey="pin-settings">
            <div className="pb-10">
                <SettingsClient />
            </div>
        </PinGate>
    );
}
