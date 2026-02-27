import { cookies } from "next/headers";

export async function getCookieConsent() {
  const store = await cookies();
  const cookie = store.get("mccicts_cookie_consent");
  const hasConsent = cookie?.value === "accepted";

  return {
    hasConsent,
    value: cookie?.value ?? null,
  };
}
