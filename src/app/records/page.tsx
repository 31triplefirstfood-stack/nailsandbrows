"use client";

import { useState, useEffect, useCallback } from "react";
import { ShoppingCart, Plus, Trash2, Search, CheckCircle, Loader2, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { format } from "date-fns";
import { th } from "date-fns/locale";

type PaymentMethod = "CASH" | "TRANSFER" | "PROMPTPAY" | "CREDIT_CARD";

interface ServiceItem { id: string; name: string; category: string; price: number; durationMinutes: number; }
interface CartItem { service: ServiceItem; quantity: number; }
interface Transaction {
    id: string;
    customerName: string;
    totalAmount: number;
    paymentMethod: PaymentMethod;
    description: string;
    date: string;
    items: { service: ServiceItem; quantity: number; price: number }[];
}

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
    CASH: "💵 เงินสด", TRANSFER: "🏦 โอนเงิน", PROMPTPAY: "📱 พร้อมเพย์", CREDIT_CARD: "💳 บัตร"
};

const CATEGORIES: Record<string, { label: string }> = {
    NAILS: { label: "เล็บ" }, BROWS: { label: "คิ้ว" }, OTHERS: { label: "อื่นๆ" }
};

export default function RecordsPage() {
    const [services, setServices] = useState<ServiceItem[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [customerName, setCustomerName] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
    const [searchSvc, setSearchSvc] = useState("");
    const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [tab, setTab] = useState<"pos" | "history">("pos");

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [svcRes, txRes] = await Promise.all([fetch("/api/services"), fetch("/api/transactions")]);
            setServices(await svcRes.json());
            setTransactions(await txRes.json());
        } catch { toast.error("โหลดข้อมูลไม่สำเร็จ"); }
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
        if (!customerName.trim()) { toast.error("กรุณาระบุชื่อลูกค้า"); return; }
        if (cart.length === 0) { toast.error("กรุณาเลือกบริการ"); return; }
        setProcessing(true);
        try {
            const body = {
                customerName: customerName.trim(),
                paymentMethod,
                totalAmount: cartTotal,
                description: cart.map((c) => c.service.name).join(", "),
                date: new Date().toISOString(),
                items: cart.map((c) => ({ serviceId: c.service.id, quantity: c.quantity, price: c.service.price })),
            };
            const res = await fetch("/api/transactions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            if (!res.ok) throw new Error();
            toast.success(`ชำระเงินสำเร็จ ฿${cartTotal.toLocaleString()} — ${PAYMENT_LABELS[paymentMethod]}`);
            setCart([]); setCustomerName(""); setPaymentMethod("CASH"); setCheckoutDialogOpen(false);
            fetchAll();
        } catch { toast.error("บันทึกไม่สำเร็จ"); }
        finally { setProcessing(false); }
    };

    const filteredSvcs = services.filter((s) => s.name.includes(searchSvc));
    const todayTx = transactions.filter((t) => t.date?.slice(0, 10) === format(new Date(), "yyyy-MM-dd"));
    const todayRevenue = todayTx.reduce((sum, t) => sum + t.totalAmount, 0);

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">บันทึกการขาย</h1>
                    <p className="text-sm text-gray-500 mt-0.5">รายได้วันนี้: <span className="font-bold text-rose-600">฿{todayRevenue.toLocaleString()}</span></p>
                </div>
                <div className="flex gap-2">
                    <Button variant={tab === "pos" ? "default" : "outline"} onClick={() => setTab("pos")} className={tab === "pos" ? "bg-rose-500 hover:bg-rose-600 text-white" : ""}>
                        <ShoppingCart className="h-4 w-4 mr-1.5" /> POS
                    </Button>
                    <Button variant={tab === "history" ? "default" : "outline"} onClick={() => setTab("history")} className={tab === "history" ? "bg-rose-500 hover:bg-rose-600 text-white" : ""}>
                        <Receipt className="h-4 w-4 mr-1.5" /> ประวัติ
                    </Button>
                </div>
            </div>

            {tab === "pos" ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Service Selector */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input placeholder="ค้นหาบริการ..." className="pl-9" value={searchSvc} onChange={(e) => setSearchSvc(e.target.value)} />
                        </div>
                        {loading ? (
                            <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-rose-400" /></div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {filteredSvcs.map((svc) => {
                                    const inCart = cart.find((c) => c.service.id === svc.id);
                                    return (
                                        <button key={svc.id} onClick={() => addToCart(svc)}
                                            className={`p-4 rounded-xl border text-left transition-all duration-150 ${inCart ? "border-rose-400 bg-rose-50 ring-1 ring-rose-300" : "border-gray-100 bg-white hover:border-rose-200 hover:shadow-md"}`}>
                                            <div className="text-xs text-gray-400 mb-1">{CATEGORIES[svc.category]?.label}</div>
                                            <div className="font-semibold text-gray-900 text-sm leading-snug">{svc.name}</div>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-base font-bold text-rose-600">฿{svc.price.toLocaleString()}</span>
                                                {inCart && <Badge className="bg-rose-500 text-white text-xs px-1.5">{inCart.quantity}</Badge>}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Cart */}
                    <div>
                        <Card className="shadow-sm border-0 sticky top-6">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <ShoppingCart className="h-4 w-4 text-rose-500" /> ตะกร้า ({cart.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {cart.length === 0 ? (
                                    <p className="text-center text-gray-400 text-sm py-6">ยังไม่ได้เลือกบริการ</p>
                                ) : (
                                    <>
                                        {cart.map((item) => (
                                            <div key={item.service.id} className="flex items-center justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{item.service.name}</p>
                                                    <p className="text-xs text-gray-400">x{item.quantity} · ฿{(item.service.price * item.quantity).toLocaleString()}</p>
                                                </div>
                                                <button onClick={() => removeFromCart(item.service.id)} className="ml-2 p-1 hover:bg-red-50 rounded text-red-400">
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                        <Separator />
                                        <div className="flex justify-between font-bold text-lg">
                                            <span>รวม</span>
                                            <span className="text-rose-600">฿{cartTotal.toLocaleString()}</span>
                                        </div>
                                        <Button onClick={() => setCheckoutDialogOpen(true)} className="w-full bg-rose-500 hover:bg-rose-600 text-white gap-2">
                                            <CheckCircle className="h-4 w-4" /> ชำระเงิน
                                        </Button>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            ) : (
                /* History Tab */
                <div className="space-y-3">
                    {loading ? (
                        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-rose-400" /></div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <Receipt className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p>ยังไม่มีประวัติการขาย</p>
                        </div>
                    ) : (
                        transactions.map((tx) => (
                            <Card key={tx.id} className="border border-gray-100 shadow-sm bg-white">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-gray-900">{tx.customerName}</p>
                                            <p className="text-sm text-gray-500 mt-0.5 truncate max-w-xs">{tx.description}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {tx.date ? format(new Date(tx.date), "d MMM yyyy HH:mm", { locale: th }) : "-"}
                                                {" · "}{PAYMENT_LABELS[tx.paymentMethod]}
                                            </p>
                                        </div>
                                        <span className="text-lg font-bold text-green-600">+฿{tx.totalAmount.toLocaleString()}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}

            {/* Checkout Dialog */}
            <Dialog open={checkoutDialogOpen} onOpenChange={setCheckoutDialogOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader><DialogTitle>ยืนยันการชำระเงิน</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label>ชื่อลูกค้า</Label>
                            <Input placeholder="คุณแนน" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>ช่องทางชำระเงิน</Label>
                            <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {(Object.keys(PAYMENT_LABELS) as PaymentMethod[]).map((k) => (
                                        <SelectItem key={k} value={k}>{PAYMENT_LABELS[k]}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="bg-rose-50 rounded-xl p-4 text-center">
                            <p className="text-sm text-gray-500">ยอดรวม</p>
                            <p className="text-3xl font-bold text-rose-600 mt-1">฿{cartTotal.toLocaleString()}</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCheckoutDialogOpen(false)} disabled={processing}>ยกเลิก</Button>
                        <Button onClick={handleCheckout} disabled={processing} className="bg-rose-500 hover:bg-rose-600 text-white">
                            {processing ? "กำลังบันทึก..." : "ยืนยันชำระเงิน"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
