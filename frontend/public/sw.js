// Minimal service worker — does nothing.
// Placeholder for PWA support. Drop-in for PWABuilder later.

self.addEventListener('install', () => {
  // Skip waiting so the new SW activates immediately.
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  // Take control of all clients right away.
  self.clients.claim();
});

// Intentionally no fetch handling — network requests pass through untouched.
