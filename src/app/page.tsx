"use client";

import { useState, useEffect } from "react";
import { CalendarDays, TrendingUp, TrendingDown, Users, Clock, Sparkles, ArrowRight } from "lucide-react";
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

interface DashboardData {
  todayRevenue: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  upcomingAppointments: Array<{ id: string; customerName: string; service: { name: string }; time: string; date: string; status: string }>;
  recentTransactions: Array<{ id: string; customerName: string; totalAmount: number; paymentMethod: string; date: string }>;
  todayEmployees: Array<{ id: string; name: string; role: string }>;
  totalServices: number;
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
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { settings, isLoading: settingsLoading } = useSettingsStore();
  const todayTh = format(new Date(), "EEEE d MMMM yyyy", { locale: th });

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const netProfit = (data?.monthlyRevenue ?? 0) - (data?.monthlyExpenses ?? 0);

  if (loading) {
    return (
      <PinGate storageKey="pin-dashboard">
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
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
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              สวัสดี! <Sparkles className="h-5 w-5 text-rose-400" />
            </h1>
            <p className="text-sm text-gray-500 mt-0.5 capitalize">{todayTh}</p>
          </div>
          <Link href="/records">
            <Button className="bg-rose-500 hover:bg-rose-600 text-white gap-2 shadow-lg shadow-rose-200">
              <TrendingUp className="h-4 w-4" /> เปิด POS บันทึกการขาย
            </Button>
          </Link>
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
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`h-10 w-10 rounded-xl ${s.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`h-5 w-5 ${s.color.split(" ")[1]}`} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{s.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{s.value}</p>
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
          {/* Upcoming Appointments */}
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-rose-500" /> นัดหมายที่กำลังมา
              </CardTitle>
              <Link href="/appointments">
                <Button variant="ghost" size="sm" className="text-rose-500 h-7 px-2 text-xs gap-1">ดูทั้งหมด <ArrowRight className="h-3 w-3" /></Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {!data?.upcomingAppointments?.length ? (
                <div className="text-center py-8 text-gray-400">
                  <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">ไม่มีนัดหมายที่กำลังมาถึง</p>
                </div>
              ) : (
                data.upcomingAppointments.map((appt) => (
                  <div key={appt.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="h-8 w-8 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-4 w-4 text-rose-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{appt.customerName}</p>
                      <p className="text-xs text-gray-500">{appt.service?.name} · {appt.time}</p>
                    </div>
                    <Badge variant="outline" className={`text-xs ${STATUS_COLOR[appt.status] ?? ""}`}>
                      {STATUS_TH[appt.status] ?? appt.status}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" /> รายการขายล่าสุด
              </CardTitle>
              <Link href="/records">
                <Button variant="ghost" size="sm" className="text-rose-500 h-7 px-2 text-xs gap-1">ดูทั้งหมด <ArrowRight className="h-3 w-3" /></Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
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

          {/* Today's Employees */}
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" /> พนักงานประจำวันนี้
              </CardTitle>
              <div className="text-xs text-gray-400">{data?.todayEmployees?.length ?? 0} คน</div>
            </CardHeader>
            <CardContent className="space-y-3">
              {!data?.todayEmployees?.length ? (
                <div className="text-center py-8 text-gray-400">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">ไม่มีข้อมูลพนักงาน</p>
                </div>
              ) : (
                data.todayEmployees.map((emp) => (
                  <div key={emp.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{emp.name}</p>
                      <p className="text-xs text-gray-500">{emp.role === "ADMIN" ? "แอดมิน" : "พนักงาน"}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs bg-white">
                      พร้อมให้บริการ
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: "/services", label: "รายการบริการ", emoji: "💅", count: data?.totalServices ?? 0, unit: "บริการ" },
            { href: "/appointments", label: "นัดหมาย", emoji: "📅", count: data?.upcomingAppointments?.length ?? 0, unit: "นัดที่รอ" },
            { href: "/expenses", label: "รายจ่าย", emoji: "💸", count: `฿${(data?.monthlyExpenses ?? 0).toLocaleString()}`, unit: "เดือนนี้" },
            { href: "/reports", label: "รายงาน", emoji: "📊", count: "→", unit: "ดูรายงาน" },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="border border-gray-100 shadow-sm hover:shadow-md hover:border-rose-200 transition-all bg-white cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-1">{item.emoji}</div>
                  <p className="text-sm text-gray-500 mb-1">{item.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{item.count}</p>
                  <p className="text-sm text-gray-400">{item.unit}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </PinGate>
  );
}
