const SESSION_KEY = "si-kendaraan-user";

/** Only call from effects or event handlers; storage may be blocked on a phone. */
export function restoreLoginSession(): string | null {
  try {
    const saved = window.localStorage.getItem(SESSION_KEY);
    if (saved) return saved;
  } catch { /* Keep the in-memory login usable if persistent storage is blocked. */ }
  try {
    const legacy = window.sessionStorage.getItem(SESSION_KEY);
    if (legacy) saveLoginSession(legacy);
    return legacy;
  } catch { return null; }
}

export function saveLoginSession(username: string): void {
  try { window.localStorage.setItem(SESSION_KEY, username); } catch { /* Storage unavailable. */ }
  try { window.sessionStorage.setItem(SESSION_KEY, username); } catch { /* Storage unavailable. */ }
}

export function clearLoginSession(): void {
  try { window.localStorage.removeItem(SESSION_KEY); } catch { /* Storage unavailable. */ }
  try { window.sessionStorage.removeItem(SESSION_KEY); } catch { /* Storage unavailable. */ }
}