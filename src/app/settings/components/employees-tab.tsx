"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Shield, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface Employee {
    id: string;
    name: string;
    role: string;
    startDate?: string;
    salary?: number;
    commissionRate?: number;
    createdAt: string;
}

export function EmployeesTab() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        startDate: format(new Date(), 'yyyy-MM-dd'),
        salary: "",
        commissionRate: ""
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Edit State
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState({
        name: "",
        startDate: "",
        salary: "",
        commissionRate: ""
    });

    // Delete State
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/employees");
            if (!res.ok) throw new Error("Failed to fetch employees");
            const data = await res.json();
            setEmployees(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            const res = await fetch("/api/employees", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "เกิดข้อผิดพลาดในการเพิ่มพนักงาน");
            }

            // Reset form and close dialog
            setFormData({
                name: "",
                startDate: format(new Date(), 'yyyy-MM-dd'),
                salary: "",
                commissionRate: ""
            });
            setIsAddOpen(false);

            // Refresh list
            fetchEmployees();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditClick = (employee: Employee) => {
        setEditingId(employee.id);
        setEditFormData({
            name: employee.name,
            startDate: employee.startDate ? format(new Date(employee.startDate), 'yyyy-MM-dd') : "",
            salary: employee.salary !== null && employee.salary !== undefined ? employee.salary.toString() : "",
            commissionRate: employee.commissionRate !== null && employee.commissionRate !== undefined ? employee.commissionRate.toString() : ""
        });
        setIsEditOpen(true);
        setError("");
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingId) return;
        setError("");
        setSubmitting(true);

        try {
            const res = await fetch(`/api/employees/${editingId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: editFormData.name,
                    startDate: editFormData.startDate,
                    salary: editFormData.salary === "" ? null : Number(editFormData.salary),
                    commissionRate: editFormData.commissionRate === "" ? null : Number(editFormData.commissionRate)
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
            }

            setIsEditOpen(false);
            setEditingId(null);
            fetchEmployees();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteClick = (id: string) => {
        setDeletingId(id);
        setIsDeleteOpen(true);
        setError("");
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        setSubmitting(true);
        setError("");

        try {
            const res = await fetch(`/api/employees/${deletingId}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "เกิดข้อผิดพลาดในการลบข้อมูล");
            }

            setIsDeleteOpen(false);
            setDeletingId(null);
            fetchEmployees();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card className="border border-gray-100 shadow-xl shadow-gray-200/40 rounded-3xl overflow-hidden bg-white/60 backdrop-blur-md">
            <CardHeader className="border-b border-gray-100/50 bg-white/80 pb-6 pt-8 px-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner hidden sm:flex border border-blue-100/50">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold text-gray-800">
                                จัดการพนักงาน
                            </CardTitle>
                            <CardDescription className="text-gray-500 font-medium mt-1">เพิ่มและดูรายชื่อพนักงานทั้งหมดในระบบ</CardDescription>
                        </div>
                    </div>
                    <Button
                        onClick={() => setIsAddOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 px-6 py-6 h-auto font-medium shadow-md transition-all hover:shadow-lg hover:shadow-blue-300 active:scale-[0.98]"
                    >
                        <Plus className="h-5 w-5" /> เพิ่มพนักงาน
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-8 pt-8 px-8 bg-white/40 pb-8">
                {/* Employee List */}
                <div className="border border-gray-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b border-gray-100 whitespace-nowrap">
                                <tr>
                                    <th className="px-8 py-5 text-gray-600 font-bold">ชื่อ-นามสกุล</th>
                                    <th className="px-8 py-5 text-gray-600 font-bold">วันที่เริ่มทำงาน</th>
                                    <th className="px-8 py-5 text-gray-600 font-bold">เงินเดือน</th>
                                    <th className="px-8 py-5 text-gray-600 font-bold">คอมมิชชัน (%)</th>
                                    <th className="px-8 py-5 text-gray-600 font-bold text-center">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 whitespace-nowrap">
                                {loading ? (
                                    // Loading Skeletons
                                    Array(3).fill(0).map((_, i) => (
                                        <tr key={i}>
                                            <td className="px-8 py-5"><div className="flex items-center gap-4"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-5 w-32" /></div></td>
                                            <td className="px-8 py-5"><Skeleton className="h-4 w-24" /></td>
                                            <td className="px-8 py-5"><Skeleton className="h-4 w-20" /></td>
                                            <td className="px-8 py-5"><Skeleton className="h-4 w-16" /></td>
                                            <td className="px-8 py-5 text-center"><Skeleton className="h-8 w-16 mx-auto" /></td>
                                        </tr>
                                    ))
                                ) : employees.length === 0 ? (
                                    // Empty State
                                    <tr>
                                        <td colSpan={5} className="px-8 py-16 text-center text-gray-500">
                                            <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Users className="h-8 w-8 text-gray-400" />
                                            </div>
                                            <p className="font-bold text-gray-800 text-lg">ยังไม่มีพนักงาน</p>
                                            <p className="text-sm mt-1 font-medium text-gray-500">คลิกปุ่ม "เพิ่มพนักงาน" เพื่อเริ่มต้น</p>
                                        </td>
                                    </tr>
                                ) : (
                                    // Data Rows
                                    employees.map((emp) => (
                                        <tr key={emp.id} className="hover:bg-blue-50/20 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm uppercase shadow-inner border border-blue-200/50">
                                                        {emp.name.substring(0, 2)}
                                                    </div>
                                                    <span className="font-bold text-gray-800">{emp.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-gray-600 font-medium">
                                                {emp.startDate ? format(new Date(emp.startDate), "d MMM yyyy", { locale: th }) : "-"}
                                            </td>
                                            <td className="px-8 py-5 text-gray-600 font-medium">
                                                {emp.salary != null ? Number(emp.salary).toLocaleString('th-TH') + " ฿" : "-"}
                                            </td>
                                            <td className="px-8 py-5 text-green-600 font-medium">
                                                {emp.commissionRate != null ? Number(emp.commissionRate) + "%" : "-"}
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEditClick(emp)}
                                                        className="h-8 w-8 p-0 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-100"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeleteClick(emp.id)}
                                                        className="h-8 w-8 p-0 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add Employee Modal */}
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogContent className="sm:max-w-[425px] rounded-3xl border-gray-100 shadow-2xl p-0 overflow-hidden">
                        <div className="bg-white/80 backdrop-blur-sm p-6 sm:p-8">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold text-gray-800">เพิ่มพนักงานใหม่</DialogTitle>
                                <DialogDescription className="text-gray-500 font-medium">กรอกข้อมูลของพนักงานเพื่อสร้างบัญชีผู้ใช้งานระบบ</DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="space-y-5 py-6">
                                {error && (
                                    <div className="p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
                                    <Input
                                        placeholder="เช่น สมศรี นามสมมติ"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">วันที่เริ่มทำงาน <span className="text-red-500">*</span></label>
                                    <Input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        required
                                        className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">เงินเดือนปัจจุบัน (บาท)</label>
                                        <Input
                                            type="number"
                                            placeholder="ตัวอย่าง 15000"
                                            value={formData.salary}
                                            onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                            className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">คิด % การขาย</label>
                                        <Input
                                            type="number"
                                            placeholder="ตัวอย่าง 10"
                                            value={formData.commissionRate}
                                            onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                                            className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <DialogFooter className="pt-6 sm:justify-end gap-3 sm:gap-0">
                                    <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-xl font-medium border-gray-200 px-6 active:scale-[0.98] transition-transform w-full sm:w-auto">
                                        ยกเลิก
                                    </Button>
                                    <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium px-8 shadow-md active:scale-[0.98] transition-all hover:shadow-lg w-full sm:w-auto">
                                        {submitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Edit Employee Modal */}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent className="sm:max-w-[425px] rounded-3xl border-gray-100 shadow-2xl p-0 overflow-hidden">
                        <div className="bg-white/80 backdrop-blur-sm p-6 sm:p-8">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold text-gray-800">แก้ไขข้อมูลพนักงาน</DialogTitle>
                                <DialogDescription className="text-gray-500 font-medium">ปรับปรุงข้อมูลและรายละเอียดของพนักงาน</DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleUpdate} className="space-y-5 py-6">
                                {error && (
                                    <div className="p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
                                    <Input
                                        placeholder="เช่น สมศรี นามสมมติ"
                                        value={editFormData.name}
                                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                        required
                                        className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">วันที่เริ่มทำงาน <span className="text-red-500">*</span></label>
                                    <Input
                                        type="date"
                                        value={editFormData.startDate}
                                        onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })}
                                        required
                                        className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">เงินเดือนปัจจุบัน (บาท)</label>
                                        <Input
                                            type="number"
                                            placeholder="ตัวอย่าง 15000"
                                            value={editFormData.salary}
                                            onChange={(e) => setEditFormData({ ...editFormData, salary: e.target.value })}
                                            className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">คิด % การขาย</label>
                                        <Input
                                            type="number"
                                            placeholder="ตัวอย่าง 10"
                                            value={editFormData.commissionRate}
                                            onChange={(e) => setEditFormData({ ...editFormData, commissionRate: e.target.value })}
                                            className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <DialogFooter className="pt-6 sm:justify-end gap-3 sm:gap-0">
                                    <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="rounded-xl font-medium border-gray-200 px-6 active:scale-[0.98] transition-transform w-full sm:w-auto">
                                        ยกเลิก
                                    </Button>
                                    <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium px-8 shadow-md active:scale-[0.98] transition-all hover:shadow-lg w-full sm:w-auto">
                                        {submitting ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Modal */}
                <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <DialogContent className="sm:max-w-[425px] rounded-3xl border-gray-100 shadow-2xl p-0 overflow-hidden">
                        <div className="bg-white/80 backdrop-blur-sm p-6 sm:p-8 text-center border-t-4 border-red-500">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 mb-6">
                                <Trash2 className="h-10 w-10 text-red-600" />
                            </div>
                            <DialogHeader className="text-center">
                                <DialogTitle className="text-2xl font-bold text-gray-800 text-center">ยืนยันการลบข้อมูล</DialogTitle>
                                <DialogDescription className="text-gray-500 font-medium text-center text-base mt-2">
                                    คุณแน่ใจหรือไม่ว่าต้องการลบพนักงานคนนี้? <br /> ข้อมูลจะไม่สามารถกู้คืนได้เมื่อลบไปแล้ว
                                </DialogDescription>
                            </DialogHeader>

                            {error && (
                                <div className="mt-4 p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 text-left">
                                    {error}
                                </div>
                            )}

                            <DialogFooter className="mt-8 flex-col sm:flex-row gap-3 sm:gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)} className="rounded-xl font-medium border-gray-200 py-6 text-gray-600 w-full hover:bg-gray-50">
                                    ยกเลิก
                                </Button>
                                <Button type="button" variant="destructive" disabled={submitting} onClick={handleDelete} className="rounded-xl font-bold py-6 w-full shadow-md hover:bg-red-700">
                                    {submitting ? "กำลังลบ..." : "ใช่, ลบข้อมูลเลย"}
                                </Button>
                            </DialogFooter>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
