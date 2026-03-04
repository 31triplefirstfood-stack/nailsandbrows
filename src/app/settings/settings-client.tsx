"use client";

import { useSearchParams } from "next/navigation";

import { useState, useRef } from "react";
import { useSettingsStore } from "@/store/settings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store, Target, Download, Upload, Loader2, Save, CalendarIcon, Lock, Users, Scissors, Trash2, AlertTriangle, Database } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { EmployeesTab } from "./components/employees-tab";
import { ServicesTab } from "./components/services-tab";
const storeSchema = z.object({
    storeName: z.string().min(1, "กรุณากรอกชื่อร้าน"),
});

const targetSchema = z.object({
    dailyTarget: z.number().min(0, "เป้าหมายต้องไม่ติดลบ"),
    monthlyTarget: z.number().min(0, "เป้าหมายต้องไม่ติดลบ"),
});

export default function SettingsClient() {
    const searchParams = useSearchParams();
    const defaultTab = searchParams.get("tab") || "store";
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

    const [cleanupDateRange, setCleanupDateRange] = useState<{ from: Date; to: Date | undefined }>({
        from: new Date(),
        to: new Date(),
    });

    // PIN Change State
    const [pinForm, setPinForm] = useState({ currentPin: "", newPin: "", confirmPin: "" });
    const [isSavingPin, setIsSavingPin] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleCleanup = async () => {
        if (!cleanupDateRange.from) {
            toast.error("กรุณาเลือกวันที่เริ่มต้น");
            return;
        }

        setIsDeleting(true);
        try {
            const toDate = cleanupDateRange.to || cleanupDateRange.from;
            const startDateStr = format(cleanupDateRange.from, "yyyy-MM-dd'T'00:00:00.000'Z'");
            const endDateStr = format(toDate, "yyyy-MM-dd'T'23:59:59.999'Z'");

            const res = await fetch(`/api/system/cleanup?startDate=${startDateStr}&endDate=${endDateStr}`, {
                method: "DELETE",
            });
            const data = await res.json();

            if (res.ok) {
                toast.success(data.message || "ลบข้อมูลสำเร็จ");
                setShowDeleteConfirm(false);
            } else {
                toast.error(data.error || "เกิดข้อผิดพลาดในการลบข้อมูล");
            }
        } catch {
            toast.error("ไม่สามารถลบข้อมูลได้");
        } finally {
            setIsDeleting(false);
        }
    };

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
        } catch {
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
        } catch {
            toast.error("ไม่สามารถบันทึกข้อมูลได้");
        } finally {
            setIsSaving(false);
        }
    };

    const handleExport = (type: "transactions" | "expenses") => {
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
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">ตั้งค่าระบบ</h2>
                    <p className="text-sm font-medium text-gray-500 mt-2">จัดการข้อมูลร้านค้า เป้าหมายการขาย และความปลอดภัย</p>
                </div>
            </div>

            <Tabs defaultValue={defaultTab} className="w-full">
                <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
                    <TabsList className="inline-flex w-max min-w-full sm:min-w-0 h-auto items-center justify-start sm:justify-center gap-1.5 mb-8 bg-white/60 p-1.5 rounded-2xl shadow-sm border border-gray-100 backdrop-blur-md">
                        <TabsTrigger value="store" className="rounded-xl px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-gray-100 transition-all gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50">
                            <Store className="h-4 w-4" /> ข้อมูลร้าน
                        </TabsTrigger>
                        <TabsTrigger value="targets" className="rounded-xl px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-gray-100 transition-all gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50">
                            <Target className="h-4 w-4" /> เป้ายอดขาย
                        </TabsTrigger>
                        <TabsTrigger value="employees" className="rounded-xl px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-gray-100 transition-all gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50">
                            <Users className="h-4 w-4" /> พนักงาน
                        </TabsTrigger>
                        <TabsTrigger value="services" className="rounded-xl px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-gray-100 transition-all gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50">
                            <Scissors className="h-4 w-4" /> บริการ
                        </TabsTrigger>
                        <TabsTrigger value="export" className="rounded-xl px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-gray-100 transition-all gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50">
                            <Download className="h-4 w-4" /> ส่งออกข้อมูล
                        </TabsTrigger>
                        <TabsTrigger value="database" className="rounded-xl px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-gray-100 transition-all gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50">
                            <Database className="h-4 w-4" /> จัดการข้อมูล
                        </TabsTrigger>
                        <TabsTrigger value="security" className="rounded-xl px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-gray-100 transition-all gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50">
                            <Lock className="h-4 w-4" /> ความปลอดภัย
                        </TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="store" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="border border-gray-100 shadow-xl shadow-gray-200/40 rounded-3xl overflow-hidden bg-white/60 backdrop-blur-md">
                        <CardHeader className="border-b border-gray-100/50 bg-white/80 pb-6 pt-8 px-8">
                            <CardTitle className="text-xl font-bold text-gray-800">ข้อมูลร้านค้า</CardTitle>
                            <CardDescription className="text-gray-500 font-medium mt-1">ปรับแต่งชื่อร้านและโลโก้ที่จะแสดงในระบบ</CardDescription>
                        </CardHeader>
                        <form onSubmit={storeForm.handleSubmit(handleSaveStore)} className="bg-white/40">
                            <CardContent className="space-y-8 pt-8 px-8">
                                {/* Logo Upload */}
                                <div className="flex flex-col sm:flex-row gap-8 items-start">
                                    <div className="flex-shrink-0 flex flex-col items-center sm:items-start">
                                        <Label className="block mb-4 text-sm font-semibold text-gray-700">โลโก้ร้าน (สี่เหลี่ยมจัตุรัส)</Label>
                                        <div
                                            className="h-40 w-40 rounded-3xl border-2 border-dashed border-gray-200 bg-white shadow-sm flex flex-col items-center justify-center cursor-pointer hover:border-rose-400 hover:bg-rose-50/50 hover:shadow-md transition-all duration-300 overflow-hidden relative group"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            {logoBase64 ? (
                                                <>
                                                    <Image src={logoBase64} alt="Logo preview" fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                                                        <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                                                            <Upload className="h-6 w-6 text-white drop-shadow-md" />
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center transform transition-transform duration-300 group-hover:-translate-y-1">
                                                    <div className="h-12 w-12 rounded-full bg-rose-50 flex items-center justify-center mb-3 group-hover:bg-rose-100 transition-colors">
                                                        <Store className="h-6 w-6 text-rose-400" />
                                                    </div>
                                                    <span className="text-sm text-gray-600 font-medium">อัปโหลดโลโก้</span>
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleLogoUpload}
                                                accept="image/png, image/jpeg, image/webp"
                                                className="hidden"
                                            />
                                        </div>
                                        <p className="text-[11px] text-gray-400 mt-3 text-center sm:text-left font-medium leading-relaxed">ขนาดที่แนะนำ 512x512px<br />ไฟล์ขนาดไม่เกิน 2MB</p>
                                    </div>

                                    {/* Store Name Input */}
                                    <div className="flex-1 space-y-4 w-full pt-1">
                                        <div className="space-y-2 relative group w-full max-w-md">
                                            <Label htmlFor="storeName" className="text-sm font-semibold text-gray-700">ชื่อร้าน (Store Name)</Label>
                                            <div className="relative">
                                                <Input
                                                    id="storeName"
                                                    {...storeForm.register("storeName")}
                                                    className="h-12 pl-12 rounded-2xl bg-white border-gray-200 shadow-sm focus:bg-white focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition-all font-medium text-gray-800 text-base"
                                                    placeholder="Nails & Brows"
                                                />
                                                <Store className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                                            </div>
                                            {storeForm.formState.errors.storeName && (
                                                <p className="text-sm text-red-500 absolute -bottom-6 left-1 font-medium">{storeForm.formState.errors.storeName.message}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-6 pb-6 border-t border-gray-100/50 bg-gray-50/50 flex justify-end gap-3 px-8">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-xl font-medium border-gray-200 hover:bg-gray-100 hover:text-gray-900 transition-all active:scale-[0.98] px-6"
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
                                    className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl gap-2 shadow-md shadow-rose-200 px-8 font-medium transition-all hover:shadow-lg hover:shadow-rose-300 active:scale-[0.98]"
                                >
                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    บันทึกข้อมูล
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>

                <TabsContent value="targets" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="border border-gray-100 shadow-xl shadow-gray-200/40 rounded-3xl overflow-hidden bg-white/60 backdrop-blur-md">
                        <CardHeader className="border-b border-gray-100/50 bg-white/80 pb-6 pt-8 px-8">
                            <CardTitle className="text-xl font-bold text-gray-800">เป้าหมายยอดขาย (Sales Targets)</CardTitle>
                            <CardDescription className="text-gray-500 font-medium mt-1">ตั้งเป้าหมายยอดขายเพื่อดูความคืบหน้าในหน้าแดชบอร์ด</CardDescription>
                        </CardHeader>
                        <form onSubmit={targetForm.handleSubmit(handleSaveTargets)} className="bg-white/40">
                            <CardContent className="space-y-6 pt-8 px-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Daily Target */}
                                    <div className="space-y-4 relative p-6 rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50/80 to-blue-50/20 shadow-sm group hover:shadow-md hover:border-blue-200 transition-all">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="h-10 w-10 rounded-xl bg-blue-100/80 flex items-center justify-center text-blue-600 shadow-sm">
                                                <Target className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <Label htmlFor="dailyTarget" className="text-base font-bold text-gray-800">ยอดขายเป้าหมายรายวัน</Label>
                                                <p className="text-xs text-gray-500 font-medium mt-0.5">เป้าหมายที่ต้องการทำให้ได้ในแต่ละวัน</p>
                                            </div>
                                        </div>
                                        <div className="relative mt-2">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-lg">฿</span>
                                            <Input
                                                id="dailyTarget"
                                                type="number"
                                                {...targetForm.register("dailyTarget", { valueAsNumber: true })}
                                                className="h-14 pl-10 pr-4 text-xl font-bold text-gray-800 rounded-2xl border-gray-200 shadow-sm focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all bg-white"
                                            />
                                        </div>
                                        {targetForm.formState.errors.dailyTarget && (
                                            <p className="text-sm text-red-500 font-medium">{targetForm.formState.errors.dailyTarget.message}</p>
                                        )}
                                    </div>

                                    {/* Monthly Target */}
                                    <div className="space-y-4 relative p-6 rounded-2xl border border-emerald-100 bg-gradient-to-b from-emerald-50/80 to-emerald-50/20 shadow-sm group hover:shadow-md hover:border-emerald-200 transition-all">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="h-10 w-10 rounded-xl bg-emerald-100/80 flex items-center justify-center text-emerald-600 shadow-sm">
                                                <Target className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <Label htmlFor="monthlyTarget" className="text-base font-bold text-gray-800">ยอดขายเป้าหมายรายเดือน</Label>
                                                <p className="text-xs text-gray-500 font-medium mt-0.5">ภาพรวมเป้าหมายตลอดทั้งเดือน</p>
                                            </div>
                                        </div>
                                        <div className="relative mt-2">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-lg">฿</span>
                                            <Input
                                                id="monthlyTarget"
                                                type="number"
                                                {...targetForm.register("monthlyTarget", { valueAsNumber: true })}
                                                className="h-14 pl-10 pr-4 text-xl font-bold text-gray-800 rounded-2xl border-gray-200 shadow-sm focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all bg-white"
                                            />
                                        </div>
                                        {targetForm.formState.errors.monthlyTarget && (
                                            <p className="text-sm text-red-500 font-medium">{targetForm.formState.errors.monthlyTarget.message}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-6 pb-6 border-t border-gray-100/50 bg-gray-50/50 flex justify-end gap-3 px-8">
                                <Button
                                    type="submit"
                                    disabled={isSaving}
                                    className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl gap-2 px-8 py-6 h-auto font-medium shadow-md transition-all hover:shadow-lg active:scale-[0.98]"
                                >
                                    {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                    บันทึกเป้าหมาย
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>

                <TabsContent value="export" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="border border-gray-100 shadow-xl shadow-gray-200/40 rounded-3xl overflow-hidden bg-white/60 backdrop-blur-md">
                        <CardHeader className="border-b border-gray-100/50 bg-white/80 pb-6 pt-8 px-8">
                            <CardTitle className="text-xl font-bold text-gray-800">ส่งออกข้อมูล (Export Data)</CardTitle>
                            <CardDescription className="text-gray-500 font-medium mt-1">ดาวน์โหลดข้อมูลเป็นไฟล์ CSV สามารถเลือกช่วงวันที่ต้องการได้</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8 pt-8 px-8 bg-white/40">

                            <div className="bg-white border rounded-2xl p-6 shadow-sm border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-6 justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                                        <CalendarIcon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-base font-bold text-gray-800 mb-1">เลือกช่วงวันที่ที่ต้องการ</h4>
                                        <p className="text-sm text-gray-500 font-medium">ข้อมูลที่จะส่งออกจะอยู่ในช่วงวันที่เลือกนี้</p>
                                    </div>
                                </div>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            id="date"
                                            variant={"outline"}
                                            className={cn(
                                                "w-full sm:w-[280px] justify-start text-left font-medium rounded-xl h-12 border-gray-200 hover:border-orange-400 hover:bg-orange-50/30 transition-all shadow-sm",
                                                !exportDateRange.from && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-3 h-5 w-5 text-orange-500" />
                                            {exportDateRange.from ? (
                                                exportDateRange.to ? (
                                                    <span className="text-gray-700">
                                                        {format(exportDateRange.from, "d MMM yy", { locale: th })} -{" "}
                                                        {format(exportDateRange.to, "d MMM yy", { locale: th })}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-700">{format(exportDateRange.from, "d MMM yy", { locale: th })}</span>
                                                )
                                            ) : (
                                                <span>คลิกเพื่อเลือกวันที่</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 rounded-2xl border-gray-100 shadow-xl" align="end">
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
                                            className="rounded-2xl"
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 pb-2">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-2xl border border-gray-200 bg-white hover:border-green-300 hover:shadow-md transition-all group gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 group-hover:bg-green-100 transition-colors">
                                            <Download className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-gray-800">รายการขาย</h4>
                                            <p className="text-sm text-gray-500 font-medium mt-0.5">Transactions ข้อมูลยอดขาย</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="bg-white border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 rounded-xl font-medium shadow-sm active:scale-[0.98] transition-all whitespace-nowrap"
                                        onClick={() => handleExport("transactions")}
                                    >
                                        ส่งออก CSV
                                    </Button>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-2xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-md transition-all group gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                                            <Download className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-gray-800">รายการจ่าย</h4>
                                            <p className="text-sm text-gray-500 font-medium mt-0.5">Expenses ข้อมูลค่าใช้จ่าย</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 rounded-xl font-medium shadow-sm active:scale-[0.98] transition-all whitespace-nowrap"
                                        onClick={() => handleExport("expenses")}
                                    >
                                        ส่งออก CSV
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="database" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="border border-gray-100 shadow-xl shadow-gray-200/40 rounded-3xl overflow-hidden bg-white/60 backdrop-blur-md">
                        <CardHeader className="border-b border-gray-100/50 bg-white/80 pb-6 pt-8 px-8">
                            <CardTitle className="text-xl font-bold text-gray-800">จัดการฐานข้อมูล (Database Management)</CardTitle>
                            <CardDescription className="text-gray-500 font-medium mt-1">ลบข้อมูลเก่าเพื่อให้ระบบทำงานได้เร็วขึ้นและประหยัดพื้นที่</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8 pt-8 px-8 bg-white/40">
                            <div className="bg-white border rounded-2xl p-6 shadow-sm border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-6 justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                                        <CalendarIcon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-base font-bold text-gray-800 mb-1">เลือกช่วงวันที่ที่ต้องการลบ</h4>
                                        <p className="text-sm text-gray-500 font-medium">ข้อมูลในช่วงวันที่เลือกนี้จะถูกลบออกจากระบบอย่างถาวร</p>
                                    </div>
                                </div>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            id="cleanup-date"
                                            variant={"outline"}
                                            className={cn(
                                                "w-full sm:w-[280px] justify-start text-left font-medium rounded-xl h-12 border-gray-200 hover:border-orange-400 hover:bg-orange-50/30 transition-all shadow-sm",
                                                !cleanupDateRange.from && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-3 h-5 w-5 text-orange-500" />
                                            {cleanupDateRange.from ? (
                                                cleanupDateRange.to ? (
                                                    <span className="text-gray-700">
                                                        {format(cleanupDateRange.from, "d MMM yy", { locale: th })} -{" "}
                                                        {format(cleanupDateRange.to, "d MMM yy", { locale: th })}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-700">{format(cleanupDateRange.from, "d MMM yy", { locale: th })}</span>
                                                )
                                            ) : (
                                                <span>คลิกเพื่อเลือกวันที่</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 rounded-2xl border-gray-100 shadow-xl" align="end">
                                        <Calendar
                                            initialFocus
                                            mode="range"
                                            defaultMonth={cleanupDateRange.from}
                                            selected={{ from: cleanupDateRange.from, to: cleanupDateRange.to }}
                                            onSelect={(range) => {
                                                if (range?.from) {
                                                    setCleanupDateRange({ from: range.from, to: range.to });
                                                }
                                            }}
                                            numberOfMonths={2}
                                            className="rounded-2xl"
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-8 shadow-sm flex flex-col items-center text-center gap-6">
                                    <div className="h-20 w-20 rounded-3xl bg-rose-100 flex items-center justify-center text-rose-600 shadow-inner">
                                        <AlertTriangle className="h-10 w-10" />
                                    </div>
                                    <div className="max-w-md">
                                        <h4 className="text-xl font-bold text-gray-800 mb-2">ลบข้อมูลในฐานข้อมูล</h4>
                                        <p className="text-gray-500 font-medium leading-relaxed">
                                            การดำเนินการนี้จะลบรายการขาย (Transactions), รายจ่าย (Expenses) และการนัดหมาย (Appointments) ในช่วงเวลาที่เลือก <br />
                                            <span className="text-rose-600 font-bold">**ข้อมูลจะถูกลบอย่างถาวรและไม่สามารถเรียกคืนได้**</span>
                                        </p>
                                    </div>

                                    <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="destructive"
                                                className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold shadow-lg shadow-rose-200 active:scale-[0.98] transition-all gap-3 h-14 px-10 text-lg"
                                            >
                                                <Trash2 className="h-6 w-6" />
                                                ลบข้อมูล
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="rounded-3xl border-none shadow-2xl p-0 overflow-hidden max-w-md">
                                            <div className="bg-rose-600 p-8 text-white flex flex-col items-center text-center">
                                                <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
                                                    <AlertTriangle className="h-10 w-10 text-white" />
                                                </div>
                                                <DialogTitle className="text-2xl font-bold mb-2">ยืนยันการลบข้อมูลครั้งสุดท้าย?</DialogTitle>
                                                <DialogDescription className="text-rose-100 text-base font-medium">
                                                    ข้อมูลชุดนี้จะถูกลบออกจากระบบทันที:
                                                    <div className="mt-3 bg-black/20 px-6 py-3 rounded-2xl font-black text-white text-lg tracking-wide border border-white/10">
                                                        {cleanupDateRange.from ? (
                                                            cleanupDateRange.to ? (
                                                                <>
                                                                    {format(cleanupDateRange.from, "d MMM yy", { locale: th })} -{" "}
                                                                    {format(cleanupDateRange.to, "d MMM yy", { locale: th })}
                                                                </>
                                                            ) : (
                                                                <>{format(cleanupDateRange.from, "d MMM yy", { locale: th })}</>
                                                            )
                                                        ) : "ยังไม่ได้เลือกวันที่"}
                                                    </div>
                                                </DialogDescription>
                                            </div>
                                            <div className="p-8 bg-white">
                                                <p className="text-gray-600 text-center mb-8 font-medium">
                                                    กรุณาตรวจสอบวันที่ให้แน่ใจก่อนกดยืนยัน <br />
                                                    ระบบจะทำการลบข้อมูล Transactions, Expenses และ Appointments ทั้งหมดในช่วงเวลานี้
                                                </p>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setShowDeleteConfirm(false)}
                                                        className="rounded-2xl h-14 font-bold border-gray-200 hover:bg-gray-50 text-gray-600"
                                                    >
                                                        ยกเลิก
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        disabled={isDeleting}
                                                        onClick={handleCleanup}
                                                        className="rounded-2xl h-14 font-bold bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200"
                                                    >
                                                        {isDeleting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Trash2 className="h-5 w-5 mr-2" />}
                                                        ยืนยันการลบ
                                                    </Button>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="border border-gray-100 shadow-xl shadow-gray-200/40 rounded-3xl overflow-hidden bg-white/60 backdrop-blur-md">
                        <CardHeader className="border-b border-gray-100/50 bg-white/80 pb-6 pt-8 px-8">
                            <CardTitle className="text-xl font-bold text-gray-800">เปลี่ยน PIN เข้าระบบ</CardTitle>
                            <CardDescription className="text-gray-500 font-medium mt-1">ใช้สำหรับล็อคหน้า Dashboard, รายจ่าย และตั้งค่า</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-8 px-8 bg-white/40 pb-8">
                            <div className="max-w-sm mx-auto space-y-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-rose-400 to-rose-500"></div>
                                <div className="flex justify-center mb-6">
                                    <div className="h-20 w-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 shadow-inner">
                                        <Lock className="h-10 w-10" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="currentPin" className="text-sm font-bold text-gray-700">PIN ปัจจุบัน</Label>
                                    <Input
                                        id="currentPin"
                                        type="password"
                                        maxLength={4}
                                        placeholder="••••"
                                        value={pinForm.currentPin}
                                        onChange={(e) => setPinForm(f => ({ ...f, currentPin: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                                        className="h-14 rounded-2xl text-center text-2xl tracking-[0.75em] bg-gray-50 border-gray-200 focus:bg-white focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newPin" className="text-sm font-bold text-gray-700">PIN ใหม่ (4 หลัก)</Label>
                                    <Input
                                        id="newPin"
                                        type="password"
                                        maxLength={4}
                                        placeholder="••••"
                                        value={pinForm.newPin}
                                        onChange={(e) => setPinForm(f => ({ ...f, newPin: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                                        className="h-14 rounded-2xl text-center text-2xl tracking-[0.75em] bg-gray-50 border-gray-200 focus:bg-white focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPin" className="text-sm font-bold text-gray-700">ยืนยัน PIN ใหม่</Label>
                                    <Input
                                        id="confirmPin"
                                        type="password"
                                        maxLength={4}
                                        placeholder="••••"
                                        value={pinForm.confirmPin}
                                        onChange={(e) => setPinForm(f => ({ ...f, confirmPin: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                                        className="h-14 rounded-2xl text-center text-2xl tracking-[0.75em] bg-gray-50 border-gray-200 focus:bg-white focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition-all font-medium"
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-6 pb-6 border-t border-gray-100/50 bg-gray-50/50 flex justify-end gap-3 px-8">
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-xl font-medium border-gray-200 hover:bg-gray-100 hover:text-gray-900 transition-all active:scale-[0.98] px-6"
                                onClick={() => setPinForm({ currentPin: "", newPin: "", confirmPin: "" })}
                            >
                                ยกเลิก
                            </Button>
                            <Button
                                type="button"
                                disabled={isSavingPin}
                                onClick={handleChangePin}
                                className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl gap-2 shadow-md shadow-rose-200 px-8 py-6 h-auto font-medium transition-all hover:shadow-lg hover:shadow-rose-300 active:scale-[0.98]"
                            >
                                {isSavingPin ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5" />}
                                เปลี่ยน PIN
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="employees" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <EmployeesTab />
                </TabsContent>

                <TabsContent value="services" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <ServicesTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
