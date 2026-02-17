"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
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
import { Skeleton } from "@/components/ui/skeleton";
import { partnerApi } from "@/lib/api/endpoints";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { useTranslation } from "@/lib/i18n";
import { Wallet } from "lucide-react";

export default function PartnerEarningsPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ["partner-earnings"],
    queryFn: () => partnerApi.earnings().then((r) => r.data),
  });

  const requestPayoutMutation = useMutation({
    mutationFn: () => partnerApi.requestPayout().then((r) => r.data),
    onSuccess: (res) => {
      if (res?.url) {
        window.location.href = res.url;
      } else {
        toast.success(t("partner.payoutRequested"));
      }
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message || t("partner.payoutFailed"));
    },
  });

  const totalEarned = data?.total_earnings ?? 0;
  const transactions = data?.transactions ?? [];
  const availableBalance = 0; // Backend does not expose available_balance yet

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">{t("nav.earnings")}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("partner.totalEarned")}</CardTitle>
            <Wallet className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEarned)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("partner.availableBalance")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(availableBalance)}</div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("partner.requestPayout")}</CardTitle>
          <CardDescription>{t("partner.requestPayoutDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => requestPayoutMutation.mutate()}
            disabled={requestPayoutMutation.isPending || availableBalance <= 0}
          >
            {requestPayoutMutation.isPending ? t("partner.redirecting") : t("partner.requestPayoutButton")}
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t("partner.earningsHistory")}</CardTitle>
          <CardDescription>{t("partner.earningsHistoryDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center">{t("partner.noEarningsYet")}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("clientPayments.date")}</TableHead>
                  <TableHead>{t("clientPayments.amount")}</TableHead>
                  <TableHead>{t("missionDetail.partner")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{formatDate(t.created_at)}</TableCell>
                    <TableCell>{formatCurrency(t.amount)}</TableCell>
                    <TableCell>{t.mission_id ?? "—"}</TableCell>
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
