"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { partnerApi } from "@/lib/api/endpoints";
import { formatCurrency } from "@/lib/utils/format";
import { useTranslation } from "@/lib/i18n";
import { Package, Wallet, ClipboardList } from "lucide-react";

const chartData = [
  { week: "W1", earnings: 120 },
  { week: "W2", earnings: 85 },
  { week: "W3", earnings: 140 },
  { week: "W4", earnings: 200 },
];

export default function PartnerDashboardPage() {
  const { t } = useTranslation();
  const { data: missionsData, isLoading } = useQuery({
    queryKey: ["partner-missions"],
    queryFn: () => partnerApi.myMissions().then((r) => r.data),
  });
  const { data: earnings, isLoading: earningsLoading } = useQuery({
    queryKey: ["partner-earnings"],
    queryFn: () => partnerApi.earnings().then((r) => r.data),
  });

  const missions = missionsData?.missions ?? [];
  const active = missions.filter((m) => !["delivered", "cancelled"].includes(m.status)).length;
  const completed = missions.filter((m) => m.status === "delivered").length;
  const totalEarned = earnings?.total_earnings ?? 0;

  if (isLoading || earningsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">{t("nav.dashboard")}</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("partner.missionsCompleted")}</CardTitle>
            <ClipboardList className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("mission.active")}</CardTitle>
            <Package className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("partner.totalEarned")}</CardTitle>
            <Wallet className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEarned)}</div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("partnerDashboard.earningsOverview")}</CardTitle>
          <CardDescription>{t("partnerDashboard.weeklyEarningsSample")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              earnings: { label: t("nav.earnings"), color: "var(--chart-1)" },
            }}
            className="h-64 w-full"
          >
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="week" className="text-xs" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="earnings"
                stroke="var(--chart-1)"
                fill="var(--chart-1)"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
