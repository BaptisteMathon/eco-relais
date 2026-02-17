"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";

interface QRScannerProps {
  onScan: (payload: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [hasCamera, setHasCamera] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = "qr-reader";

  useEffect(() => {
    const start = async () => {
      try {
        const scanner = new Html5Qrcode(containerId);
        await scanner.start(
          { facingMode: "environment" },
          { fps: 5, qrbox: { width: 200, height: 200 } },
          (decoded) => {
            onScan(decoded);
            scanner.stop().catch(() => {});
          },
          () => {}
        );
        scannerRef.current = scanner;
      } catch (e) {
        setError("Camera access denied or unavailable.");
        setHasCamera(false);
      }
    };
    start();
    return () => {
      scannerRef.current?.stop().catch(() => {});
      scannerRef.current = null;
    };
  }, [onScan]);

  return (
    <div className="space-y-4">
      <div id={containerId} className="min-h-[200px] rounded-lg overflow-hidden" />
      {error && (
        <p className="text-destructive text-sm">{error}</p>
      )}
      <Button variant="outline" onClick={onClose}>
        Cancel
      </Button>
    </div>
  );
}
