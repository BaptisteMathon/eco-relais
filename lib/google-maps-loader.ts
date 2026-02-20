"use client";

import { useState, useEffect, useCallback } from "react";
import { GOOGLE_MAPS_API_KEY } from "@/lib/constants";

const SCRIPT_ID = "eco-relais-google-maps";

type LoadState = {
  isLoaded: boolean;
  loadError: Error | undefined;
};

const subscribers = new Set<(state: LoadState) => void>();
let state: LoadState = { isLoaded: false, loadError: undefined };
let loadStarted = false;

function notify() {
  subscribers.forEach((cb) => cb(state));
}

function loadScript(): void {
  if (loadStarted) return;
  loadStarted = true;

  if (typeof window === "undefined") return;

  if (window.google?.maps) {
    state = { isLoaded: true, loadError: undefined };
    notify();
    return;
  }

  const existing = document.getElementById(SCRIPT_ID);
  if (existing) {
    if (existing.getAttribute("data-loaded") === "1") {
      state = { isLoaded: true, loadError: undefined };
      notify();
      return;
    }
    return;
  }

  if (!GOOGLE_MAPS_API_KEY) {
    state = { isLoaded: false, loadError: new Error("Google Maps API key not set") };
    notify();
    return;
  }

  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
  script.async = true;
  script.defer = true;
  script.onload = () => {
    state = { isLoaded: true, loadError: undefined };
    script.setAttribute("data-loaded", "1");
    notify();
  };
  script.onerror = () => {
    state = {
      isLoaded: false,
      loadError: new Error("Failed to load Google Maps script"),
    };
    notify();
  };
  document.head.appendChild(script);
}

export function useGoogleMapsLoader(): LoadState {
  const [current, setCurrent] = useState<LoadState>(state);

  useEffect(() => {
    loadScript();
    const setState = (s: LoadState) => setCurrent(s);
    subscribers.add(setState);
    if (state.isLoaded || state.loadError) setCurrent(state);
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  return current;
}
