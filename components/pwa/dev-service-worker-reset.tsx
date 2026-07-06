"use client";

import { useEffect } from "react";

/** Drop any service worker registered before dev-mode disable (stale Turbopack chunks). */
export function DevServiceWorkerReset() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    void navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        void registration.unregister();
      }
    });

    if ("caches" in window) {
      void caches.keys().then((keys) => {
        for (const key of keys) {
          if (
            key.includes("next-static") ||
            key.includes("static-assets") ||
            key.includes("serwist") ||
            key.includes("workbox")
          ) {
            void caches.delete(key);
          }
        }
      });
    }
  }, []);

  return null;
}
