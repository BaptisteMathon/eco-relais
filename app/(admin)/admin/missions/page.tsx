"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { adminApi } from "@/lib/api/endpoints";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import { useTranslation, useMissionStatusLabels } from "@/lib/i18n";
import { Eye, XCircle, CheckCircle } from "lucide-react";

export default function AdminMissionsPage() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const MISSION_STATUS_LABELS = useMissionStatusLabels();
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-missions", statusFilter === "all" ? undefined : statusFilter],
    queryFn: () =>
      adminApi
        .missions(statusFilter === "all" ? undefined : { status: statusFilter })
        .then((r) => r.data),
  });

  const cancelMutation = useMutation({
    mutationFn: (missionId: string) => adminApi.missionAction(missionId, "cancel").then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-missions"] });
      toast.success(t("admin.missionCancelled"));
    },
  });

  const resolveMutation = useMutation({
    mutationFn: (missionId: string) => adminApi.missionAction(missionId, "resolve").then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-missions"] });
      toast.success(t("admin.missionResolved"));
    },
  });

  const missions = data?.data ?? [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">{t("admin.missions")}</h2>
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.allMissions")}</CardTitle>
          <CardDescription>{t("admin.viewManageMissions")}</CardDescription>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder={t("admin.status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              {Object.entries(MISSION_STATUS_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground py-8 text-center">{t("common.loading")}</p>
          ) : missions.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">{t("admin.noMissionsFound")}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("mission.title")}</TableHead>
                  <TableHead>{t("admin.status")}</TableHead>
                  <TableHead>{t("missionDetail.price")}</TableHead>
                  <TableHead>{t("common.created")}</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {missions.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.package_title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {MISSION_STATUS_LABELS[m.status] ?? m.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(m.price)}</TableCell>
                    <TableCell>{formatDate(m.created_at)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Eye className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/client/missions/${m.id}`}>{t("common.view")}</Link>
                          </DropdownMenuItem>
                          {!["delivered", "cancelled"].includes(m.status) && (
                            <>
                              <DropdownMenuItem
                                onClick={() => cancelMutation.mutate(m.id)}
                              >
                                <XCircle className="mr-2 size-4" />
                                {t("mission.cancel")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => resolveMutation.mutate(m.id)}
                              >
                                <CheckCircle className="mr-2 size-4" />
                                {t("admin.resolve")}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
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
