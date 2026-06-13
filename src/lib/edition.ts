// Device edition / co-branding helpers.
//
// The firmware reports an "Edition:" line over serial (see SerialConfig.cpp).
// The stock build reports "iTAIKO"; a ZhongTaiko build reports "ZhongTaiko".
// When a ZhongTaiko device is connected we show the co-branding "ZhongTaiko x iTAIKO".

export const ZHONGTAIKO_EDITION = "ZhongTaiko";

// Persisted so the landing page (which lives outside the DeviceProvider) can
// reflect the last-connected device's edition.
const EDITION_STORAGE_KEY = "itaiko-edition";

export function isZhongTaiko(edition?: string | null): boolean {
  return edition === ZHONGTAIKO_EDITION;
}

// Co-branding lockup text shown for the ZhongTaiko edition.
export const ZHONGTAIKO_BRAND = "ZhongTaiko × iTAIKO";

export function rememberEdition(edition?: string): void {
  try {
    if (edition) {
      localStorage.setItem(EDITION_STORAGE_KEY, edition);
    }
  } catch {
    // localStorage may be unavailable (private mode); branding is best-effort.
  }
}

export function getRememberedEdition(): string | null {
  try {
    return localStorage.getItem(EDITION_STORAGE_KEY);
  } catch {
    return null;
  }
}
