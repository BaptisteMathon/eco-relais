"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { adminApi } from "@/lib/api/endpoints";
import { formatCurrency } from "@/lib/utils/format";
import { useTranslation } from "@/lib/i18n";
import { Users, Package, DollarSign, TrendingUp } from "lucide-react";

function formatMonthLabel(ym: string, locale: string): string {
  const [y, m] = ym.split("-").map(Number);
  const date = new Date(y, m - 1, 1);
  return date.toLocaleString(locale === "fr" ? "fr-FR" : "en-US", { month: "short" });
}

export default function AdminDashboardPage() {
  const { t, locale } = useTranslation();
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminApi.stats().then((r) => r.data),
  });

  const chartData = useMemo(() => {
    const growth = stats?.growth ?? [];
    return growth.map((row) => ({
      ...row,
      month: formatMonthLabel(row.month, locale),
    }));
  }, [stats?.growth, locale]);

  const growthPercent = useMemo(() => {
    const g = stats?.growth ?? [];
    if (g.length < 2) return null;
    const prev = g[g.length - 2].revenue;
    const curr = g[g.length - 1].revenue;
    if (prev === 0) return null;
    return Math.round(((curr - prev) / prev) * 100);
  }, [stats?.growth]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  const totalUsers = stats?.total_users ?? 0;
  const activeMissions = stats?.active_missions ?? 0;
  const revenue = stats?.revenue ?? 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">{t("adminDashboard.adminDashboard")}</h2>
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("admin.totalUsers")}</CardTitle>
            <Users className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("admin.activeMissions")}</CardTitle>
            <Package className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeMissions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("admin.revenue")}</CardTitle>
            <DollarSign className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(revenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("adminDashboard.growth")}</CardTitle>
            <TrendingUp className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {growthPercent != null ? (growthPercent >= 0 ? `+${growthPercent}%` : `${growthPercent}%`) : "—"}
            </div>
            <p className="text-muted-foreground text-xs">{t("adminDashboard.vsLastMonth")}</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("adminDashboard.overview")}</CardTitle>
          <CardDescription>{t("adminDashboard.sampleGrowthData")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              users: { label: t("admin.users"), color: "var(--chart-1)" },
              revenue: { label: t("admin.revenue"), color: "var(--chart-2)" },
            }}
            className="h-64 w-full"
          >
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="users" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="revenue" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
