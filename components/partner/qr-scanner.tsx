"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

interface QRScannerProps {
  onScan: (payload: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = useRef(`qr-reader-${Math.random().toString(36).slice(2, 9)}`).current;
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  useEffect(() => {
    let cancelled = false;
    const timeoutId = setTimeout(async () => {
      const element = document.getElementById(containerId);
      if (!element || cancelled) return;
      if (element.clientWidth === 0 || element.clientHeight === 0) {
        setError("Scanner container not ready. Please try again.");
        setIsStarting(false);
        return;
      }
      try {
        const scanner = new Html5Qrcode(containerId);
        if (cancelled) return;
        await scanner.start(
          { facingMode: "environment" },
          { fps: 5, qrbox: { width: 200, height: 200 } },
          async (decodedText) => {
            try {
              await scanner.stop();
            } catch {
              // already stopped or cleanup race
            }
            onScanRef.current(decodedText);
          },
          () => {}
        );
        if (cancelled) {
          try {
            scanner.stop().catch(() => {});
          } catch {
            // ignore
          }
          return;
        }
        scannerRef.current = scanner;
        setError(null);
      } catch (e) {
        if (!cancelled) {
          const message = e instanceof Error ? e.message : String(e);
          setError(
            message.includes("NotAllowedError") || message.includes("Permission")
              ? "Camera access denied. Allow camera in your browser settings."
              : "Camera unavailable or not supported."
          );
        }
      } finally {
        if (!cancelled) setIsStarting(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      try {
        scannerRef.current?.stop().catch(() => {});
      } catch {
        // stop() throws if scanner already stopped (e.g. after successful scan)
      }
      scannerRef.current = null;
    };
  }, [containerId]);

  return (
    <div className="space-y-4">
      <div
        id={containerId}
        className="min-h-[240px] w-full min-w-[260px] rounded-lg overflow-hidden bg-black/5"
        style={{ aspectRatio: "1" }}
      />
      {isStarting && !error && (
        <p className="text-muted-foreground text-sm">{t("common.loading")}…</p>
      )}
      {error && (
        <p className="text-destructive text-sm">{error}</p>
      )}
      <Button variant="outline" onClick={onClose}>
        {t("common.cancel")}
      </Button>
    </div>
  );
}
