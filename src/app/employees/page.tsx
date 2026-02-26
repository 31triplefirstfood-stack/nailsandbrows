"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Mail, Shield, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    createdAt: string;
}

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        role: "STAFF"
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

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
            setFormData({ name: "", role: "STAFF" });
            setIsAddOpen(false);

            // Refresh list
            fetchEmployees();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="h-6 w-6 text-blue-500" /> จัดการพนักงาน
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">เพิ่มและดูรายชื่อพนักงานทั้งหมดในระบบ</p>
                </div>
                <Button
                    onClick={() => setIsAddOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm"
                >
                    <Plus className="h-4 w-4" /> เพิ่มพนักงานใหม่
                </Button>
            </div>

            {/* Stats/Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">พนักงานทั้งหมด</p>
                            <div className="text-2xl font-bold text-gray-900">
                                {loading ? <Skeleton className="h-8 w-12" /> : employees.length}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Employee List */}
            <Card className="border-0 shadow-sm bg-white overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">ชื่อ-นามสกุล</th>
                                <th className="px-6 py-4">บทบาท (Role)</th>
                                <th className="px-6 py-4">วันที่เพิ่มเข้าสู่ระบบ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                // Loading Skeletons
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><div className="flex items-center gap-3"><Skeleton className="h-8 w-8 rounded-full" /><Skeleton className="h-4 w-32" /></div></td>
                                        <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                    </tr>
                                ))
                            ) : employees.length === 0 ? (
                                // Empty State
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                        <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                        <p className="font-medium text-gray-900">ยังไม่มีพนักงาน</p>
                                        <p className="text-sm mt-1">คลิกปุ่ม "เพิ่มพนักงานใหม่" เพื่อเริ่มต้น</p>
                                    </td>
                                </tr>
                            ) : (
                                // Data Rows
                                employees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
                                                    {emp.name.substring(0, 2)}
                                                </div>
                                                <span className="font-medium text-gray-900">{emp.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge
                                                variant="secondary"
                                                className={emp.role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}
                                            >
                                                <Shield className="h-3 w-3 mr-1" />
                                                {emp.role === "ADMIN" ? "ผู้ดูแลระบบ" : "พนักงาน"}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {format(new Date(emp.createdAt), "d MMM yyyy", { locale: th })}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Add Employee Modal */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>เพิ่มพนักงานใหม่</DialogTitle>
                        <DialogDescription>กรอกข้อมูลของพนักงานเพื่อสร้างบัญชีผู้ใช้งานระบบ</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium">ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
                            <Input
                                placeholder="เช่น สมศรี นามสมมติ"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">บทบาท (Role) <span className="text-red-500">*</span></label>
                            <Select
                                value={formData.role}
                                onValueChange={(val) => setFormData({ ...formData, role: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="เลือกบทบาท" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="STAFF">พนักงานทั่วไป (Staff)</SelectItem>
                                    <SelectItem value="ADMIN">ผู้ดูแลระบบ (Admin)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                                ยกเลิก
                            </Button>
                            <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
                                {submitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
