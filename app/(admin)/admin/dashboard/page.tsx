"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { adminApi } from "@/lib/api/endpoints";
import { formatCurrency } from "@/lib/utils/format";
import { useTranslation } from "@/lib/i18n";
import { Users, Package, DollarSign, TrendingUp } from "lucide-react";

const growthData = [
  { month: "Jan", users: 40, revenue: 240 },
  { month: "Feb", users: 65, revenue: 380 },
  { month: "Mar", users: 88, revenue: 520 },
];

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminApi.stats().then((r) => r.data),
  });

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
            <div className="text-2xl font-bold">+12%</div>
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
            <BarChart data={growthData}>
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
