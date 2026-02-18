/**
 * Session idle: register a callback to be called on "activity" (e.g. API request).
 * Used to avoid circular dependency between api client and auth store.
 */

let activityCallback: (() => void) | null = null;

export function registerActivityTouch(callback: () => void): void {
  activityCallback = callback;
}

export function touchActivity(): void {
  activityCallback?.();
}
