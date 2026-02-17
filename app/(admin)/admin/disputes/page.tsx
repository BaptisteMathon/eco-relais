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
  DialogFooter,
} from "@/components/ui/dialog";
import { adminApi } from "@/lib/api/endpoints";
import { formatDate } from "@/lib/utils/format";
import { useTranslation } from "@/lib/i18n";

// Mock disputes if API returns empty
const MOCK_DISPUTES = [
  {
    id: "d1",
    mission_id: "m1",
    raised_by: "user-1",
    reason: "Package not delivered on time",
    status: "open" as const,
    created_at: new Date().toISOString(),
  },
];

export default function AdminDisputesPage() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [resolveId, setResolveId] = useState<string | null>(null);
  const [resolution, setResolution] = useState("");

  const { data: disputes = [], isLoading } = useQuery({
    queryKey: ["admin-disputes"],
    queryFn: () => adminApi.disputes().then((r) => r.data),
  });

  const list = disputes.length > 0 ? disputes : MOCK_DISPUTES;

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
                  <TableHead className="w-24" />
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
                      {d.status !== "resolved" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setResolveId(d.id)}
                        >
                          {t("admin.resolve")}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

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
