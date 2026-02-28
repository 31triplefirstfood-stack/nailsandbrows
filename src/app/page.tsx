"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Search, CheckCircle, Loader2, Receipt, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

type PaymentMethod = "CASH" | "CREDIT_CARD" | "PROMPTPAY" | "GOWABI" | "ALIPAY";

interface ServiceItem { id: string; name: string; category: string; price: number; durationMinutes: number; }
interface CartItem { service: ServiceItem; quantity: number; }
interface Employee { id: string; name: string; role: string; }
interface Transaction {
    id: string;
    customerName: string;
    employeeName: string;
    totalAmount: number;
    paymentMethod: PaymentMethod;
    description: string;
    date: string;
    items: { service: ServiceItem; quantity: number; price: number }[];
}

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
    CASH: "Cash", CREDIT_CARD: "Card", PROMPTPAY: "QR Code", GOWABI: "Gowabi", ALIPAY: "Alipay"
};

const CATEGORIES: Record<string, { label: string }> = {
    ALL: { label: "All" },
    NAILS: { label: "Nails" },
    EYELASH: { label: "Eyelash" },
    PERMANENT_MAKEUP: { label: "Permanent Makeup" },
    COURSE_STUDY: { label: "Course Study" }
};

export default function RecordsPage() {
    const [services, setServices] = useState<ServiceItem[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [customerName, setCustomerName] = useState("");
    const [transactionDate, setTransactionDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [employeeName, setEmployeeName] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
    const [filterCategory, setFilterCategory] = useState<string>("ALL");
    const [processing, setProcessing] = useState(false);

    const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
    const [newServiceName, setNewServiceName] = useState("");
    const [newServicePrice, setNewServicePrice] = useState("");
    const [newServiceCategory, setNewServiceCategory] = useState("NAILS");
    const [isSubmittingService, setIsSubmittingService] = useState(false);

    const handleAddService = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newServiceName || !newServicePrice) {
            toast.error("Please enter service name and price");
            return;
        }

        setIsSubmittingService(true);
        try {
            const body = {
                name: newServiceName,
                category: newServiceCategory,
                price: Number(newServicePrice),
                durationMinutes: 60,
            };
            const res = await fetch("/api/services", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error();
            toast.success("Service added successfully");
            setNewServiceName("");
            setNewServicePrice("");
            setNewServiceCategory("NAILS");
            setIsAddServiceOpen(false);
            fetchAll();
        } catch {
            toast.error("Failed to add service");
        } finally {
            setIsSubmittingService(false);
        }
    };

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [svcRes, txRes, empRes] = await Promise.all([fetch("/api/services"), fetch("/api/transactions"), fetch("/api/employees")]);
            setServices(await svcRes.json());
            setTransactions(await txRes.json());
            setEmployees(await empRes.json());
        } catch { toast.error("Failed to load data"); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const addToCart = (svc: ServiceItem) => {
        setCart((prev) => {
            const existing = prev.find((c) => c.service.id === svc.id);
            if (existing) return prev.map((c) => c.service.id === svc.id ? { ...c, quantity: c.quantity + 1 } : c);
            return [...prev, { service: svc, quantity: 1 }];
        });
    };

    const removeFromCart = (id: string) => setCart((prev) => prev.filter((c) => c.service.id !== id));
    const cartTotal = cart.reduce((sum, c) => sum + c.service.price * c.quantity, 0);

    const handleCheckout = async () => {
        const finalCustomerName = customerName.trim() || "-";
        if (!employeeName) { toast.error("Please select an employee"); return; }
        if (cart.length === 0) { toast.error("Please select at least one service"); return; }

        let txDateIso = new Date().toISOString();
        if (transactionDate) {
            const d = new Date(transactionDate);
            if (!isNaN(d.getTime())) {
                txDateIso = d.toISOString();
            }
        }

        setProcessing(true);
        try {
            const body = {
                customerName: finalCustomerName,
                employeeName,
                paymentMethod,
                totalAmount: cartTotal,
                description: cart.map((c) => c.service.name).join(", "),
                date: txDateIso,
                items: cart.map((c) => ({ serviceId: c.service.id, quantity: c.quantity, price: c.service.price })),
            };
            const res = await fetch("/api/transactions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            if (!res.ok) throw new Error();
            toast.success(`Payment successful ฿${cartTotal.toLocaleString()} — ${PAYMENT_LABELS[paymentMethod]}`);
            setCart([]); setCustomerName(""); setEmployeeName(""); setPaymentMethod("CASH"); setTransactionDate(format(new Date(), "yyyy-MM-dd"));
            fetchAll();
        } catch { toast.error("Failed to save transaction"); }
        finally { setProcessing(false); }
    };

    const filteredSvcs = services.filter((s) => {
        const matchCat = filterCategory === "ALL" || s.category === filterCategory;
        return matchCat;
    });

    const todayStr = format(new Date(), "yyyy-MM-dd");
    const todayTx = transactions.filter((t) => {
        if (!t.date) return false;
        return format(new Date(t.date), "yyyy-MM-dd") === todayStr;
    });
    const todayRevenue = todayTx.reduce((sum, t) => sum + Number(t.totalAmount), 0);

    return (
        <div className="p-4 lg:p-6 space-y-6 pb-28 lg:pb-6 relative max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Record Sale</h1>
                    <p className="text-gray-500 mt-2 flex items-center gap-2">Today's Revenue: <span className="text-3xl font-bold text-rose-600">฿{todayRevenue.toLocaleString()}</span></p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Employee Selection */}
                <div className="flex justify-center">
                    <div className="flex flex-wrap gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
                        {employees.map(emp => (
                            <button
                                key={emp.id}
                                onClick={() => setEmployeeName(emp.name)}
                                className={`px-8 py-2.5 rounded-xl text-sm font-semibold transition-all ${employeeName === emp.name
                                    ? "bg-rose-500 text-white shadow-md"
                                    : "bg-rose-50 text-rose-500 hover:bg-rose-100"
                                    }`}
                            >
                                {emp.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Date and Customer Row */}
                <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
                    <CardContent className="p-4 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
                        <div className="space-y-2">
                            <Label className="text-gray-700 font-semibold mb-1">Transaction Date</Label>
                            <div className="relative">
                                <Input
                                    type="date"
                                    value={transactionDate}
                                    onChange={(e) => setTransactionDate(e.target.value)}
                                    className="pl-3 pr-10 border-gray-200 h-12 rounded-lg w-full text-gray-600 focus-visible:ring-rose-200"
                                />
                                <CalendarIcon className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-700 font-semibold mb-1">Customer Name (Optional)</Label>
                            <Input
                                placeholder="Walk-in Customer"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className="border-gray-200 h-12 rounded-lg text-gray-600 focus-visible:ring-rose-200"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Service Category */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <Label className="text-gray-700 font-medium mb-3 block">Service Category</Label>
                    <div className="flex flex-wrap gap-3">
                        {Object.keys(CATEGORIES).map(catKey => (
                            <button
                                key={catKey}
                                onClick={() => setFilterCategory(catKey)}
                                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all shadow-sm ${filterCategory === catKey
                                    ? "bg-rose-500 text-white"
                                    : "bg-rose-50 text-rose-500 hover:bg-rose-100"
                                    }`}
                            >
                                {CATEGORIES[catKey].label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Select Services Grid */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <Label className="text-gray-700 font-medium block">Select Services</Label>
                        <Dialog open={isAddServiceOpen} onOpenChange={setIsAddServiceOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 gap-1 text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700">
                                    <Plus className="h-3.5 w-3.5" /> Add Service
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Add New Service</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleAddService} className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                        <Label>Service Name</Label>
                                        <Input
                                            placeholder="e.g., Gel Manicure"
                                            value={newServiceName}
                                            onChange={(e) => setNewServiceName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Category</Label>
                                        <select
                                            className="w-full h-10 px-3 py-2 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                                            value={newServiceCategory}
                                            onChange={(e) => setNewServiceCategory(e.target.value)}
                                        >
                                            {Object.entries(CATEGORIES)
                                                .filter(([key]) => key !== "ALL")
                                                .map(([key, value]) => (
                                                    <option key={key} value={key}>{value.label}</option>
                                                ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Price (THB)</Label>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            min="0"
                                            value={newServicePrice}
                                            onChange={(e) => setNewServicePrice(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600 text-white" disabled={isSubmittingService}>
                                        {isSubmittingService ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                        Save Service
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                    {loading ? (
                        <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-rose-400" /></div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {filteredSvcs.map((svc) => {
                                const inCart = cart.find((c) => c.service.id === svc.id);
                                return (
                                    <button key={svc.id} onClick={() => addToCart(svc)}
                                        className={`p-4 rounded-xl border-2 text-left transition-all duration-200 h-28 flex flex-col justify-between ${inCart
                                            ? "border-rose-400 bg-rose-50 shadow-inner"
                                            : "border-gray-50 bg-white hover:border-rose-200 hover:shadow-md"
                                            }`}>
                                        <div>
                                            <div className="font-semibold text-gray-800 text-[13px] leading-snug line-clamp-2">{svc.name}</div>
                                        </div>
                                        <div className="flex items-end justify-between w-full mt-2">
                                            <span className="text-[15px] font-bold text-rose-600">{svc.price} THB</span>
                                            {inCart && <Badge className="bg-rose-500 hover:bg-rose-600 text-white text-[10px] px-1.5 rounded-md min-w-[20px] text-center">{inCart.quantity}</Badge>}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Selected Services / Cart */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 min-h-[140px]">
                    <Label className="text-gray-700 font-medium mb-4 block">Selected Services</Label>
                    {cart.length === 0 ? (
                        <div className="border-2 border-dashed border-gray-200 mt-2 rounded-xl p-8 flex items-center justify-center text-gray-400 text-sm">
                            <p>No services selected</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {cart.map((item) => (
                                <div key={item.service.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[15px] font-semibold text-gray-800">{item.service.name}</p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-[15px] font-bold text-gray-900">{item.service.price * item.quantity} THB</p>
                                            <p className="text-xs text-gray-500 font-medium mt-0.5">x {item.quantity}</p>
                                        </div>
                                        <button onClick={() => removeFromCart(item.service.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors">
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Payment Method */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <Label className="text-gray-700 font-medium mb-4 block">Payment Method</Label>
                    <div className="flex flex-wrap gap-3">
                        {(Object.keys(PAYMENT_LABELS) as PaymentMethod[]).map(methodKey => (
                            <button
                                key={methodKey}
                                onClick={() => setPaymentMethod(methodKey)}
                                className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${paymentMethod === methodKey
                                    ? "border-2 border-rose-400 bg-rose-50 text-rose-600"
                                    : "border-2 border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100"
                                    }`}
                            >
                                {PAYMENT_LABELS[methodKey]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Total & Checkout */}
                <div className="space-y-4 pt-4 pb-8">
                    <div className="bg-rose-500 rounded-xl p-8 text-center shadow-md relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

                        <p className="text-white/90 text-[15px] font-semibold mb-2">Total Amount</p>
                        <div className="flex items-baseline justify-center gap-2">
                            <span className="text-white text-5xl font-bold tracking-tight">{cartTotal}</span>
                            <span className="text-white/90 text-2xl font-bold tracking-tight">THB</span>
                        </div>
                    </div>
                    <Button
                        onClick={handleCheckout}
                        disabled={processing}
                        className="w-full bg-[#10B981] hover:bg-[#059669] text-white py-8 text-xl font-bold rounded-xl shadow-md transition-all active:scale-[0.98]"
                    >
                        {processing ? (
                            <><Loader2 className="mr-2 h-6 w-6 animate-spin" /> Saving...</>
                        ) : (
                            "Confirm Payment"
                        )}
                    </Button>
                </div>

            </div>
        </div>
    );
}
