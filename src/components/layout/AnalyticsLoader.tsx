"use client";

import { useEffect } from "react";
import { initAnalytics } from "@/lib/analytics";

function hasConsentClient() {
  if (typeof window === "undefined") return false;
  if (typeof document === "undefined") return false;
  if (document.cookie.includes("mccicts_cookie_consent=accepted")) return true;
  const stored = window.localStorage.getItem("mccicts_cookie_consent");
  return stored === "accepted";
}

export default function AnalyticsLoader() {
  useEffect(() => {
    if (hasConsentClient()) {
      void initAnalytics();
    }

    function handleConsent() {
      void initAnalytics();
    }

    window.addEventListener("mccicts-cookie-consent", handleConsent);

    return () => {
      window.removeEventListener("mccicts-cookie-consent", handleConsent);
    };
  }, []);

  return null;
}

