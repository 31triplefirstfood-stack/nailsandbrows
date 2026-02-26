"use client";

import { useState, useEffect, useCallback } from "react";
import { PinGate } from "@/components/pin-gate";
import { Plus, Search, TrendingDown, Loader2, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface Expense {
    id: string;
    amount: number;
    description: string;
    category: string;
    date: string;
}

const emptyForm = { amount: "", description: "", category: "", date: "" };

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const fetchExpenses = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/expenses");
            setExpenses(await res.json());
        } catch { toast.error("โหลดข้อมูลไม่สำเร็จ"); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

    const openAdd = () => {
        setEditingExpense(null);
        setForm({ ...emptyForm, date: format(new Date(), "yyyy-MM-dd") });
        setDialogOpen(true);
    };
    const openEdit = (e: Expense) => {
        setEditingExpense(e);
        setForm({ amount: String(e.amount), description: e.description, category: e.category, date: e.date.slice(0, 10) });
        setDialogOpen(true);
    };
    const handleSave = async () => {
        if (!form.amount || !form.description || !form.date) { toast.error("กรุณากรอกข้อมูลให้ครบ"); return; }
        setSaving(true);
        try {
            const body = { amount: Number(form.amount), description: form.description, category: form.category, date: new Date(form.date).toISOString() };
            const res = editingExpense
                ? await fetch(`/api/expenses/${editingExpense.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
                : await fetch("/api/expenses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            if (!res.ok) throw new Error();
            toast.success(editingExpense ? "แก้ไขรายจ่ายสำเร็จ" : "บันทึกรายจ่ายสำเร็จ");
            setDialogOpen(false); fetchExpenses();
        } catch { toast.error("บันทึกไม่สำเร็จ"); }
        finally { setSaving(false); }
    };
    const handleDelete = async (id: string) => {
        if (!confirm("ยืนยันการลบรายจ่ายนี้?")) return;
        await fetch(`/api/expenses/${id}`, { method: "DELETE" });
        toast.success("ลบรายจ่ายสำเร็จ"); fetchExpenses();
    };

    const filtered = expenses.filter((e) => e.description.includes(search) || e.category.includes(search));
    const totalThisMonth = expenses
        .filter((e) => e.date?.slice(0, 7) === format(new Date(), "yyyy-MM"))
        .reduce((sum, e) => sum + Number(e.amount), 0);
    const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    return (
        <PinGate storageKey="pin-expenses">
            <div className="p-6 space-y-6 max-w-6xl mx-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">รายจ่าย</h1>
                        <p className="text-sm text-gray-500 mt-0.5">บันทึกค่าใช้จ่ายของร้าน</p>
                    </div>
                    <Button onClick={openAdd} className="bg-rose-500 hover:bg-rose-600 text-white gap-2">
                        <Plus className="h-4 w-4" /> เพิ่มรายจ่าย
                    </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                        { label: "รายจ่ายเดือนนี้", value: `฿${totalThisMonth.toLocaleString()}`, icon: "📅" },
                        { label: "รายจ่ายทั้งหมด", value: `฿${total.toLocaleString()}`, icon: "💸" },
                        { label: "รายการคงเหลือ", value: `${expenses.length} รายการ`, icon: "📋" },
                    ].map((s) => (
                        <Card key={s.label} className="border-0 shadow-sm bg-white">
                            <CardContent className="p-4 flex items-center gap-3">
                                <span className="text-3xl">{s.icon}</span>
                                <div><p className="text-sm text-gray-500">{s.label}</p><p className="text-3xl font-bold text-gray-900">{s.value}</p></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input placeholder="ค้นหารายจ่าย..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>

                {loading ? (
                    <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-rose-400" /></div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <TrendingDown className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p className="text-lg font-medium">ยังไม่มีรายจ่าย</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filtered.map((exp) => (
                            <Card key={exp.id} className="border border-gray-100 shadow-sm hover:shadow-md transition-all bg-white">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                            <TrendingDown className="h-5 w-5 text-orange-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">{exp.description}</p>
                                            <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                                                {exp.category && <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{exp.category}</span>}
                                                <span>{exp.date ? format(new Date(exp.date), "d MMM yyyy", { locale: th }) : "-"}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg font-bold text-red-500">-฿{exp.amount.toLocaleString()}</span>
                                            <button onClick={() => openEdit(exp)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500"><Pencil className="h-3.5 w-3.5" /></button>
                                            <button onClick={() => handleDelete(exp.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader><DialogTitle>{editingExpense ? "แก้ไขรายจ่าย" : "เพิ่มรายจ่ายใหม่"}</DialogTitle></DialogHeader>
                        <div className="space-y-4 py-2">
                            <div className="space-y-1.5">
                                <Label>รายละเอียด</Label>
                                <Input placeholder="เช่น ซื้อสีเจลเล็บ" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label>จำนวนเงิน (บาท)</Label>
                                    <Input type="number" placeholder="500" value={form.amount} onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>หมวดหมู่</Label>
                                    <Input placeholder="วัสดุ/อุปกรณ์" value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label>วันที่</Label>
                                <Input type="date" value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>ยกเลิก</Button>
                            <Button onClick={handleSave} disabled={saving} className="bg-rose-500 hover:bg-rose-600 text-white">
                                {saving ? "กำลังบันทึก..." : "บันทึก"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </PinGate>
    );
}
