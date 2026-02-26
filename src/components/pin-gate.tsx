"use client";

import { useState, useCallback } from "react";
import { Lock, Delete, ShieldCheck } from "lucide-react";

interface PinGateProps {
    children: React.ReactNode;
    /** unique key per page so unlocking one doesn't unlock the other */
    storageKey?: string;
}

export function PinGate({ children }: PinGateProps) {
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");
    const [checking, setChecking] = useState(false);
    const [unlocked, setUnlocked] = useState(false);

    const verify = useCallback(
        async (value: string) => {
            setChecking(true);
            setError("");
            try {
                const res = await fetch("/api/verify-pin", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ pin: value }),
                });
                const data = await res.json();
                if (data.ok) {
                    setUnlocked(true);
                } else {
                    setError("รหัสไม่ถูกต้อง");
                    setPin("");
                }
            } catch {
                setError("เกิดข้อผิดพลาด");
                setPin("");
            } finally {
                setChecking(false);
            }
        },
        []
    );

    const handlePress = (digit: string) => {
        if (checking) return;
        setError("");
        const next = pin + digit;
        setPin(next);
        if (next.length === 4) {
            verify(next);
        }
    };

    const handleDelete = () => {
        if (checking) return;
        setPin((p) => p.slice(0, -1));
        setError("");
    };

    if (unlocked) {
        return <>{children}</>;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-pink-50">
            <div className="w-full max-w-sm mx-auto px-6">
                {/* Icon & Title */}
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-200 mb-4">
                        <Lock className="h-7 w-7 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">กรุณาใส่รหัสผ่าน</h2>
                    <p className="text-sm text-gray-400 mt-1">ใส่ PIN 4 หลักเพื่อเข้าใช้งาน</p>
                </div>

                {/* PIN Dots */}
                <div className="flex justify-center gap-4 mb-6">
                    {[0, 1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={`w-4 h-4 rounded-full transition-all duration-200 ${i < pin.length
                                ? "bg-rose-500 scale-110 shadow-md shadow-rose-200"
                                : "bg-gray-200"
                                }`}
                        />
                    ))}
                </div>

                {/* Error Message */}
                <div className="h-6 flex items-center justify-center mb-4">
                    {error && (
                        <p className="text-sm text-red-500 font-medium animate-pulse">
                            {error}
                        </p>
                    )}
                    {checking && (
                        <p className="text-sm text-gray-400">กำลังตรวจสอบ...</p>
                    )}
                </div>

                {/* Numpad */}
                <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto">
                    {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
                        <button
                            key={d}
                            onClick={() => handlePress(d)}
                            disabled={checking}
                            className="h-16 rounded-2xl bg-white border border-gray-100 shadow-sm text-2xl font-semibold text-gray-800
                         hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600
                         active:scale-95 transition-all duration-150 disabled:opacity-50"
                        >
                            {d}
                        </button>
                    ))}

                    {/* Empty space */}
                    <div />

                    {/* 0 */}
                    <button
                        onClick={() => handlePress("0")}
                        disabled={checking}
                        className="h-16 rounded-2xl bg-white border border-gray-100 shadow-sm text-2xl font-semibold text-gray-800
                       hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600
                       active:scale-95 transition-all duration-150 disabled:opacity-50"
                    >
                        0
                    </button>

                    {/* Delete */}
                    <button
                        onClick={handleDelete}
                        disabled={checking}
                        className="h-16 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center
                       hover:bg-red-50 hover:border-red-200 hover:text-red-500
                       active:scale-95 transition-all duration-150 disabled:opacity-50 text-gray-500"
                    >
                        <Delete className="h-6 w-6" />
                    </button>
                </div>

                {/* Footer */}
                <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-gray-300">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>ข้อมูลถูกปกป้อง</span>
                </div>
            </div>
        </div>
    );
}
