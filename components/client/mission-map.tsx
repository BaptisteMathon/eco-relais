"use client";

import { useMemo } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { GOOGLE_MAPS_API_KEY } from "@/lib/constants";

const defaultCenter = { lat: 48.8566, lng: 2.3522 };

interface MissionMapProps {
  pickup: { lat: number; lng: number };
  delivery: { lat: number; lng: number };
  partnerLocation?: { lat: number; lng: number };
}

export function MissionMap({ pickup, delivery, partnerLocation }: MissionMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const center = useMemo(() => ({
    lat: (pickup.lat + delivery.lat) / 2,
    lng: (pickup.lng + delivery.lng) / 2,
  }), [pickup, delivery]);

  const bounds = useMemo(() => {
    const lats = [pickup.lat, delivery.lat, ...(partnerLocation ? [partnerLocation.lat] : [])];
    const lngs = [pickup.lng, delivery.lng, ...(partnerLocation ? [partnerLocation.lng] : [])];
    return {
      north: Math.max(...lats) + 0.01,
      south: Math.min(...lats) - 0.01,
      east: Math.max(...lngs) + 0.01,
      west: Math.min(...lngs) - 0.01,
    };
  }, [pickup, delivery, partnerLocation]);

  if (loadError || !GOOGLE_MAPS_API_KEY) {
    return (
      <div className="bg-muted flex h-64 items-center justify-center rounded-lg text-muted-foreground">
        Map unavailable. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="bg-muted flex h-64 items-center justify-center rounded-lg">
        Loading map…
      </div>
    );
  }

  return (
    <div className="h-64 w-full overflow-hidden rounded-lg">
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={center}
        zoom={12}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        }}
        onLoad={(map) => {
          const b = new google.maps.LatLngBounds(
            { lat: bounds.south, lng: bounds.west },
            { lat: bounds.north, lng: bounds.east }
          );
          map.fitBounds(b, 40);
        }}
      >
        <Marker position={pickup} title="Pickup" />
        <Marker position={delivery} title="Delivery" />
        {partnerLocation && (
          <Marker position={partnerLocation} title="Partner" />
        )}
      </GoogleMap>
    </div>
  );
}
