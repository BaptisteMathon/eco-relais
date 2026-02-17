"use client";

import { useQuery } from "@tanstack/react-query";
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
import { Skeleton } from "@/components/ui/skeleton";
import { paymentsApi } from "@/lib/api/endpoints";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { useTranslation } from "@/lib/i18n";

export default function ClientPaymentsPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: () => paymentsApi.history().then((r) => r.data),
  });

  const payments = data?.data ?? [];
  const totalSpent = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">{t("nav.payments")}</h2>
      <Card>
        <CardHeader>
          <CardTitle>{t("clientPayments.totalSpent")}</CardTitle>
          <CardDescription>{t("clientPayments.allCompletedPayments")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{formatCurrency(totalSpent)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t("clientPayments.paymentHistory")}</CardTitle>
          <CardDescription>{t("clientPayments.yourPaymentTransactions")}</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">{t("clientPayments.noPaymentsYet")}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("clientPayments.date")}</TableHead>
                  <TableHead>{t("clientPayments.missionId")}</TableHead>
                  <TableHead>{t("clientPayments.amount")}</TableHead>
                  <TableHead>{t("admin.status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{formatDate(p.created_at)}</TableCell>
                    <TableCell className="font-mono text-sm">{p.mission_id.slice(0, 8)}…</TableCell>
                    <TableCell>{formatCurrency(p.amount)}</TableCell>
                    <TableCell>
                      <Badge variant={p.status === "completed" ? "default" : "secondary"}>
                        {p.status}
                      </Badge>
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
