export const ANALYTICS_CONSENT_KEY = "breeze-villa-analytics-consent";

export type AnalyticsEventParameters = Record<
  string,
  string | number | boolean | undefined
>;

export function trackAnalyticsEvent(
  eventName: string,
  parameters: AnalyticsEventParameters = {}
) {
  if (typeof window === "undefined" || !window.gtag) return;
  if (window.localStorage.getItem(ANALYTICS_CONSENT_KEY) !== "accepted") return;

  window.gtag("event", eventName, parameters);
}

