"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { partnerApi } from "@/lib/api/endpoints";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import { useTranslation, useMissionStatusLabels } from "@/lib/i18n";
import { QRScanner } from "@/components/partner/qr-scanner";
import { Navigation, PackageCheck, Truck } from "lucide-react";

const STEPS = ["pending", "accepted", "collected", "in_transit", "delivered"] as const;

export default function PartnerMissionsPage() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const MISSION_STATUS_LABELS = useMissionStatusLabels();
  const [qrOpen, setQrOpen] = useState<{ missionId: string; action: "collected" | "delivered" } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["partner-missions"],
    queryFn: () => partnerApi.myMissions().then((r) => r.data),
    refetchInterval: 30_000,
  });
  const missions = data?.missions ?? [];

  const activeMissions = missions.filter((m) => !["delivered", "cancelled"].includes(m.status));
  const completedMissions = missions.filter((m) => m.status === "delivered");

  const collectedMutation = useMutation({
    mutationFn: ({ missionId, qrPayload }: { missionId: string; qrPayload: string }) =>
      partnerApi.markCollected(missionId, qrPayload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner-missions"] });
      setQrOpen(null);
      toast.success(t("mission.markedCollected"));
    },
    onError: (e: { response?: { data?: { message?: string } } }) => {
      toast.error(e.response?.data?.message || t("mission.invalidQR"));
    },
  });

  const inTransitMutation = useMutation({
    mutationFn: (missionId: string) => partnerApi.markInTransit(missionId).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner-missions"] });
      toast.success(t("mission.markedInTransit"));
    },
  });

  const deliveredMutation = useMutation({
    mutationFn: ({ missionId, qrPayload }: { missionId: string; qrPayload: string }) =>
      partnerApi.markDelivered(missionId, qrPayload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner-missions"] });
      setQrOpen(null);
      toast.success(t("mission.markedDelivered"));
    },
    onError: (e: { response?: { data?: { message?: string } } }) => {
      toast.error(e.response?.data?.message || t("mission.invalidQR"));
    },
  });

  const handleScan = (payload: string) => {
    if (!qrOpen) return;
    if (qrOpen.action === "collected") {
      collectedMutation.mutate({ missionId: qrOpen.missionId, qrPayload: payload });
    } else {
      deliveredMutation.mutate({ missionId: qrOpen.missionId, qrPayload: payload });
    }
  };

  const MissionCard = ({ m }: { m: (typeof missions)[0] }) => {
    const stepIndex = STEPS.indexOf(m.status as (typeof STEPS)[number]);
    const isActive = !["delivered", "cancelled"].includes(m.status);

    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            {m.package_photo_url ? (
              <Image
                src={m.package_photo_url}
                alt=""
                width={64}
                height={48}
                className="rounded object-cover"
              />
            ) : (
              <div className="bg-muted flex size-16 shrink-0 items-center justify-center rounded text-xs">
                —
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-medium">{m.package_title}</p>
              <p className="text-muted-foreground text-sm">{m.package_size} · {formatCurrency(m.price)}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {STEPS.map((s, i) => (
                  <span
                    key={s}
                    className={`text-xs ${
                      i <= stepIndex ? "text-foreground font-medium" : "text-muted-foreground"
                    }`}
                  >
                    {MISSION_STATUS_LABELS[s]}
                    {i < STEPS.length - 1 && " → "}
                  </span>
                ))}
              </div>
              {isActive && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {m.status === "accepted" && (
                    <Button size="sm" onClick={() => setQrOpen({ missionId: m.id, action: "collected" })}>
                      <PackageCheck className="mr-1 size-4" />
                      {t("mission.markCollected")}
                    </Button>
                  )}
                  {m.status === "collected" && (
                    <Button size="sm" variant="outline" onClick={() => inTransitMutation.mutate(m.id)}>
                      <Truck className="mr-1 size-4" />
                      {t("mission.startDelivery")}
                    </Button>
                  )}
                  {(m.status === "collected" || m.status === "in_transit") && (
                    <Button size="sm" onClick={() => setQrOpen({ missionId: m.id, action: "delivered" })}>
                      {t("mission.markDelivered")}
                    </Button>
                  )}
                  <Button size="sm" variant="outline" asChild>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${m.delivery_lat},${m.delivery_lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Navigation className="mr-1 size-4" />
                      {t("mission.directions")}
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">{t("mission.myMissions")}</h2>
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">{t("mission.active")}</TabsTrigger>
          <TabsTrigger value="completed">{t("mission.completed")}</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-4 space-y-4">
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : activeMissions.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">{t("mission.noActiveMissions")}</p>
          ) : (
            activeMissions.map((m) => <MissionCard key={m.id} m={m} />)
          )}
        </TabsContent>
        <TabsContent value="completed" className="mt-4 space-y-4">
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : completedMissions.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">{t("mission.noCompletedMissions")}</p>
          ) : (
            completedMissions.map((m) => <MissionCard key={m.id} m={m} />)
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!qrOpen} onOpenChange={() => setQrOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("mission.scanQR")} — {qrOpen?.action === "collected" ? t("mission.collection") : t("mission.delivery")}
            </DialogTitle>
          </DialogHeader>
          {qrOpen && (
            <QRScanner
              onScan={handleScan}
              onClose={() => setQrOpen(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
