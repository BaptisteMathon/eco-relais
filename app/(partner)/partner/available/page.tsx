"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { partnerApi, missionsApi } from "@/lib/api/endpoints";
import { formatCurrency, formatDistance } from "@/lib/utils/format";
import { useTranslation, usePackageSizeLabels } from "@/lib/i18n";
import type { AvailableMission } from "@/lib/types";
import { MapPin } from "lucide-react";

const AvailableMap = dynamic(
  () => import("@/components/partner/available-missions-map").then((m) => m.AvailableMissionsMap),
  { ssr: false, loading: () => <Skeleton className="h-80 w-full rounded-lg" /> }
);

/** Fallback when location is denied or unavailable (Paris, France – demo only) */
const FALLBACK_LOCATION = { lat: 48.8566, lng: 2.3522 };

type LocationStatus = "idle" | "loading" | "granted" | "denied" | "unavailable";

const CANCEL_WINDOW_SEC = 30;

export default function PartnerAvailablePage() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const packageSizeLabels = usePackageSizeLabels();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [detailMission, setDetailMission] = useState<AvailableMission | null>(null);
  const [confirmMission, setConfirmMission] = useState<AvailableMission | null>(null);
  const [justAcceptedId, setJustAcceptedId] = useState<string | null>(null);
  const [cancelCountdown, setCancelCountdown] = useState(0);

  const requestLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocation(FALLBACK_LOCATION);
      setLocationStatus("unavailable");
      toast.info(t("partnerAvailable.locationFallback"));
      return;
    }
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLocation({ lat: p.coords.latitude, lng: p.coords.longitude });
        setLocationStatus("granted");
      },
      (err) => {
        setLocation(FALLBACK_LOCATION);
        setLocationStatus(err.code === 1 ? "denied" : "unavailable");
        toast.info(t("partnerAvailable.locationFallback"));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }, [t]);

  const { data: missions = [], isLoading } = useQuery({
    queryKey: ["partner-available", location?.lat, location?.lng],
    queryFn: () =>
      location
        ? partnerApi.available(location.lat, location.lng).then((r) => r.data)
        : Promise.resolve([]),
    enabled: Boolean(location),
  });

  const acceptMutation = useMutation({
    mutationFn: (missionId: string) => partnerApi.accept(missionId).then((r) => r.data),
    onSuccess: (_, missionId) => {
      queryClient.invalidateQueries({ queryKey: ["partner-available"] });
      queryClient.invalidateQueries({ queryKey: ["partner-missions"] });
      toast.success(t("mission.missionAccepted"));
      setConfirmMission(null);
      setDetailMission(null);
      setJustAcceptedId(missionId);
      setCancelCountdown(CANCEL_WINDOW_SEC);
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message || t("partnerAvailable.acceptFailed"));
    },
  });

  const cancelAcceptMutation = useMutation({
    mutationFn: (missionId: string) => missionsApi.cancel(missionId).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner-available"] });
      queryClient.invalidateQueries({ queryKey: ["partner-missions"] });
      setJustAcceptedId(null);
      setCancelCountdown(0);
      toast.success(t("partnerAvailable.acceptanceCancelled"));
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message || t("partnerAvailable.acceptFailed"));
    },
  });

  useEffect(() => {
    if (justAcceptedId == null || cancelCountdown <= 0) return;
    const id = setInterval(() => {
      setCancelCountdown((s) => {
        if (s <= 1) {
          setJustAcceptedId(null);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [justAcceptedId, cancelCountdown]);

  const openConfirm = (m: AvailableMission) => {
    setDetailMission(null);
    setConfirmMission(m);
  };

  const isFallback = location && (locationStatus === "denied" || locationStatus === "unavailable");

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">{t("partnerAvailable.availableMissions")}</h2>
      <p className="text-muted-foreground text-sm">
        {t("partnerAvailable.missionsWithin1km")}
      </p>
      {isFallback && (
        <p className="text-muted-foreground rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm">
          {t("partnerAvailable.locationFallbackNote")}
        </p>
      )}

      {justAcceptedId != null && cancelCountdown > 0 && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm">
              {t("partnerAvailable.cancelWithin30s").replace("{seconds}", String(cancelCountdown))}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => cancelAcceptMutation.mutate(justAcceptedId)}
              disabled={cancelAcceptMutation.isPending}
            >
              {t("partnerAvailable.cancelAcceptance")}
            </Button>
          </CardContent>
        </Card>
      )}

      {location && (
        <Card>
          <CardHeader>
            <CardTitle>{t("missionDetail.map")}</CardTitle>
            <CardDescription>{t("partnerAvailable.availableMissionsNearYou")}</CardDescription>
          </CardHeader>
          <CardContent>
            <AvailableMap
              center={location}
              missions={missions as AvailableMission[]}
            />
          </CardContent>
        </Card>
      )}

      {!location && locationStatus !== "loading" && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="size-5 text-muted-foreground" />
              <CardTitle>
                {locationStatus === "unavailable"
                  ? t("partnerAvailable.locationUnavailable")
                  : t("partnerAvailable.locationRequired")}
              </CardTitle>
            </div>
            <CardDescription>
              {locationStatus === "denied"
                ? t("partnerAvailable.locationDenied")
                : t("partnerAvailable.locationRequiredHint")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={requestLocation} disabled={false}>
              <MapPin className="mr-2 size-4" />
              {t("partnerAvailable.allowLocation")}
            </Button>
          </CardContent>
        </Card>
      )}

      {locationStatus === "loading" && (
        <Card>
          <CardContent className="py-8">
            <p className="text-muted-foreground text-center">{t("partnerAvailable.gettingLocation")}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("partnerAvailable.list")}</CardTitle>
          <CardDescription>{t("partnerAvailable.acceptMissionToStart")}</CardDescription>
        </CardHeader>
        <CardContent>
          {!location ? (
            <p className="text-muted-foreground py-4 text-center">
              {locationStatus === "idle" || locationStatus === "denied" || locationStatus === "unavailable"
                ? t("partnerAvailable.locationRequired")
                : t("partnerAvailable.gettingLocation")}
            </p>
          ) : isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : missions.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">{t("mission.noAvailableMissions")}</p>
          ) : (
            <div className="space-y-4">
              {missions.map((m: AvailableMission) => (
                <Card key={m.id}>
                  <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                    {m.package_photo_url ? (
                      <Image
                        src={m.package_photo_url}
                        alt=""
                        width={80}
                        height={60}
                        className="rounded object-cover"
                        unoptimized={m.package_photo_url.startsWith("data:")}
                      />
                    ) : (
                      <div className="bg-muted flex size-20 shrink-0 items-center justify-center rounded text-xs">
                        —
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => setDetailMission(m)}
                        className="font-medium text-left hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                      >
                        {m.package_title}
                      </button>
                      <p className="text-muted-foreground text-sm">{packageSizeLabels[m.package_size as keyof typeof packageSizeLabels] ?? m.package_size}</p>
                      {m.pickup_time_slot && (
                        <p className="text-muted-foreground text-xs">{t("missionDetail.timeSlot")}: {m.pickup_time_slot}</p>
                      )}
                      <p className="text-muted-foreground truncate text-xs">{m.pickup_address}</p>
                      <p className="text-muted-foreground truncate text-xs">→ {m.delivery_address}</p>
                      {m.distance_km != null && (
                        <p className="text-xs">{formatDistance(m.distance_km)} away</p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <span className="font-semibold">{formatCurrency(m.price)}</span>
                      <Button
                        size="sm"
                        onClick={() => openConfirm(m)}
                        disabled={acceptMutation.isPending}
                      >
                        {t("mission.accept")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!detailMission} onOpenChange={(open) => !open && setDetailMission(null)}>
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>{detailMission?.package_title ?? ""}</DialogTitle>
            <DialogDescription>{t("partnerAvailable.acceptMissionToStart")}</DialogDescription>
          </DialogHeader>
          {detailMission && (
            <div className="space-y-4">
              {detailMission.package_photo_url ? (
                <div className="flex justify-center">
                  <Image
                    src={detailMission.package_photo_url}
                    alt=""
                    width={280}
                    height={210}
                    className="rounded-md object-contain bg-muted"
                    unoptimized={detailMission.package_photo_url.startsWith("data:")}
                  />
                </div>
              ) : (
                <div className="bg-muted flex h-[210px] w-[280px] max-w-full items-center justify-center rounded-md text-sm text-muted-foreground">
                  {t("common.photo")} —
                </div>
              )}
              <dl className="grid gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">{t("missionDetail.size")}: </span>
                  {packageSizeLabels[detailMission.package_size as keyof typeof packageSizeLabels] ?? detailMission.package_size}
                </div>
                <div>
                  <span className="text-muted-foreground">{t("missionDetail.price")}: </span>
                  {formatCurrency(detailMission.price)}
                </div>
                <div>
                  <span className="text-muted-foreground">{t("missionDetail.timeSlot")}: </span>
                  {detailMission.pickup_time_slot}
                </div>
                <div>
                  <span className="text-muted-foreground">{t("missionDetail.pickup")}: </span>
                  {detailMission.pickup_address}
                </div>
                <div>
                  <span className="text-muted-foreground">{t("missionDetail.delivery")}: </span>
                  {detailMission.delivery_address}
                </div>
                {detailMission.distance_km != null && (
                  <div>{formatDistance(detailMission.distance_km)} away</div>
                )}
              </dl>
            </div>
          )}
          <DialogFooter showCloseButton={false}>
            <Button variant="outline" onClick={() => setDetailMission(null)}>
              {t("common.cancel")}
            </Button>
            {detailMission && (
              <Button
                onClick={() => openConfirm(detailMission)}
                disabled={acceptMutation.isPending}
              >
                {t("mission.accept")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmMission} onOpenChange={(open) => !open && setConfirmMission(null)}>
        <DialogContent className="sm:max-w-sm" showCloseButton>
          <DialogHeader>
            <DialogTitle>{t("partnerAvailable.confirmPickup")}</DialogTitle>
            <DialogDescription>{t("partnerAvailable.confirmPickupDescription")}</DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton={false}>
            <Button variant="outline" onClick={() => setConfirmMission(null)}>
              {t("common.cancel")}
            </Button>
            {confirmMission && (
              <Button
                onClick={() => acceptMutation.mutate(confirmMission.id)}
                disabled={acceptMutation.isPending}
              >
                {t("partnerAvailable.yesPickUp")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
