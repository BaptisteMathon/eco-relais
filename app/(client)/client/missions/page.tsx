"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
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
import { missionsApi } from "@/lib/api/endpoints";
import { formatDate } from "@/lib/utils/format";
import { useTranslation, useMissionStatusLabels } from "@/lib/i18n";
import { MoreHorizontal, Eye, XCircle } from "lucide-react";

const STATUS_OPTIONS = ["all", "pending", "accepted", "collected", "in_transit", "delivered", "cancelled"];

export default function ClientMissionsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const MISSION_STATUS_LABELS = useMissionStatusLabels();

  const { data, isLoading } = useQuery({
    queryKey: ["missions", statusFilter === "all" ? undefined : statusFilter],
    queryFn: () =>
      missionsApi.list({ status: statusFilter === "all" ? undefined : statusFilter }).then((r) => r.data),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => missionsApi.cancel(id).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["missions"] });
      toast.success(t("mission.missionCancelled"));
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message || t("mission.createFailed"));
    },
  });

  const missions = data?.missions ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{t("mission.myMissions")}</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("mission.myMissions")}</CardTitle>
          <CardDescription>{t("mission.missionsDescription")}</CardDescription>
          <div className="pt-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("mission.filterByStatus")} />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "all" ? t("common.all") : MISSION_STATUS_LABELS[s] ?? s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">{t("common.loading")}</div>
          ) : missions.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">{t("mission.noMissionsFound")}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14">{t("common.photo")}</TableHead>
                  <TableHead>{t("mission.title")}</TableHead>
                  <TableHead>{t("admin.status")}</TableHead>
                  <TableHead>{t("missionDetail.partner")}</TableHead>
                  <TableHead>{t("common.created")}</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {missions.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      {m.package_photo_url ? (
                        <Image
                          src={m.package_photo_url}
                          alt=""
                          width={40}
                          height={40}
                          className="rounded object-cover"
                        />
                      ) : (
                        <div className="bg-muted flex size-10 items-center justify-center rounded text-xs">
                          —
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{m.package_title}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          m.status === "cancelled"
                            ? "destructive"
                            : m.status === "delivered"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {MISSION_STATUS_LABELS[m.status] ?? m.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {m.partner
                        ? `${m.partner.first_name} ${m.partner.last_name}`
                        : "—"}
                    </TableCell>
                    <TableCell>{formatDate(m.created_at)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/client/missions/${m.id}`}>
                              <Eye className="mr-2 size-4" />
                              {t("common.view")}
                            </Link>
                          </DropdownMenuItem>
                          {["pending", "accepted"].includes(m.status) && (
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => cancelMutation.mutate(m.id)}
                              disabled={cancelMutation.isPending}
                            >
                              <XCircle className="mr-2 size-4" />
                              {t("mission.cancel")}
                            </DropdownMenuItem>
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
