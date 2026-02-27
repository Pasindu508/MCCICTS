"use client";

import { getAnalytics, isSupported, logEvent } from "firebase/analytics";
import { app } from "@/lib/firebase";

let analyticsPromise: Promise<ReturnType<typeof getAnalytics> | null> | null =
  null;

export function initAnalytics() {
  if (typeof window === "undefined") return null;
  if (!analyticsPromise) {
    analyticsPromise = isSupported().then((yes) =>
      yes ? getAnalytics(app) : null,
    );
  }
  return analyticsPromise;
}

export async function logPageView(path: string) {
  const analytics = await initAnalytics();
  if (!analytics) return;
  logEvent(analytics, "page_view", {
    page_path: path,
  });
}

