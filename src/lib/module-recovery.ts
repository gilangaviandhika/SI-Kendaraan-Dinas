// Runs before the app entry: a stale preview module must not leave SSR forms inert.
export const moduleRecoveryScript = `(() => {
  const key = 'vehicle-module-recovery-at';
  const recover = (message) => {
    if (!/Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(message)) return;
    try {
      const previous = Number(sessionStorage.getItem(key) || 0);
      if (Date.now() - previous < 60000) return;
      sessionStorage.setItem(key, String(Date.now()));
      location.reload();
    } catch { /* Storage may be unavailable; never risk a reload loop. */ }
  };
  window.addEventListener('error', (event) => recover(event.message || ''));
  window.addEventListener('unhandledrejection', (event) => recover(event.reason?.message || String(event.reason || '')));
  document.addEventListener('vite:preloadError', (event) => recover(event.payload?.message || ''));
})();`;