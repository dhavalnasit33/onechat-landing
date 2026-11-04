/**
 * Resolves the base API URL dynamically based on environment and current host.
 */
export function getApiBase(): string {
  const envBase = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  if (envBase) return envBase.replace(/\/api\/?$/, "");

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    return host === "localhost" || host === "127.0.0.1"
      ? "http://localhost:5000"
      : "https://api.onechatai.ai";
  }

  return "https://api.onechatai.ai";
}

// જે ફાઇલોમાં getApiServerBase નામ વપરાયેલું છે તેના માટે alias:
export const getApiServerBase = getApiBase;