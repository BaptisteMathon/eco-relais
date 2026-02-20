"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/lib/i18n";

const STRIPE_ENABLED_KEY = "admin_settings_stripe_enabled";
const GOOGLE_MAPS_ENABLED_KEY = "admin_settings_google_maps_enabled";

function maskKey(value: string): string {
  if (!value || value.length < 8) return "••••••••";
  return value.slice(0, 7) + "••••••••";
}

export default function AdminSettingsPage() {
  const { t } = useTranslation();
  const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
  const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  const [stripeEnabled, setStripeEnabled] = useState(true);
  const [googleMapsEnabled, setGoogleMapsEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const s = localStorage.getItem(STRIPE_ENABLED_KEY);
      if (s !== null) setStripeEnabled(s === "true");
      const g = localStorage.getItem(GOOGLE_MAPS_ENABLED_KEY);
      if (g !== null) setGoogleMapsEnabled(g === "true");
    } catch {
      // ignore
    }
  }, []);

  const handleStripeToggle = (enabled: boolean) => {
    setStripeEnabled(enabled);
    try {
      localStorage.setItem(STRIPE_ENABLED_KEY, String(enabled));
    } catch {
      // ignore
    }
  };

  const handleGoogleMapsToggle = (enabled: boolean) => {
    setGoogleMapsEnabled(enabled);
    try {
      localStorage.setItem(GOOGLE_MAPS_ENABLED_KEY, String(enabled));
    } catch {
      // ignore
    }
  };

  const stripeActive = !!stripeKey && (mounted ? stripeEnabled : true);
  const googleMapsActive = !!googleMapsKey && (mounted ? googleMapsEnabled : true);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">{t("nav.settings")}</h2>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.apiKeys") || "API keys"}</CardTitle>
          <CardDescription>
            {t("settings.apiKeysDescription") || "Keys are read from environment variables. Toggle to enable or disable each integration."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
            <div>
              <p className="font-medium">{t("settings.stripeKey") || "Stripe publishable key"}</p>
              <p className="text-muted-foreground font-mono text-sm">
                {stripeKey ? maskKey(stripeKey) : t("settings.notSet") || "Not set"}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={stripeActive ? "default" : "secondary"}>
                {stripeActive ? (t("settings.active") || "Active") : (t("settings.inactive") || "Inactive")}
              </Badge>
              {mounted && (
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={stripeEnabled}
                    onChange={(e) => handleStripeToggle(e.target.checked)}
                    className="h-4 w-4 rounded border-input"
                  />
                  <Label className="cursor-pointer text-sm">{t("settings.useIntegration") || "Use integration"}</Label>
                </label>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
            <div>
              <p className="font-medium">{t("settings.googleMapsKey") || "Google Maps API key"}</p>
              <p className="text-muted-foreground font-mono text-sm">
                {googleMapsKey ? maskKey(googleMapsKey) : t("settings.notSet") || "Not set"}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={googleMapsActive ? "default" : "secondary"}>
                {googleMapsActive ? (t("settings.active") || "Active") : (t("settings.inactive") || "Inactive")}
              </Badge>
              {mounted && (
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={googleMapsEnabled}
                    onChange={(e) => handleGoogleMapsToggle(e.target.checked)}
                    className="h-4 w-4 rounded border-input"
                  />
                  <Label className="cursor-pointer text-sm">{t("settings.useIntegration") || "Use integration"}</Label>
                </label>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.indicators") || "Indicators"}</CardTitle>
          <CardDescription>
            {t("settings.indicatorsDescription") || "Configure platform KPIs and dashboard indicators."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            {t("settings.indicatorsPlaceholder") || "Indicator settings can be extended here (e.g. which metrics to show on the admin dashboard)."}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.tariffs") || "Tariffs"}</CardTitle>
          <CardDescription>
            {t("settings.tariffsDescription") || "Configure pricing and commission rules."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            {t("settings.tariffsPlaceholder") || "Tariff and commission settings can be extended here."}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.notifications") || "Notifications"}</CardTitle>
          <CardDescription>
            {t("settings.notificationsDescription") || "Configure email and in-app notifications."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            {t("settings.notificationsPlaceholder") || "Notification preferences and templates can be configured here."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
