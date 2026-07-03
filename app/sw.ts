/// <reference lib="esnext" />
/// <reference lib="webworker" />

import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import {
  CacheFirst,
  NetworkFirst,
  NetworkOnly,
  Serwist,
  StaleWhileRevalidate,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const EXAM_PATH_PREFIXES = ["/test", "/mock", "/diagnostic"] as const;
const APP_SHELL_PREFIXES = ["/dashboard", "/scores", "/profile"] as const;

function isExamPath(pathname: string): boolean {
  return EXAM_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isAppShellPath(pathname: string): boolean {
  return APP_SHELL_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function shouldUseOfflineFallback(url: URL, request: Request): boolean {
  if (request.destination !== "document") return false;
  if (isExamPath(url.pathname)) return false;
  return true;
}

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/"),
      handler: new NetworkOnly(),
    },
    {
      matcher: ({ url }) => url.hostname === "checkout.razorpay.com",
      handler: new NetworkOnly(),
    },
    {
      matcher: ({ request, url }) =>
        request.destination === "document" && isExamPath(url.pathname),
      handler: new NetworkOnly(),
    },
    {
      matcher: ({ request, url }) =>
        request.destination === "document" && isAppShellPath(url.pathname),
      handler: new NetworkFirst({
        cacheName: "app-shell",
        networkTimeoutSeconds: 5,
      }),
    },
    {
      matcher: ({ url }) => url.pathname.startsWith("/_next/static/"),
      handler: new CacheFirst({
        cacheName: "next-static",
      }),
    },
    {
      matcher: ({ url }) => url.pathname.startsWith("/_next/image/"),
      handler: new CacheFirst({
        cacheName: "next-image",
      }),
    },
    {
      matcher: ({ url }) =>
        url.hostname === "fonts.googleapis.com" ||
        url.hostname === "fonts.gstatic.com",
      handler: new CacheFirst({
        cacheName: "google-fonts",
      }),
    },
    {
      matcher: ({ url }) => url.pathname.startsWith("/diagnostic/"),
      handler: new NetworkFirst({
        cacheName: "diagnostic-assets",
        networkTimeoutSeconds: 5,
      }),
    },
    {
      matcher: ({ request }) => request.destination === "document",
      handler: new StaleWhileRevalidate({
        cacheName: "pages",
      }),
    },
    {
      matcher: ({ request }) =>
        request.destination === "image" ||
        request.destination === "style" ||
        request.destination === "script" ||
        request.destination === "font",
      handler: new CacheFirst({
        cacheName: "static-assets",
      }),
    },
  ],
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return shouldUseOfflineFallback(new URL(request.url), request);
        },
      },
    ],
  },
});

serwist.addEventListeners();
