"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";

export default function AdminSettingsPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">{t("nav.settings")}</h2>
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.platformSettings")}</CardTitle>
          <CardDescription>{t("settings.configureGlobalPlaceholder")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            {t("settings.settingsUICanBeExtended")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
