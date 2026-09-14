"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const MEASUREMENT_ID = "G-FL6B9369V4";
const CONSENT_KEY = "breeze-villa-analytics-consent";

type Consent = "accepted" | "declined" | null;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
    "ga-disable-G-FL6B9369V4"?: boolean;
  }
}

function initialiseGoogleTag(consent: Consent) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };
  window.gtag("consent", "default", {
    analytics_storage: consent === "accepted" ? "granted" : "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    wait_for_update: 500,
  });
  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID, {
    anonymize_ip: true,
    page_path: window.location.pathname + window.location.search,
    send_page_view: false,
  });

  if (document.getElementById("breeze-villa-google-analytics")) return;
  const script = document.createElement("script");
  script.id = "breeze-villa-google-analytics";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<Consent>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;

    const saved = window.localStorage.getItem(CONSENT_KEY) as Consent;
    const initialConsent =
      saved === "accepted" || saved === "declined" ? saved : null;
    window["ga-disable-G-FL6B9369V4"] = initialConsent !== "accepted";
    initialiseGoogleTag(initialConsent);
    setConsent(initialConsent);
    setReady(initialConsent === "accepted");

    const openPreferences = () => setConsent(null);
    window.addEventListener("breeze-villa-open-cookie-preferences", openPreferences);
    return () =>
      window.removeEventListener(
        "breeze-villa-open-cookie-preferences",
        openPreferences
      );
  }, []);

  useEffect(() => {
    if (consent !== "accepted" || pathname.startsWith("/admin")) return;
    window["ga-disable-G-FL6B9369V4"] = false;
    window.gtag?.("consent", "update", { analytics_storage: "granted" });
    window.gtag?.("config", MEASUREMENT_ID, {
      anonymize_ip: true,
      send_page_view: false,
      page_path: window.location.pathname + window.location.search,
    });
    setReady(true);
  }, [consent, pathname]);

  useEffect(() => {
    if (!ready || !window.gtag) return;
    window.gtag("event", "page_view", {
      page_title: document.title,
      page_location: window.location.href,
      page_path: pathname + window.location.search,
      anonymize_ip: true,
    });
  }, [pathname, ready]);

  if (pathname.startsWith("/admin") || consent !== null) return null;

  const saveConsent = (value: Exclude<Consent, null>) => {
    window.localStorage.setItem(CONSENT_KEY, value);
    if (value === "declined") {
      window["ga-disable-G-FL6B9369V4"] = true;
      window.gtag?.("consent", "update", { analytics_storage: "denied" });
      setReady(false);
    }
    setConsent(value);
  };

  return (
    <section
      aria-label="Preferințe cookie"
      className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-3xl rounded-3xl border border-[#D9B56D]/40 bg-[#071B2D] p-5 text-white shadow-2xl sm:bottom-5 sm:p-6"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <h2 className="text-lg font-black">Cookie-uri și statistici</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Folosim cookie-uri necesare funcționării site-ului. Cu acordul tău,
            Google Analytics ne ajută să înțelegem ce pagini sunt utile, fără
            să vindem datele tale. Detalii în{" "}
            <Link
              href="/politica-cookie"
              className="font-bold text-[#66D7D4] underline underline-offset-2"
            >
              Politica de cookie-uri
            </Link>
            .
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:min-w-44">
          <button
            type="button"
            onClick={() => saveConsent("accepted")}
            className="rounded-full bg-[#D9B56D] px-5 py-3 text-sm font-black text-[#071B2D] transition hover:bg-white"
          >
            Accept statistici
          </button>
          <button
            type="button"
            onClick={() => saveConsent("declined")}
            className="rounded-full border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
          >
            Doar necesare
          </button>
        </div>
      </div>
    </section>
  );
}
