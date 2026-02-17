"use client";

import { useMemo } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { GOOGLE_MAPS_API_KEY } from "@/lib/constants";
import type { AvailableMission } from "@/lib/types";

interface AvailableMissionsMapProps {
  center: { lat: number; lng: number };
  missions: AvailableMission[];
}

export function AvailableMissionsMap({ center, missions }: AvailableMissionsMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const bounds = useMemo(() => {
    if (missions.length === 0) return null;
    const lats = missions.flatMap((m) => [m.pickup_lat, m.delivery_lat]);
    const lngs = missions.flatMap((m) => [m.pickup_lng, m.delivery_lng]);
    lats.push(center.lat);
    lngs.push(center.lng);
    return {
      north: Math.max(...lats) + 0.01,
      south: Math.min(...lats) - 0.01,
      east: Math.max(...lngs) + 0.01,
      west: Math.min(...lngs) - 0.01,
    };
  }, [missions, center]);

  if (loadError || !GOOGLE_MAPS_API_KEY) {
    return (
      <div className="bg-muted flex h-80 items-center justify-center rounded-lg text-muted-foreground">
        Map unavailable.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="bg-muted flex h-80 items-center justify-center rounded-lg">
        Loading map…
      </div>
    );
  }

  return (
    <div className="h-80 w-full overflow-hidden rounded-lg">
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={center}
        zoom={14}
        onLoad={(map) => {
          if (bounds) {
            const b = new google.maps.LatLngBounds(
              { lat: bounds.south, lng: bounds.west },
              { lat: bounds.north, lng: bounds.east }
            );
            map.fitBounds(b, 60);
          }
        }}
      >
        <Marker position={center} title="You" />
        {missions.map((m) => (
          <Marker
            key={m.id}
            position={{ lat: m.pickup_lat, lng: m.pickup_lng }}
            title={m.package_title}
          />
        ))}
      </GoogleMap>
    </div>
  );
}
