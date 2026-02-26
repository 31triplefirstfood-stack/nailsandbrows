"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, BarChart2, PieChart as PieIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, Sector,
} from "recharts";

interface MonthlyData { month: string; income: number; expenses: number; monthIndex: number; }
interface CategoryData { name: string; value: number; key: string; }
interface TopService { name: string; category: string; revenue: number; count: number; }
interface ReportsData {
    monthlyData: MonthlyData[];
    categoryData: CategoryData[];
    monthIncome: number;
    monthExpenses: number;
    monthNetProfit: number;
    topServices: TopService[];
    year: number;
    currentMonthName: string;
}

const COLORS = ["#f43f5e", "#a855f7", "#fbbf24", "#3b82f6", "#10b981"];
const CAT_COLORS: Record<string, string> = { NAILS: "#f43f5e", EYELASH: "#a855f7", PERMANENT_MAKEUP: "#fbbf24", COURSE_STUDY: "#3b82f6" };

// Custom Tooltip for Bar Chart
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

// Custom Active Shape for Donut
const ActiveShape = (props: {
    cx: number; cy: number; innerRadius: number; outerRadius: number; startAngle: number; endAngle: number;
    fill: string; payload: CategoryData; percent: number; value: number;
}) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    return (
        <g>
            <text x={cx} y={cy - 12} textAnchor="middle" fill="#111827" className="text-sm font-bold" fontSize={15} fontWeight={700}>{payload.name}</text>
            <text x={cx} y={cy + 10} textAnchor="middle" fill="#6b7280" fontSize={13}>฿{value.toLocaleString()}</text>
            <text x={cx} y={cy + 30} textAnchor="middle" fill="#9ca3af" fontSize={12}>{(percent * 100).toFixed(1)}%</text>
            <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8} startAngle={startAngle} endAngle={endAngle} fill={fill} />
            <Sector cx={cx} cy={cy} innerRadius={outerRadius + 12} outerRadius={outerRadius + 16} startAngle={startAngle} endAngle={endAngle} fill={fill} />
        </g>
    );
};

export default function ReportsPage() {
    const [data, setData] = useState<ReportsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        fetch("/api/reports")
            .then((r) => r.json())
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="p-6 space-y-6 max-w-6xl mx-auto">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
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
                    <Card className="lg:col-span-2 border-0 shadow-sm h-[380px] flex items-center justify-center p-6">
                        <Skeleton className="h-full w-full rounded-xl" />
                    </Card>
                    <Card className="border-0 shadow-sm h-[380px] flex items-center justify-center p-6">
                        <Skeleton className="h-full w-full rounded-xl" />
                    </Card>
                </div>
            </div>
        );
    }

    if (!data) return <div className="p-6 text-gray-500">ไม่สามารถโหลดข้อมูลได้</div>;

    const netProfitPositive = data.monthNetProfit >= 0;

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">รายงาน & วิเคราะห์</h1>
                <p className="text-sm text-gray-500 mt-0.5">ภาพรวมรายได้และรายจ่ายปี {data.year}</p>
            </div>

            {/* Monthly Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        label: `รายรับ (${data.currentMonthName})`,
                        value: `฿${data.monthIncome.toLocaleString()}`,
                        icon: TrendingUp,
                        iconBg: "bg-green-100",
                        iconColor: "text-green-600",
                        valueColor: "text-green-700",
                    },
                    {
                        label: `รายจ่าย (${data.currentMonthName})`,
                        value: `฿${data.monthExpenses.toLocaleString()}`,
                        icon: TrendingDown,
                        iconBg: "bg-red-100",
                        iconColor: "text-red-500",
                        valueColor: "text-red-600",
                    },
                    {
                        label: `กำไรสุทธิ (${data.currentMonthName})`,
                        value: `${netProfitPositive ? "" : "-"}฿${Math.abs(data.monthNetProfit).toLocaleString()}`,
                        icon: DollarSign,
                        iconBg: netProfitPositive ? "bg-rose-100" : "bg-orange-100",
                        iconColor: netProfitPositive ? "text-rose-500" : "text-orange-500",
                        valueColor: netProfitPositive ? "text-rose-600" : "text-orange-600",
                    },
                    {
                        label: "ยอดขายทั้งหมด (ปีนี้)",
                        value: `฿${data.monthlyData.reduce((s, m) => s + m.income, 0).toLocaleString()}`,
                        icon: BarChart2,
                        iconBg: "bg-purple-100",
                        iconColor: "text-purple-500",
                        valueColor: "text-purple-700",
                    },
                ].map((card) => {
                    const Icon = card.icon;
                    return (
                        <Card key={card.label} className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className={`h-10 w-10 rounded-xl ${card.iconBg} flex items-center justify-center flex-shrink-0`}>
                                    <Icon className={`h-5 w-5 ${card.iconColor}`} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 leading-snug">{card.label}</p>
                                    <p className={`text-3xl font-bold ${card.valueColor}`}>{card.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bar Chart — Monthly Income vs Expenses */}
                <Card className="lg:col-span-2 border-0 shadow-sm bg-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <BarChart2 className="h-4 w-4 text-rose-500" />
                            รายรับ vs รายจ่ายรายเดือน ปี {data.year}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} barGap={4}>
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

                {/* Donut Chart — Sales by Category */}
                <Card className="border-0 shadow-sm bg-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <PieIcon className="h-4 w-4 text-rose-500" />
                            ยอดขายแยกประเภท
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data.categoryData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[260px] text-gray-400">
                                <PieIcon className="h-10 w-10 mb-2 opacity-20" />
                                <p className="text-sm">ยังไม่มีข้อมูล</p>
                            </div>
                        ) : (
                            <>
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        {(() => {
                                            const AnyPie = Pie as any;
                                            return (
                                                <AnyPie
                                                    activeIndex={activeIndex}
                                                    activeShape={ActiveShape as any}
                                                    data={data.categoryData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={90}
                                                    dataKey="value"
                                                    onMouseEnter={(_: any, index: number) => setActiveIndex(index)}
                                                >
                                                    {data.categoryData.map((entry) => (
                                                        <Cell key={entry.key} fill={CAT_COLORS[entry.key] ?? COLORS[0]} />
                                                    ))}
                                                </AnyPie>
                                            );
                                        })()}
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Legend */}
                                <div className="space-y-2 mt-2">
                                    {data.categoryData.map((cat, i) => {
                                        const total = data.categoryData.reduce((s, c) => s + c.value, 0);
                                        const pct = total > 0 ? ((cat.value / total) * 100).toFixed(1) : "0";
                                        return (
                                            <div key={cat.key} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="h-3 w-3 rounded-full" style={{ background: CAT_COLORS[cat.key] ?? COLORS[i] }} />
                                                    <span className="text-gray-700">{cat.name}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-bold text-gray-900">฿{cat.value.toLocaleString()}</span>
                                                    <span className="text-gray-400 text-xs ml-1">({pct}%)</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Top Services Table */}
            <Card className="border-0 shadow-sm bg-white">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-rose-500" />
                        บริการยอดนิยม (Top 5)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {data.topServices.length === 0 ? (
                        <p className="text-center text-gray-400 text-sm py-6">ยังไม่มีข้อมูล</p>
                    ) : (
                        <div className="space-y-3">
                            {data.topServices.map((svc, i) => {
                                const maxRev = data.topServices[0]?.revenue ?? 1;
                                const pct = (svc.revenue / maxRev) * 100;
                                return (
                                    <div key={svc.name} className="flex items-center gap-4">
                                        <span className="text-sm font-bold text-gray-400 w-5 text-right">{i + 1}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-medium text-gray-900 truncate">{svc.name}</span>
                                                <span className="text-sm font-bold text-rose-600 ml-2">฿{svc.revenue.toLocaleString()}</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${pct}%`, background: COLORS[i] ?? "#f43f5e" }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-400 mt-0.5">{svc.count} ครั้ง</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
