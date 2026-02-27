"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

const CONSENT_KEY = "mccicts_cookie_consent";
const CONSENT_COOKIE = "mccicts_cookie_consent=accepted";

function hasConsent() {
  if (typeof window === "undefined") return false;
  const stored = window.localStorage.getItem(CONSENT_KEY);
  if (stored === "accepted") return true;
  if (typeof document !== "undefined") {
    return document.cookie.includes(CONSENT_COOKIE);
  }
  return false;
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!hasConsent()) {
      setVisible(true);
    }
  }, []);

  async function logConsent() {
    try {
      await addDoc(collection(db, "cookieConsents"), {
        consent: true,
        createdAt: serverTimestamp(),
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      });
    } catch {
    }
  }

  function handleAccept() {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(CONSENT_KEY, "accepted");
        const maxAge = 60 * 60 * 24 * 365;
        document.cookie = `${CONSENT_COOKIE}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
        void logConsent();
        window.dispatchEvent(new Event("mccicts-cookie-consent"));
      }
    } finally {
      setVisible(false);
    }
  }

  function handleDecline() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(CONSENT_KEY, "declined");
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-6 md:bottom-8 left-0 right-0 z-[90] flex justify-center px-4",
      )}
    >
      <div className="w-full max-w-3xl">
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#05070a]/95 px-5 py-4 md:px-8 md:py-5 shadow-[0_18px_60px_rgba(0,0,0,0.7)]">
          <div className="pointer-events-none absolute -left-24 top-0 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-24 bottom-0 h-40 w-40 rounded-full bg-white/5 blur-3xl" />

          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-[10px] md:text-[11px] uppercase tracking-[0.28em] text-white/40">
                Cookies and analytics
              </p>
              <p className="text-xs md:text-sm text-white/70 leading-relaxed">
                We use cookies and analytics to improve your experience, keep
                you signed in, and understand how students use the MCCICTS
                site. By continuing, you agree to our{" "}
                <a
                  href="/privacy"
                  className="underline underline-offset-4 text-white"
                >
                  Privacy Policy
                </a>{" "}
                and{" "}
                <a
                  href="/terms"
                  className="underline underline-offset-4 text-white"
                >
                  Terms
                </a>
                .
              </p>
            </div>

            <div className="flex shrink-0 justify-end gap-2 md:pl-6">
              <Button
                size="sm"
                variant="outline"
                className="rounded-full px-5 text-[11px] tracking-[0.18em] uppercase border-white/30 text-white hover:bg-white/10"
                onClick={handleDecline}
              >
                Decline
              </Button>
              <Button
                size="sm"
                className="rounded-full px-5 text-[11px] tracking-[0.18em] uppercase bg-white text-black hover:bg-white/90"
                onClick={handleAccept}
              >
                Accept
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
