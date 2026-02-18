"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { missionsApi } from "@/lib/api/endpoints";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import { useTranslation, useMissionStatusLabels } from "@/lib/i18n";
import { Package, Plus } from "lucide-react";

export default function ClientDashboardPage() {
  const { t } = useTranslation();
  const MISSION_STATUS_LABELS = useMissionStatusLabels();
  const { data, isLoading } = useQuery({
    queryKey: ["missions"],
    queryFn: () => missionsApi.list().then((r) => r.data),
  });

  const missions = data?.missions ?? [];
  const active = missions.filter((m) => !["delivered", "cancelled"].includes(m.status)).length;
  const completed = missions.filter((m) => m.status === "delivered").length;
  const totalSpent = missions
    .filter((m) => m.status === "delivered")
    .reduce((sum, m) => sum + m.price, 0);
  const recent = missions.slice(0, 5);

  if (isLoading) {
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-trust-blue font-bold tracking-tight">{t("client.dashboard")}</h2>
        <Button asChild>
          <Link href="/client/new-mission">
            <Plus className="mr-2 size-4" />
            {t("mission.newMission")}
          </Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("mission.activeMissions")}</CardTitle>
            <Package className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("mission.completed")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("mission.totalSpent")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("mission.recentMissions")}</CardTitle>
          <CardDescription>{t("client.recentMissionsSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              {t("mission.noMissionsYet")}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("mission.title")}</TableHead>
                  <TableHead>{t("admin.status")}</TableHead>
                  <TableHead>{t("common.created")}</TableHead>
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.package_title}</TableCell>
                    <TableCell>
                      <Badge variant={m.status === "delivered" ? "default" : "secondary"}>
                        {MISSION_STATUS_LABELS[m.status] ?? m.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(m.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/client/missions/${m.id}`}>{t("common.view")}</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
