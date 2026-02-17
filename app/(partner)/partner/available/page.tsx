"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { partnerApi } from "@/lib/api/endpoints";
import { formatCurrency, formatDistance } from "@/lib/utils/format";
import { useTranslation, usePackageSizeLabels } from "@/lib/i18n";
import type { AvailableMission } from "@/lib/types";

const AvailableMap = dynamic(
  () => import("@/components/partner/available-missions-map").then((m) => m.AvailableMissionsMap),
  { ssr: false, loading: () => <Skeleton className="h-80 w-full rounded-lg" /> }
);

export default function PartnerAvailablePage() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const packageSizeLabels = usePackageSizeLabels();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setLocation({ lat: 48.8566, lng: 2.3522 })
    );
  }, []);

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner-available"] });
      queryClient.invalidateQueries({ queryKey: ["partner-missions"] });
      toast.success(t("mission.missionAccepted"));
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message || t("partnerAvailable.acceptFailed"));
    },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">{t("partnerAvailable.availableMissions")}</h2>
      <p className="text-muted-foreground text-sm">
        {t("partnerAvailable.missionsWithin1km")}
      </p>

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

      <Card>
        <CardHeader>
          <CardTitle>{t("partnerAvailable.list")}</CardTitle>
          <CardDescription>{t("partnerAvailable.acceptMissionToStart")}</CardDescription>
        </CardHeader>
        <CardContent>
          {!location ? (
            <p className="text-muted-foreground py-4 text-center">{t("partnerAvailable.gettingLocation")}</p>
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
                      />
                    ) : (
                      <div className="bg-muted flex size-20 shrink-0 items-center justify-center rounded text-xs">
                        —
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{m.package_title}</p>
                      <p className="text-muted-foreground text-sm">{packageSizeLabels[m.package_size as keyof typeof packageSizeLabels] ?? m.package_size}</p>
                      <p className="text-muted-foreground truncate text-xs">{m.pickup_address}</p>
                      <p className="text-muted-foreground truncate text-xs">→ {m.delivery_address}</p>
                      {m.distance_km != null && (
                        <p className="text-xs">{formatDistance(m.distance_km)} away</p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="font-semibold">{formatCurrency(m.price)}</span>
                      <Button
                        size="sm"
                        onClick={() => acceptMutation.mutate(m.id)}
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
    </div>
  );
}
