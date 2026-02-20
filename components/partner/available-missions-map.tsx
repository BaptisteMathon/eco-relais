"use client";

import { useMemo, useRef, useEffect } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { useGoogleMapsLoader } from "@/lib/google-maps-loader";
import { GOOGLE_MAPS_API_KEY } from "@/lib/constants";
import type { AvailableMission } from "@/lib/types";

interface AvailableMissionsMapProps {
  center: { lat: number; lng: number };
  missions: AvailableMission[];
}

function hasValidCoords(m: AvailableMission): boolean {
  const lat = Number(m.pickup_lat);
  const lng = Number(m.pickup_lng);
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export function AvailableMissionsMap({ center, missions }: AvailableMissionsMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const { isLoaded, loadError } = useGoogleMapsLoader();

  const missionsWithCoords = useMemo(() => missions.filter(hasValidCoords), [missions]);

  const bounds = useMemo(() => {
    if (missionsWithCoords.length === 0) return null;
    const lats = missionsWithCoords.flatMap((m) => [Number(m.pickup_lat), Number(m.delivery_lat)]);
    const lngs = missionsWithCoords.flatMap((m) => [Number(m.pickup_lng), Number(m.delivery_lng)]);
    lats.push(center.lat);
    lngs.push(center.lng);
    return {
      north: Math.max(...lats) + 0.01,
      south: Math.min(...lats) - 0.01,
      east: Math.max(...lngs) + 0.01,
      west: Math.min(...lngs) - 0.01,
    };
  }, [missionsWithCoords, center]);

  useEffect(() => {
    if (!bounds || !mapRef.current) return;
    const map = mapRef.current;
    const b = new google.maps.LatLngBounds(
      { lat: bounds.south, lng: bounds.west },
      { lat: bounds.north, lng: bounds.east }
    );
    map.fitBounds(b, 60);
  }, [bounds]);

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
          mapRef.current = map;
          if (bounds) {
            const b = new google.maps.LatLngBounds(
              { lat: bounds.south, lng: bounds.west },
              { lat: bounds.north, lng: bounds.east }
            );
            map.fitBounds(b, 60);
          }
        }}
        onUnmount={() => {
          mapRef.current = null;
        }}
      >
        <Marker position={center} title="You" />
        {missionsWithCoords.map((m) => (
          <Marker
            key={m.id}
            position={{ lat: Number(m.pickup_lat), lng: Number(m.pickup_lng) }}
            title={m.package_title}
          />
        ))}
      </GoogleMap>
    </div>
  );
}
