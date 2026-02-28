"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Clock, Loader2, Calendar as CalendarIcon, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PaymentMethodSummary {
    amount: number;
    count: number;
    label: string;
}

interface ServiceItem {
    id: string;
    name: string;
    price: number;
}

interface TransactionItem {
    id: string;
    quantity: number;
    price: number;
    service: ServiceItem;
}

interface Transaction {
    id: string;
    employeeName: string;
    customerName: string;
    totalAmount: number;
    paymentMethod: string;
    date: string;
    items: TransactionItem[];
}

interface EmployeeStat {
    employeeName: string;
    transactionCount: number;
    totalAmount: number;
    paymentMethods: Record<string, PaymentMethodSummary>;
    transactions: Transaction[];
}

export default function StaffLogsPage() {
    const [range, setRange] = useState<"today" | "weekly" | "monthly" | "date">("today");
    const [dateParam, setDateParam] = useState<string>(format(new Date(), "yyyy-MM-dd"));
    const [selectedEmployee, setSelectedEmployee] = useState<string>("ALL");
    const [data, setData] = useState<EmployeeStat[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (range === "date") {
                params.set("date", dateParam);
            } else {
                params.set("range", range);
            }
            const res = await fetch(`/api/staff-logs?${params}`);
            if (!res.ok) throw new Error("Failed to fetch");
            const json = await res.json();
            setData(json);
        } catch (error) {
            toast.error("Failed to load staff performance data");
        } finally {
            setLoading(false);
        }
    }, [range, dateParam]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleLoadReport = () => {
        fetchData();
    };

    const employeeNames = Array.from(new Set(data.map((d) => d.employeeName)));
    const filteredData = selectedEmployee === "ALL" ? data : data.filter((d) => d.employeeName === selectedEmployee);

    return (
        <div className="p-4 md:p-6 w-full mx-auto space-y-6">
            {/* Header / Date Toggles */}
            <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center gap-2 bg-rose-50 p-1.5 rounded-xl border border-rose-100">
                    <Button
                        variant={range === "today" ? "default" : "ghost"}
                        onClick={() => setRange("today")}
                        className={cn("rounded-lg", range === "today" ? "bg-rose-500 text-white hover:bg-rose-600" : "text-rose-700 hover:bg-rose-100")}
                    >
                        Today
                    </Button>
                    <Button
                        variant={range === "weekly" ? "default" : "ghost"}
                        onClick={() => setRange("weekly")}
                        className={cn("rounded-lg", range === "weekly" ? "bg-rose-500 text-white hover:bg-rose-600" : "text-rose-700 hover:bg-rose-100")}
                    >
                        Weekly
                    </Button>
                    <Button
                        variant={range === "monthly" ? "default" : "ghost"}
                        onClick={() => setRange("monthly")}
                        className={cn("rounded-lg", range === "monthly" ? "bg-rose-500 text-white hover:bg-rose-600" : "text-rose-700 hover:bg-rose-100")}
                    >
                        Monthly
                    </Button>
                </div>

                <div className="w-full max-w-3xl bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Label className="text-xs text-gray-500 mb-1 block">Select Date (Optional)</Label>
                            <div className="relative">
                                <Input
                                    type="date"
                                    value={dateParam}
                                    onChange={(e) => {
                                        setDateParam(e.target.value);
                                        setRange("date");
                                    }}
                                    className="w-full pl-10 h-11 bg-gray-50/50 border-gray-200"
                                />
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                        <div className="flex-1 relative">
                            <Label className="text-xs text-gray-500 mb-1 block">Select Employee</Label>
                            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                                <SelectTrigger className="w-full h-11 bg-gray-50/50 border-gray-200">
                                    <SelectValue placeholder="All Employees" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Employees</SelectItem>
                                    {employeeNames.map(name => (
                                        <SelectItem key={name} value={name}>{name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Button
                        onClick={handleLoadReport}
                        disabled={loading}
                        className="w-full bg-rose-500 hover:bg-rose-600 text-white h-11"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                        Load Report Data
                    </Button>
                </div>
            </div>

            {/* Displaying Current Filter */}
            <div className="text-center">
                <h2 className="text-xl font-bold text-rose-900 tracking-tight">
                    {range === "today" ? format(new Date(), "dd/MM/yyyy") :
                        range === "weekly" ? "This Week" :
                            range === "monthly" ? "This Month" :
                                format(new Date(dateParam), "dd/MM/yyyy")}
                </h2>
            </div>

            {/* Staff Cards */}
            {loading && data.length === 0 ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
                </div>
            ) : filteredData.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                    <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No performance data found for the selected time or employee.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredData.map((stat, idx) => (
                        <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-rose-100">
                            {/* Card Header */}
                            <div className="bg-gradient-to-r from-rose-500 to-pink-500 p-4 text-white">
                                <h3 className="text-xl font-bold">{stat.employeeName}</h3>
                                <p className="text-rose-100 text-sm opacity-90">Transaction Count: {stat.transactionCount}</p>
                            </div>

                            {/* Card Body */}
                            <div className="p-4 md:p-5 space-y-5">
                                {/* Payment Methods Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    {(["CASH", "CREDIT_CARD", "PROMPTPAY", "GOWABI", "ALIPAY"] as const).map((method) => {
                                        const summary = stat.paymentMethods[method] || { amount: 0, count: 0, label: method };
                                        const displayLabel = method === "PROMPTPAY" ? "QR Code" : method === "CREDIT_CARD" ? "Card" : method === "CASH" ? "Cash" : method === "GOWABI" ? "Gowabi" : "Alipay";
                                        return (
                                            <div key={method} className="bg-white border border-gray-100 rounded-xl p-3 text-center shadow-sm">
                                                <p className="text-xs text-gray-500 font-medium mb-1">{displayLabel}</p>
                                                <p className={cn("text-base font-bold", summary.amount > 0 ? "text-rose-700" : "text-gray-400")}>
                                                    {summary.amount > 0 ? `${summary.amount.toLocaleString()} THB` : "-"}
                                                </p>
                                                <p className="text-[10px] text-gray-400 mt-1">({summary.count} items)</p>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Staff Total */}
                                <div className="bg-rose-50/50 rounded-xl p-4 flex items-center justify-between border border-rose-100">
                                    <span className="font-bold text-rose-900 border-b-2 border-transparent">Staff Total:</span>
                                    <span className="text-2xl font-black text-rose-600">{stat.totalAmount.toLocaleString()} THB</span>
                                </div>

                                {/* Daily Breakdown Section */}
                                <div className="pt-2">
                                    <h4 className="font-bold text-rose-800 text-sm mb-3">Daily Breakdown</h4>

                                    <div className="bg-rose-50/50 text-rose-800 p-2.5 rounded-lg font-semibold text-sm mb-3 border border-rose-100">
                                        {range === "today" ? format(new Date(), "dd/MM/yyyy") : range === "date" ? format(new Date(dateParam), "dd/MM/yyyy") : "All transactions"}
                                    </div>

                                    {["CASH", "CREDIT_CARD", "PROMPTPAY", "GOWABI", "ALIPAY"].map((method) => {
                                        const txForMethod = stat.transactions.filter(tx => tx.paymentMethod === method);
                                        if (txForMethod.length === 0) return null;

                                        const displayLabel = method === "PROMPTPAY" ? "QR Code" : method === "CREDIT_CARD" ? "Card" : method === "CASH" ? "Cash" : method === "GOWABI" ? "Gowabi" : "Alipay";

                                        return (
                                            <div key={method} className="mb-4 last:mb-0 border border-gray-200 rounded-xl overflow-hidden bg-white">
                                                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                                    <span className="font-bold text-gray-800 text-sm">{displayLabel}</span>
                                                </div>

                                                <div className="divide-y divide-gray-100">
                                                    {txForMethod.map((tx) => (
                                                        <div key={tx.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                                                            <div className="flex items-start justify-between mb-3">
                                                                <div className="flex items-center gap-1.5 text-red-600 font-bold text-sm">
                                                                    <Clock className="h-4 w-4" />
                                                                    {format(new Date(tx.date), "HH:mm:ss", { locale: th })}
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <span className="font-black text-gray-800">{Number(tx.totalAmount).toLocaleString()} THB</span>
                                                                    <div className="flex gap-1">
                                                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-bold rounded">Edit</span>
                                                                        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded">Delete</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="pl-6 space-y-2">
                                                                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                                                    <FileText className="h-3.5 w-3.5 text-amber-500" />
                                                                    Services:
                                                                </div>
                                                                <div className="space-y-1">
                                                                    {tx.items.map((item) => (
                                                                        <div key={item.id} className="flex justify-between items-center text-sm py-1 border-b border-gray-50 last:border-0">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="font-medium text-gray-800">{item.service.name}</span>
                                                                                <span className="text-gray-400 text-xs">x{item.quantity}</span>
                                                                            </div>
                                                                            <span className="text-rose-600 font-semibold text-xs">{(Number(item.price) * item.quantity).toLocaleString()} THB</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
