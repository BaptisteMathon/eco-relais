"use client";

import { useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { useLoadScript } from "@react-google-maps/api";
import { GOOGLE_MAPS_API_KEY } from "@/lib/constants";

const libraries: ("places")[] = ["places"];

export interface AddressResult {
  address: string;
  lat: number;
  lng: number;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect?: (result: AddressResult) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Search address…",
  disabled,
  className,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const initAutocomplete = useCallback(() => {
    if (!inputRef.current || !window.google?.maps?.places) return;
    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      types: ["address"],
      fields: ["formatted_address", "geometry"],
    });
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      const geo = place.geometry?.location;
      if (place.formatted_address && geo) {
        onChange(place.formatted_address);
        onPlaceSelect?.({
          address: place.formatted_address,
          lat: geo.lat(),
          lng: geo.lng(),
        });
      }
    });
    autocompleteRef.current = autocomplete;
  }, [onChange, onPlaceSelect]);

  useEffect(() => {
    if (isLoaded && !loadError) {
      initAutocomplete();
    }
    return () => {
      autocompleteRef.current = null;
    };
  }, [isLoaded, loadError, initAutocomplete]);

  if (loadError) {
    return (
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
      />
    );
  }

  return (
    <Input
      ref={inputRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled || !isLoaded}
      className={className}
    />
  );
}
