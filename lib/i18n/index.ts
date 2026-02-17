export { I18nProvider, useTranslation, type Locale } from "./context";
import { useTranslation } from "./context";

const MISSION_STATUS_KEYS = ["pending", "accepted", "collected", "in_transit", "delivered", "cancelled"] as const;

/** Returns mission status labels for the current locale. Use instead of MISSION_STATUS_LABELS when i18n is needed. */
export function useMissionStatusLabels(): Record<string, string> {
  const { t } = useTranslation();
  return Object.fromEntries(
    MISSION_STATUS_KEYS.map((k) => [k, t(`mission.status.${k}`)])
  ) as Record<string, string>;
}

/** Returns package size labels for the current locale. */
export function usePackageSizeLabels(): Record<string, string> {
  const { t } = useTranslation();
  return {
    small: t("mission.size.small"),
    medium: t("mission.size.medium"),
    large: t("mission.size.large"),
  };
}
