export interface RegistrationAttribution {
  source?: string;
  cta_id: string;
  cta_label: string;
  section_id: string;
  section_label: string;
  item_id?: string;
  item_label?: string;
  page: string;
  clicked_at: string;
}

export type RegistrationCTAInput = Omit<RegistrationAttribution, "page" | "clicked_at"> & {
  page?: string;
  clicked_at?: string;
};

export const ATTRIBUTION_STORAGE_KEY = "onechat_registration_attribution";

/**
 * Record landing CTA click in analytics systems (gtag, dataLayer, custom event, etc.)
 * Always safe and non-blocking.
 */
export function trackLandingCtaClick(attribution: RegistrationAttribution) {
  try {
    if (typeof window !== "undefined") {
      const win = window as any;

      // 1. Google Tag / GA4 gtag event
      if (typeof win.gtag === "function") {
        win.gtag("event", "landing_cta_click", {
          cta_id: attribution.cta_id,
          cta_label: attribution.cta_label,
          section_id: attribution.section_id,
          section_label: attribution.section_label,
          item_id: attribution.item_id || "",
          item_label: attribution.item_label || "",
          page: attribution.page,
          clicked_at: attribution.clicked_at,
        });
      }

      // 2. dataLayer push if exists
      if (Array.isArray(win.dataLayer)) {
        win.dataLayer.push({
          event: "landing_cta_click",
          ...attribution,
        });
      }

      // 3. Dispatch standard custom event for client-side event listeners
      window.dispatchEvent(
        new CustomEvent("landing_cta_click", { detail: attribution })
      );
    }
  } catch (err) {
    console.warn("Analytics CTA tracking failed (non-blocking):", err);
  }
}

/**
 * Temporarily save attribution in sessionStorage.
 * Rule: Last registration CTA clicked before registration wins.
 */
export function saveRegistrationAttribution(attribution: RegistrationAttribution) {
  try {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        ATTRIBUTION_STORAGE_KEY,
        JSON.stringify(attribution)
      );
    }
  } catch (err) {
    console.warn("Could not save registration attribution to sessionStorage:", err);
  }
}

/**
 * Retrieve saved registration attribution.
 */
export function getRegistrationAttribution(): RegistrationAttribution | null {
  try {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as RegistrationAttribution;
      }
    }
  } catch (err) {
    console.warn("Could not read registration attribution:", err);
  }
  return null;
}

/**
 * Clear registration attribution from storage after successful account creation.
 */
export function clearRegistrationAttribution() {
  try {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(ATTRIBUTION_STORAGE_KEY);
    }
  } catch (err) {
    console.warn("Could not clear registration attribution:", err);
  }
}

/**
 * Shared CTA handler function that:
 * 1. Records analytics event ("landing_cta_click")
 * 2. Saves attribution temporarily in browser storage
 * 3. Opens the registration popup via onOpenAuth callback
 */
export function handleRegistrationCTA(
  attributionInput: RegistrationCTAInput,
  onOpenAuth?: (mode?: "signin" | "signup") => void,
  mode: "signin" | "signup" = "signup"
) {
  const attribution: RegistrationAttribution = {
    source: "landing_page",
    page: attributionInput.page || "landing_page",
    clicked_at: attributionInput.clicked_at || new Date().toISOString(),
    cta_id: attributionInput.cta_id,
    cta_label: attributionInput.cta_label,
    section_id: attributionInput.section_id,
    section_label: attributionInput.section_label,
    ...(attributionInput.item_id ? { item_id: attributionInput.item_id } : {}),
    ...(attributionInput.item_label ? { item_label: attributionInput.item_label } : {}),
  };

  // 1. Record analytics event
  trackLandingCtaClick(attribution);

  // 2. Save attribution temporarily in browser (sessionStorage)
  saveRegistrationAttribution(attribution);

  // 3. Open registration/auth popup immediately
  if (typeof onOpenAuth === "function") {
    onOpenAuth(mode);
  }
}

