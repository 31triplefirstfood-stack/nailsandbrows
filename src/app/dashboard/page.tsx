"use client";

import { useState, useEffect } from "react";
import { CalendarDays, TrendingUp, TrendingDown, Users, Clock, Sparkles, ArrowRight, BarChart2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { useSettingsStore } from "@/store/settings";
import { Progress } from "@/components/ui/progress";
import { PinGate } from "@/components/pin-gate";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const BarTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-800 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full inline-block" style={{ background: p.color }} />
          <span className="text-gray-600">{p.name}:</span>
          <span className="font-bold text-gray-900">฿{p.value.toLocaleString()}</span>
        </div>
      ))}
      {payload.length === 2 && (
        <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between">
          <span className="text-gray-500 text-xs">กำไร</span>
          <span className={`font-bold text-xs ${(payload[0].value - payload[1].value) >= 0 ? "text-green-600" : "text-red-500"}`}>
            ฿{(payload[0].value - payload[1].value).toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
};

interface DashboardData {
  todayRevenue: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  recentTransactions: Array<{ id: string; customerName: string; totalAmount: number; paymentMethod: string; date: string }>;
  totalServices: number;
}

interface MonthlyData { month: string; income: number; expenses: number; monthIndex: number; }
interface ReportsData {
  monthlyData: MonthlyData[];
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
  CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200",
  COMPLETED: "bg-green-100 text-green-700 border-green-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
};
const STATUS_TH: Record<string, string> = {
  PENDING: "รอยืนยัน", CONFIRMED: "ยืนยันแล้ว", COMPLETED: "เสร็จสิ้น", CANCELLED: "ยกเลิก"
};

export default function DashboardPage() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [data, setData] = useState<DashboardData | null>(null);
  const [reportsData, setReportsData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { settings, isLoading: settingsLoading } = useSettingsStore();
  const todayTh = format(now, "EEEE d MMMM yyyy", { locale: th });

  const MONTHS = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
  const YEARS = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/dashboard?month=${selectedMonth}&year=${selectedYear}`).then((r) => r.json()),
      fetch(`/api/reports?year=${selectedYear}`).then((r) => r.json())
    ])
      .then(([dashboardRes, reportsRes]) => {
        setData(dashboardRes);
        setReportsData(reportsRes);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedMonth, selectedYear]);

  const netProfit = (data?.monthlyRevenue ?? 0) - (data?.monthlyExpenses ?? 0);

  if (loading) {
    return (
      <PinGate storageKey="pin-dashboard">
        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-48 rounded-md" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border-0 shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border-0 shadow-sm h-[320px]">
              <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm h-[320px]">
              <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm h-[320px]">
              <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
              </CardContent>
            </Card>
          </div>
        </div>
      </PinGate>
    );
  }

  return (
    <PinGate storageKey="pin-dashboard">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              ภาพรวม <Sparkles className="h-5 w-5 text-rose-400" />
            </h1>
            <p className="text-sm text-gray-500 mt-0.5 capitalize">{todayTh}</p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(Number(v))}>
              <SelectTrigger className="w-[120px] bg-white">
                <SelectValue placeholder="เดือน" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m, i) => (
                  <SelectItem key={i} value={i.toString()}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(Number(v))}>
              <SelectTrigger className="w-[100px] bg-white">
                <SelectValue placeholder="ปี" />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((y) => (
                  <SelectItem key={y} value={y.toString()}>{y + 543}</SelectItem>
                ))}
              </SelectContent>
            </Select>


          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "รายได้วันนี้",
              value: `฿${(data?.todayRevenue ?? 0).toLocaleString()}`,
              icon: TrendingUp,
              color: "bg-rose-50 text-rose-600",
              iconBg: "bg-rose-100",
              target: settings?.dailyTarget || 0,
              actual: data?.todayRevenue || 0
            },
            {
              label: "รายได้เดือนนี้",
              value: `฿${(data?.monthlyRevenue ?? 0).toLocaleString()}`,
              icon: TrendingUp,
              color: "bg-green-50 text-green-600",
              iconBg: "bg-green-100",
              target: settings?.monthlyTarget || 0,
              actual: data?.monthlyRevenue || 0
            },
            {
              label: "รายจ่ายเดือนนี้",
              value: `฿${(data?.monthlyExpenses ?? 0).toLocaleString()}`,
              icon: TrendingDown,
              color: "bg-orange-50 text-orange-600",
              iconBg: "bg-orange-100"
            },
            {
              label: "กำไรสุทธิ",
              value: `฿${netProfit.toLocaleString()}`,
              icon: Users,
              color: netProfit >= 0 ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600",
              iconBg: netProfit >= 0 ? "bg-blue-100" : "bg-red-100"
            },
          ].map((s) => {
            const Icon = s.icon;
            const targetPercent = s.target ? Math.min((s.actual! / s.target) * 100, 100) : 0;

            return (
              <Card key={s.label} className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center sm:items-start gap-3 mb-3">
                    <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl ${s.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${s.color.split(" ")[1]}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500 truncate">{s.label}</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{s.value}</p>
                    </div>
                  </div>

                  {s.target !== undefined && s.target > 0 && (
                    <div className="space-y-1.5 mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>เป้าหมาย {s.target.toLocaleString()}</span>
                        <span className="font-medium text-gray-700">{targetPercent.toFixed(0)}%</span>
                      </div>
                      <Progress value={targetPercent} className="h-1.5" />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bar Chart — Monthly Income vs Expenses */}
          <Card className="lg:col-span-2 border border-gray-100 shadow-sm bg-white rounded-xl">
            <CardHeader className="pb-2 pt-6 px-6">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-rose-500" />
                รายรับ vs รายจ่ายรายเดือน ปี {selectedYear + 543}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-2">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportsData?.monthlyData || []} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => v === 0 ? "0" : `${(v / 1000).toFixed(0)}k`} width={36} />
                  <Tooltip content={<BarTooltip />} cursor={{ fill: "#fdf2f8", radius: 6 }} />
                  <Legend
                    formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
                    wrapperStyle={{ paddingTop: "12px" }}
                  />
                  <Bar dataKey="income" name="รายรับ" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="expenses" name="รายจ่าย" fill="#fda4af" radius={[6, 6, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="border border-gray-100 shadow-sm bg-white rounded-xl">
            <CardHeader className="pb-3 pt-6 px-6 flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" /> รายการขายล่าสุด
              </CardTitle>
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-rose-500 h-7 px-2 text-xs gap-1">ดูทั้งหมด <ArrowRight className="h-3 w-3" /></Button>
              </Link>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-0 space-y-3">
              {!data?.recentTransactions?.length ? (
                <div className="text-center py-8 text-gray-400">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">ยังไม่มีรายการขาย</p>
                </div>
              ) : (
                data.recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{tx.customerName}</p>
                      <p className="text-xs text-gray-500">
                        {tx.date ? format(new Date(tx.date), "d MMM · HH:mm", { locale: th }) : "-"}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-green-600">+฿{tx.totalAmount.toLocaleString()}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>


      </div>
    </PinGate>
  );
}
