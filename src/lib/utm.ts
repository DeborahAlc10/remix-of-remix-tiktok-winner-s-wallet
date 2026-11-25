export interface UtmParams {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referrer: string | null;
}

const UTM_STORAGE_KEY = "utm_params";

function readFromUrl(): UtmParams | null {
  const url = new URL(window.location.href);
  const params = url.searchParams;
  const utm = {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    utm_content: params.get("utm_content"),
    utm_term: params.get("utm_term"),
    referrer: document.referrer || null,
  };
  const hasAny = Object.values(utm).some((v) => v !== null);
  return hasAny ? utm : null;
}

export function captureAndStoreUtm(): UtmParams | null {
  const fromUrl = readFromUrl();
  if (fromUrl) {
    localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(fromUrl));
    return fromUrl;
  }
  const stored = localStorage.getItem(UTM_STORAGE_KEY);
  return stored ? (JSON.parse(stored) as UtmParams) : null;
}
