"use client";

import { useState, useRef } from "react";
import { useSettingsStore, SystemSettings } from "@/store/settings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store, Target, Download, Upload, Loader2, Save, CalendarIcon, CheckCircle2, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import Image from "next/image";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const storeSchema = z.object({
    storeName: z.string().min(1, "กรุณากรอกชื่อร้าน"),
});

const targetSchema = z.object({
    dailyTarget: z.number().min(0, "เป้าหมายต้องไม่ติดลบ"),
    monthlyTarget: z.number().min(0, "เป้าหมายต้องไม่ติดลบ"),
});

export default function SettingsClient() {
    const { settings, updateSettings } = useSettingsStore();
    const [isSaving, setIsSaving] = useState(false);
    const [logoBase64, setLogoBase64] = useState<string | null>(settings?.storeLogo || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Store Form
    const storeForm = useForm({
        resolver: zodResolver(storeSchema),
        defaultValues: {
            storeName: settings?.storeName || "Nails & Brows",
        },
    });

    // Target Form
    const targetForm = useForm({
        resolver: zodResolver(targetSchema),
        defaultValues: {
            dailyTarget: settings?.dailyTarget || 1000,
            monthlyTarget: settings?.monthlyTarget || 30000,
        },
    });

    // Export State
    const [exportDateRange, setExportDateRange] = useState<{ from: Date; to: Date | undefined }>({
        from: new Date(),
        to: new Date(),
    });
    const [isExporting, setIsExporting] = useState<"none" | "transactions" | "appointments">("none");

    // PIN Change State
    const [pinForm, setPinForm] = useState({ currentPin: "", newPin: "", confirmPin: "" });
    const [isSavingPin, setIsSavingPin] = useState(false);

    const handleChangePin = async () => {
        if (!pinForm.currentPin || !pinForm.newPin || !pinForm.confirmPin) {
            toast.error("กรุณากรอกข้อมูลให้ครบ");
            return;
        }
        if (!/^\d{4}$/.test(pinForm.newPin)) {
            toast.error("PIN ใหม่ต้องเป็นตัวเลข 4 หลัก");
            return;
        }
        if (pinForm.newPin !== pinForm.confirmPin) {
            toast.error("PIN ใหม่ ไม่ตรงกัน");
            return;
        }
        setIsSavingPin(true);
        try {
            const res = await fetch("/api/change-pin", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPin: pinForm.currentPin, newPin: pinForm.newPin }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("เปลี่ยน PIN สำเร็จ");
                setPinForm({ currentPin: "", newPin: "", confirmPin: "" });
            } else {
                toast.error(data.error || "เปลี่ยน PIN ไม่สำเร็จ");
            }
        } catch {
            toast.error("เกิดข้อผิดพลาด");
        } finally {
            setIsSavingPin(false);
        }
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error("รูปภาพต้องมีขนาดไม่เกิน 2MB");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoBase64(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveStore = async (data: z.infer<typeof storeSchema>) => {
        try {
            setIsSaving(true);
            const res = await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    storeName: data.storeName,
                    storeLogo: logoBase64,
                    dailyTarget: settings?.dailyTarget || 1000,
                    monthlyTarget: settings?.monthlyTarget || 30000,
                }),
            });
            if (res.ok) {
                const updatedSettings = await res.json();
                updateSettings({
                    ...updatedSettings,
                    dailyTarget: Number(updatedSettings.dailyTarget),
                    monthlyTarget: Number(updatedSettings.monthlyTarget)
                });
                toast.success("บันทึกข้อมูลร้านค้าสำเร็จ");
            } else {
                throw new Error("Failed to save");
            }
        } catch (error) {
            toast.error("ไม่สามารถบันทึกข้อมูลได้");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveTargets = async (data: z.infer<typeof targetSchema>) => {
        try {
            setIsSaving(true);
            const res = await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    storeName: settings?.storeName || "Nails & Brows",
                    storeLogo: settings?.storeLogo,
                    dailyTarget: data.dailyTarget,
                    monthlyTarget: data.monthlyTarget,
                }),
            });
            if (res.ok) {
                const updatedSettings = await res.json();
                updateSettings({
                    ...updatedSettings,
                    dailyTarget: Number(updatedSettings.dailyTarget),
                    monthlyTarget: Number(updatedSettings.monthlyTarget)
                });
                toast.success("บันทึกเป้าหมายสำเร็จ");
            } else {
                throw new Error("Failed to save");
            }
        } catch (error) {
            toast.error("ไม่สามารถบันทึกข้อมูลได้");
        } finally {
            setIsSaving(false);
        }
    };

    const handleExport = (type: "transactions" | "appointments") => {
        if (!exportDateRange.from) {
            toast.error("กรุณาเลือกวันที่เริ่มต้น");
            return;
        }
        const toDate = exportDateRange.to || exportDateRange.from;

        const startDateStr = format(exportDateRange.from, "yyyy-MM-dd'T'00:00:00.000'Z'");
        const endDateStr = format(toDate, "yyyy-MM-dd'T'23:59:59.999'Z'");

        const url = `/api/export/${type}?startDate=${startDateStr}&endDate=${endDateStr}`;

        // Create an invisible anchor to trigger download
        const link = document.createElement("a");
        link.href = url;
        link.download = `${type}_export.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success(`ดาวน์โหลดไฟล์ ${type} สำเร็จ`);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">ตั้งค่าระบบ</h2>
                    <p className="text-sm text-gray-500 mt-1">จัดการข้อมูลร้านค้า เป้าหมายการขาย และส่งออกข้อมูล</p>
                </div>
            </div>

            <Tabs defaultValue="store" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                    <TabsTrigger value="store" className="rounded-lg data-[state=active]:bg-rose-50 data-[state=active]:text-rose-600 gap-2">
                        <Store className="h-4 w-4" /> ข้อมูลร้าน
                    </TabsTrigger>
                    <TabsTrigger value="targets" className="rounded-lg data-[state=active]:bg-rose-50 data-[state=active]:text-rose-600 gap-2">
                        <Target className="h-4 w-4" /> เป้ายอดขาย
                    </TabsTrigger>
                    <TabsTrigger value="export" className="rounded-lg data-[state=active]:bg-rose-50 data-[state=active]:text-rose-600 gap-2">
                        <Download className="h-4 w-4" /> ส่งออกข้อมูล
                    </TabsTrigger>
                    <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-rose-50 data-[state=active]:text-rose-600 gap-2">
                        <Lock className="h-4 w-4" /> ความปลอดภัย
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="store" className="mt-0">
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="border-b border-gray-50 bg-gray-50/50">
                            <CardTitle className="text-lg">ข้อมูลร้านค้า</CardTitle>
                            <CardDescription>ปรับแต่งชื่อร้านและโลโก้ที่จะแสดงในระบบ</CardDescription>
                        </CardHeader>
                        <form onSubmit={storeForm.handleSubmit(handleSaveStore)}>
                            <CardContent className="space-y-6 pt-6">
                                {/* Logo Upload */}
                                <div className="flex flex-col sm:flex-row gap-6 items-start">
                                    <div className="flex-shrink-0">
                                        <Label className="block mb-2 text-sm text-gray-700">โลโก้ร้าน (สี่เหลี่ยมจัตุรัส)</Label>
                                        <div
                                            className="h-32 w-32 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-rose-300 hover:bg-rose-50 transition-colors overflow-hidden relative group"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            {logoBase64 ? (
                                                <>
                                                    <Image src={logoBase64} alt="Logo preview" fill className="object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                        <Upload className="h-6 w-6 text-white" />
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <Store className="h-8 w-8 text-gray-400 mb-2 group-hover:text-rose-400" />
                                                    <span className="text-xs text-gray-500 font-medium">อัปโหลดโลโก้</span>
                                                </>
                                            )}
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleLogoUpload}
                                                accept="image/png, image/jpeg, image/webp"
                                                className="hidden"
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-2 text-center">ขนาดที่แนะนำ 512x512px<br />ไฟล์ไม่เกิน 2MB</p>
                                    </div>

                                    {/* Store Name Input */}
                                    <div className="flex-1 space-y-4 w-full">
                                        <div className="space-y-2 relative">
                                            <Label htmlFor="storeName" className="text-sm text-gray-700">ชื่อร้าน (Store Name)</Label>
                                            <Input
                                                id="storeName"
                                                {...storeForm.register("storeName")}
                                                className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-rose-400 focus:ring-rose-400"
                                                placeholder="Nails & Brows"
                                            />
                                            {storeForm.formState.errors.storeName && (
                                                <p className="text-xs text-red-500 absolute -bottom-5 left-1">{storeForm.formState.errors.storeName.message}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-6 pb-6 border-t border-gray-50 bg-gray-50/30 flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-xl"
                                    onClick={() => {
                                        storeForm.reset({ storeName: settings?.storeName || "Nails & Brows" });
                                        setLogoBase64(settings?.storeLogo || null);
                                    }}
                                >
                                    ยกเลิกการเปลี่ยนแปลง
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSaving}
                                    className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl gap-2 shadow-sm shadow-rose-200 px-6"
                                >
                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    บันทึกข้อมูล
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>

                <TabsContent value="targets" className="mt-0">
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="border-b border-gray-50 bg-gray-50/50">
                            <CardTitle className="text-lg">เป้าหมายยอดขาย (Sales Targets)</CardTitle>
                            <CardDescription>ตั้งเป้าหมายยอดขายเพื่อดูความคืบหน้าในหน้าแดชบอร์ด</CardDescription>
                        </CardHeader>
                        <form onSubmit={targetForm.handleSubmit(handleSaveTargets)}>
                            <CardContent className="space-y-6 pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Daily Target */}
                                    <div className="space-y-3 relative p-4 rounded-xl border border-gray-100 bg-blue-50/30">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                                <Target className="h-4 w-4" />
                                            </div>
                                            <Label htmlFor="dailyTarget" className="text-base font-semibold text-gray-800">เป้ายอดขายรายวัน</Label>
                                        </div>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">฿</span>
                                            <Input
                                                id="dailyTarget"
                                                type="number"
                                                {...targetForm.register("dailyTarget", { valueAsNumber: true })}
                                                className="h-12 pl-8 text-lg font-medium rounded-xl border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                                            />
                                        </div>
                                        {targetForm.formState.errors.dailyTarget && (
                                            <p className="text-xs text-red-500">{targetForm.formState.errors.dailyTarget.message}</p>
                                        )}
                                        <p className="text-xs text-gray-500">เป้าหมายที่ต้องการทำให้ได้ในแต่ละวัน</p>
                                    </div>

                                    {/* Monthly Target */}
                                    <div className="space-y-3 relative p-4 rounded-xl border border-gray-100 bg-green-50/30">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                                                <Target className="h-4 w-4" />
                                            </div>
                                            <Label htmlFor="monthlyTarget" className="text-base font-semibold text-gray-800">เป้ายอดขายรายเดือน</Label>
                                        </div>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">฿</span>
                                            <Input
                                                id="monthlyTarget"
                                                type="number"
                                                {...targetForm.register("monthlyTarget", { valueAsNumber: true })}
                                                className="h-12 pl-8 text-lg font-medium rounded-xl border-gray-200 focus:border-green-400 focus:ring-green-400"
                                            />
                                        </div>
                                        {targetForm.formState.errors.monthlyTarget && (
                                            <p className="text-xs text-red-500">{targetForm.formState.errors.monthlyTarget.message}</p>
                                        )}
                                        <p className="text-xs text-gray-500">ภาพรวมเป้าหมายตลอดทั้งเดือน</p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-6 pb-6 border-t border-gray-50 bg-gray-50/30 flex justify-end gap-3">
                                <Button
                                    type="submit"
                                    disabled={isSaving}
                                    className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl gap-2 px-6 shadow-sm"
                                >
                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    บันทึกเป้าหมาย
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>

                <TabsContent value="export" className="mt-0">
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="border-b border-gray-50 bg-gray-50/50">
                            <CardTitle className="text-lg">ส่งออกข้อมูล (Export Data)</CardTitle>
                            <CardDescription>ดาวน์โหลดข้อมูลเป็นไฟล์ CSV สามารถเลือกช่วงวันที่ต้องการได้</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">

                            <div className="bg-white border rounded-xl p-4 shadow-sm border-gray-100 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-800 mb-1">เลือกช่วงวันที่ที่ต้องการ</h4>
                                    <p className="text-xs text-gray-500">ข้อมูลที่จะส่งออกจะอยู่ในช่วงวันที่เลือกนี้</p>
                                </div>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            id="date"
                                            variant={"outline"}
                                            className={cn(
                                                "w-[260px] justify-start text-left font-normal rounded-xl h-11 border-gray-200 hover:border-rose-400 hover:bg-rose-50/30",
                                                !exportDateRange.from && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4 text-rose-500" />
                                            {exportDateRange.from ? (
                                                exportDateRange.to ? (
                                                    <>
                                                        {format(exportDateRange.from, "d MMM yyyy", { locale: th })} -{" "}
                                                        {format(exportDateRange.to, "d MMM yyyy", { locale: th })}
                                                    </>
                                                ) : (
                                                    format(exportDateRange.from, "d MMM yyyy", { locale: th })
                                                )
                                            ) : (
                                                <span>เลือกช่วงวันที่</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="end">
                                        <Calendar
                                            initialFocus
                                            mode="range"
                                            defaultMonth={exportDateRange.from}
                                            selected={{ from: exportDateRange.from, to: exportDateRange.to }}
                                            onSelect={(range) => {
                                                if (range?.from) {
                                                    setExportDateRange({ from: range.from, to: range.to });
                                                }
                                            }}
                                            numberOfMonths={2}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-6">
                                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                                            <Download className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-800">รายการขาย (Transactions)</h4>
                                            <p className="text-xs text-gray-500">ข้อมูลยอดขายบริการ สินค้า</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="bg-white hover:bg-gray-50 rounded-lg text-xs"
                                        onClick={() => handleExport("transactions")}
                                    >
                                        ส่งออก CSV
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                            <Download className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-800">รายการนัดหมาย (Appointments)</h4>
                                            <p className="text-xs text-gray-500">ข้อมูลการจองและนัดหมาย</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="bg-white hover:bg-gray-50 rounded-lg text-xs"
                                        onClick={() => handleExport("appointments")}
                                    >
                                        ส่งออก CSV
                                    </Button>
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security" className="mt-0">
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="border-b border-gray-50 bg-gray-50/50">
                            <CardTitle className="text-lg">เปลี่ยน PIN เข้าระบบ</CardTitle>
                            <CardDescription>ใช้สำหรับล็อคหน้า Dashboard, รายจ่าย และตั้งค่า</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="max-w-sm space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPin">PIN ปัจจุบัน</Label>
                                    <Input
                                        id="currentPin"
                                        type="password"
                                        maxLength={4}
                                        placeholder="****"
                                        value={pinForm.currentPin}
                                        onChange={(e) => setPinForm(f => ({ ...f, currentPin: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                                        className="h-11 rounded-xl text-center text-xl tracking-[0.5em] bg-gray-50 border-gray-200 focus:bg-white focus:border-rose-400 focus:ring-rose-400"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newPin">PIN ใหม่ (4 หลัก)</Label>
                                    <Input
                                        id="newPin"
                                        type="password"
                                        maxLength={4}
                                        placeholder="****"
                                        value={pinForm.newPin}
                                        onChange={(e) => setPinForm(f => ({ ...f, newPin: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                                        className="h-11 rounded-xl text-center text-xl tracking-[0.5em] bg-gray-50 border-gray-200 focus:bg-white focus:border-rose-400 focus:ring-rose-400"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPin">ยืนยัน PIN ใหม่</Label>
                                    <Input
                                        id="confirmPin"
                                        type="password"
                                        maxLength={4}
                                        placeholder="****"
                                        value={pinForm.confirmPin}
                                        onChange={(e) => setPinForm(f => ({ ...f, confirmPin: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                                        className="h-11 rounded-xl text-center text-xl tracking-[0.5em] bg-gray-50 border-gray-200 focus:bg-white focus:border-rose-400 focus:ring-rose-400"
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-6 pb-6 border-t border-gray-50 bg-gray-50/30 flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-xl"
                                onClick={() => setPinForm({ currentPin: "", newPin: "", confirmPin: "" })}
                            >
                                ยกเลิก
                            </Button>
                            <Button
                                type="button"
                                disabled={isSavingPin}
                                onClick={handleChangePin}
                                className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl gap-2 shadow-sm shadow-rose-200 px-6"
                            >
                                {isSavingPin ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                                เปลี่ยน PIN
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
