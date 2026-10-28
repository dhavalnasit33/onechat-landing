/**
 * Funnel Analytics & Mixpanel Helper
 * Implements the Anonymous Visitor Funnel Tracking Specification:
 * - landing_page_viewed
 * - landing_cta_clicked
 * - interest_modal_opened
 * - interest_modal_closed
 * - interest_selection_completed
 * - registration_form_viewed
 * - registration_completed
 */

const ANONYMOUS_ID_KEY = "oc_funnel_anon_id";
const SESSION_ID_KEY = "oc_funnel_session_id";
const SESSION_LAST_ACTIVE_KEY = "oc_funnel_session_time";
const INTERNAL_FLAG_KEY = "oc_internal_traffic";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

/** Generate UUID v4 without external heavy dependency */
function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Get or create a persistent anonymous identifier */
export function getAnonymousId(): string {
  if (typeof window === "undefined") return "";
  try {
    let anonId = localStorage.getItem(ANONYMOUS_ID_KEY);
    if (!anonId) {
      anonId = generateUUID();
      localStorage.setItem(ANONYMOUS_ID_KEY, anonId);
    }
    return anonId;
  } catch (_) {
    return "anonymous_fallback";
  }
}

/** Get or refresh a 30-min session ID */
export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    const now = Date.now();
    const lastActiveStr = sessionStorage.getItem(SESSION_LAST_ACTIVE_KEY);
    let sessionId = sessionStorage.getItem(SESSION_ID_KEY);

    if (!sessionId || !lastActiveStr || now - parseInt(lastActiveStr, 10) > SESSION_TIMEOUT_MS) {
      sessionId = generateUUID();
      sessionStorage.setItem(SESSION_ID_KEY, sessionId);
    }
    sessionStorage.setItem(SESSION_LAST_ACTIVE_KEY, now.toString());
    return sessionId;
  } catch (_) {
    return "session_fallback";
  }
}

/** Detect device type accurately */
export function getDeviceType(): "desktop" | "tablet" | "mobile" {
  if (typeof window === "undefined") return "desktop";
  const ua = navigator.userAgent.toLowerCase();
  const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk)/i.test(ua);
  if (isTablet) return "tablet";
  const isMobile = /mobile|iphone|ipod|android.*mobile|blackberry|opera mini|windows phone|iemobile|wpdesktop/i.test(ua);
  if (isMobile) return "mobile";
  return "desktop";
}

/** Get UTM parameters and referrer safely */
export function getTrafficSource(): {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer?: string;
} {
  if (typeof window === "undefined") return {};
  try {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get("utm_source") || undefined,
      utm_medium: params.get("utm_medium") || undefined,
      utm_campaign: params.get("utm_campaign") || undefined,
      referrer: document.referrer ? new URL(document.referrer).hostname : undefined,
    };
  } catch (_) {
    return {};
  }
}

/**
 * Check if current visitor is internal team (Habib/Dhaval team) or local/preview development.
 * Allows opt-in/opt-out via `?internal=true` URL param or localStorage key.
 */
export function isInternalTraffic(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const hostname = window.location.hostname;
    // Exclude localhost / staging / local dev
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.endsWith(".local") ||
      hostname.includes("preview")
    ) {
      return true;
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get("internal") === "true") {
      localStorage.setItem(INTERNAL_FLAG_KEY, "true");
      return true;
    }
    if (params.get("internal") === "false") {
      localStorage.removeItem(INTERNAL_FLAG_KEY);
      return false;
    }

    return localStorage.getItem(INTERNAL_FLAG_KEY) === "true";
  } catch (_) {
    return false;
  }
}

/**
 * Send canonical analytics event to Mixpanel (and window.dataLayer)
 * Completely non-blocking and protected by try-catch.
 */
export function trackFunnelEvent(
  eventName:
    | "landing_page_viewed"
    | "landing_cta_clicked"
    | "interest_modal_opened"
    | "interest_modal_closed"
    | "interest_selection_completed"
    | "registration_form_viewed"
    | "registration_completed",
  customProps: Record<string, any> = {},
  onComplete?: () => void
) {
  if (typeof window === "undefined") {
    if (onComplete) onComplete();
    return;
  }

  try {
    const internal = isInternalTraffic();
    const anonymous_id = getAnonymousId();
    const session_id = getSessionId();
    const device_type = getDeviceType();
    const traffic = getTrafficSource();

    // Persist and inherit last clicked cta_id so all subsequent funnel steps have cta_id
    if (customProps.cta_id) {
      try {
        sessionStorage.setItem("oc_last_cta_id", String(customProps.cta_id));
        if (customProps.cta_location) {
          sessionStorage.setItem("oc_last_cta_location", String(customProps.cta_location));
        }
      } catch (_) {}
    }

    const savedCtaId = typeof window !== "undefined" ? sessionStorage.getItem("oc_last_cta_id") || "hero_start_trial" : undefined;
    const savedCtaLoc = typeof window !== "undefined" ? sessionStorage.getItem("oc_last_cta_location") || "landing" : undefined;

    const basePayload = {
      anonymous_id,
      session_id,
      path: window.location.pathname,
      device_type,
      is_internal: internal,
      cta_id: customProps.cta_id || savedCtaId,
      cta_location: customProps.cta_location || savedCtaLoc,
      ...traffic,
      ...customProps,
      timestamp: new Date().toISOString(),
      time: Math.floor(Date.now() / 1000),
    };

    let callbackCalled = false;
    const safeComplete = () => {
      if (!callbackCalled && onComplete) {
        callbackCalled = true;
        onComplete();
      }
    };

    // Send to Mixpanel with callback & sendBeacon guarantee
    const win = window as any;
    if (win.mixpanel && typeof win.mixpanel.track === "function") {
      win.mixpanel.track(eventName, basePayload, { transport: "sendBeacon" }, () => {
        safeComplete();
      });
    }

    // Also push to standard dataLayer if present
    if (Array.isArray(win.dataLayer)) {
      win.dataLayer.push({
        event: eventName,
        ...basePayload,
      });
    }

    // Safety fallback in case mixpanel callback takes too long or ad blocker suppresses it
    if (onComplete) {
      setTimeout(safeComplete, 400);
    }
  } catch (err) {
    console.warn(`[FunnelAnalytics] Failed to track ${eventName}:`, err);
    if (onComplete) onComplete();
  }
}

/**
 * Identify registered user in Mixpanel and link anonymous actions
 */
export function identifyRegisteredUser(
  userId: string,
  userProps: Record<string, any> = {}
) {
  if (typeof window === "undefined" || !userId) return;
  try {
    const win = window as any;
    if (win.mixpanel && typeof win.mixpanel.identify === "function") {
      // Links anonymous distinct_id to registered userId
      win.mixpanel.identify(userId);
      if (win.mixpanel.people && typeof win.mixpanel.people.set === "function") {
        win.mixpanel.people.set({
          $user_id: userId,
          $name: userProps.name || `${userProps.firstName || ""} ${userProps.lastName || ""}`.trim(),
          $email: userProps.email,
          device_type: getDeviceType(),
          signup_date: new Date().toISOString(),
          ...userProps,
        });
      }
    }
  } catch (err) {
    console.warn("[FunnelAnalytics] Failed to identify user:", err);
  }
}
