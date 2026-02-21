"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { adminApi } from "@/lib/api/endpoints";
import { formatDate } from "@/lib/utils/format";
import { useTranslation } from "@/lib/i18n";
import type { Dispute } from "@/lib/types";
import { Eye } from "lucide-react";

export default function AdminDisputesPage() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [resolveId, setResolveId] = useState<string | null>(null);
  const [resolution, setResolution] = useState("");
  const [detailDispute, setDetailDispute] = useState<Dispute | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-disputes"],
    queryFn: () => adminApi.disputes().then((r) => r.data?.disputes ?? []),
  });

  const list = data ?? [];

  const resolveMutation = useMutation({
    mutationFn: ({ id, resolution: res }: { id: string; resolution: string }) =>
      adminApi.resolveDispute(id, res).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-disputes"] });
      setResolveId(null);
      setResolution("");
      toast.success(t("admin.disputeResolved"));
    },
    onError: (e: { response?: { data?: { message?: string } } }) => {
      toast.error(e.response?.data?.message || t("admin.resolveFailed"));
    },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">{t("admin.disputes")}</h2>
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.disputeQueue")}</CardTitle>
          <CardDescription>{t("admin.reviewDisputes")}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground py-8 text-center">{t("common.loading")}</p>
          ) : list.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">{t("admin.noDisputes")}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("clientPayments.missionId")}</TableHead>
                  <TableHead>{t("admin.reason")}</TableHead>
                  <TableHead>{t("admin.status")}</TableHead>
                  <TableHead>{t("common.created")}</TableHead>
                  <TableHead className="w-32" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono text-sm">{d.mission_id}</TableCell>
                    <TableCell>{d.reason}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          d.status === "resolved" ? "default" : "secondary"
                        }
                      >
                        {d.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(d.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDetailDispute(d)}
                        >
                          <Eye className="mr-1 size-4" />
                          {t("common.view")}
                        </Button>
                        {d.status !== "resolved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setResolveId(d.id)}
                          >
                            {t("admin.resolve")}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!detailDispute} onOpenChange={(open) => !open && setDetailDispute(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("admin.disputeDetails") || "Dispute details"}</DialogTitle>
            {detailDispute && (
              <DialogDescription>
                {t("clientPayments.missionId")}: {detailDispute.mission_id}
              </DialogDescription>
            )}
          </DialogHeader>
          {detailDispute && (
            <div className="grid gap-4 py-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground text-sm font-medium">{t("admin.status")}:</span>
                <Badge variant={detailDispute.status === "resolved" ? "default" : "secondary"}>{detailDispute.status}</Badge>
              </div>
              <div>
                <span className="text-muted-foreground text-sm font-medium">{t("clientPayments.missionId")}:</span>
                <p className="font-mono text-sm">{detailDispute.mission_id}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm font-medium">{t("admin.reason")}:</span>
                <p>{detailDispute.reason}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm font-medium">{t("common.created")}:</span>
                <p className="text-sm">{formatDate(detailDispute.created_at)}</p>
              </div>
              {detailDispute.status === "resolved" && (
                <>
                  {detailDispute.resolution && (
                    <div>
                      <span className="text-muted-foreground text-sm font-medium">{t("admin.resolution")}:</span>
                      <p className="text-sm">{detailDispute.resolution}</p>
                    </div>
                  )}
                  {detailDispute.resolved_at && (
                    <div>
                      <span className="text-muted-foreground text-sm font-medium">{t("admin.resolvedAt")}:</span>
                      <p className="text-sm">{formatDate(detailDispute.resolved_at)}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!resolveId} onOpenChange={() => setResolveId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.resolveDispute")}</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder={t("admin.resolutionNotes")}
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveId(null)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={() =>
                resolveId && resolveMutation.mutate({ id: resolveId, resolution })
              }
              disabled={!resolution.trim() || resolveMutation.isPending}
            >
              {t("admin.submitResolution")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
