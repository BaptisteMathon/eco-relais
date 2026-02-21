"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { missionsApi } from "@/lib/api/endpoints";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import { useTranslation, useMissionStatusLabels, usePackageSizeLabels } from "@/lib/i18n";
import { ArrowLeft, MessageCircle, Navigation } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const MissionMap = dynamic(
  () => import("@/components/client/mission-map").then((m) => m.MissionMap),
  { ssr: false, loading: () => <Skeleton className="h-64 w-full rounded-lg" /> }
);

const STEPS = ["pending", "accepted", "collected", "in_transit", "delivered"] as const;

export default function ClientMissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const { t } = useTranslation();
  const MISSION_STATUS_LABELS = useMissionStatusLabels();
  const packageSizeLabels = usePackageSizeLabels();
  const { data: mission, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["mission", id],
    queryFn: () => missionsApi.get(id).then((r) => r.data),
    refetchInterval: 30_000,
  });

  if (isLoading || (!mission && !isError)) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError) {
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/client/missions">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>{t("missionDetail.notFound") || "Mission not found"}</CardTitle>
            <CardDescription>
              {message || t("missionDetail.notFoundDescription") || "This mission does not exist or you don't have access."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()}>{t("common.tryAgain") || "Try again"}</Button>
            <Button variant="outline" asChild className="ml-2">
              <Link href="/client/missions">{t("mission.myMissions") || "My missions"}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStepIndex = STEPS.indexOf(mission.status as (typeof STEPS)[number]);
  const isCancelled = mission.status === "cancelled";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/client/missions">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{mission.package_title}</h2>
          <Badge>{MISSION_STATUS_LABELS[mission.status] ?? mission.status}</Badge>
        </div>
      </div>

      {/* Timeline stepper */}
      {!isCancelled && (
        <Card>
          <CardHeader>
            <CardTitle>{t("missionDetail.progress")}</CardTitle>
            <CardDescription>{t("missionDetail.missionTimeline")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start">
              {STEPS.map((step, i) => (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`size-8 shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-medium ${
                        i <= currentStepIndex
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted bg-muted"
                      }`}
                    >
                      {i < currentStepIndex ? "✓" : i + 1}
                    </div>
                    <span className="mt-1 text-center text-xs">
                      {t(`mission.status.${step}`)}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`mx-1 mt-4 h-0.5 flex-1 min-w-[20px] ${
                        i < currentStepIndex ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("missionDetail.map")}</CardTitle>
            <CardDescription>{t("missionDetail.pickupDeliveryPartner")}</CardDescription>
          </CardHeader>
          <CardContent>
            <MissionMap
              pickup={{ lat: Number(mission.pickup_lat), lng: Number(mission.pickup_lng) }}
              delivery={{ lat: Number(mission.delivery_lat), lng: Number(mission.delivery_lng) }}
              partnerLocation={
                mission.partner_id
                  ? { lat: Number(mission.pickup_lat) + 0.002, lng: Number(mission.pickup_lng) + 0.001 }
                  : undefined
              }
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("missionDetail.details")}</CardTitle>
              <CardDescription>{t("missionDetail.packageAddresses")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mission.package_photo_url && (
                <Image
                  src={mission.package_photo_url}
                  alt=""
                  width={120}
                  height={80}
                  className="rounded object-cover"
                />
              )}
              <p><strong>{t("missionDetail.size")}:</strong> {packageSizeLabels[mission.package_size] ?? mission.package_size}</p>
              <p><strong>{t("missionDetail.price")}:</strong> {formatCurrency(mission.price)}</p>
              <p><strong>{t("missionDetail.timeSlot")}:</strong> {mission.pickup_time_slot}</p>
              <p><strong>{t("missionDetail.pickup")}:</strong> {mission.pickup_address}</p>
              <p><strong>{t("missionDetail.delivery")}:</strong> {mission.delivery_address}</p>
              <p className="text-muted-foreground text-sm">
                {t("missionDetail.created")} {formatDate(mission.created_at)}
              </p>
            </CardContent>
          </Card>

          {mission.partner && (
            <Card>
              <CardHeader>
                <CardTitle>{t("missionDetail.partner")}</CardTitle>
                <CardDescription>{mission.partner.first_name} {mission.partner.last_name}</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${mission.delivery_lat},${mission.delivery_lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Navigation className="mr-2 size-4" />
                    {t("missionDetail.directions")}
                  </a>
                </Button>
                <Button variant="outline" size="sm" disabled>
                  <MessageCircle className="mr-2 size-4" />
                  {t("missionDetail.chatSoon")}
                </Button>
              </CardContent>
            </Card>
          )}

          {mission.qr_code && (
            <Card>
              <CardHeader>
                <CardTitle>{t("missionDetail.qrCode")}</CardTitle>
                <CardDescription>{t("missionDetail.qrCodeDescription")}</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                {mission.qr_code.startsWith("data:") ? (
                  <img src={mission.qr_code} alt="QR Code" width={160} height={160} className="size-40 object-contain" />
                ) : (
                  <QRCodeSVG value={mission.qr_code} size={160} level="M" />
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
