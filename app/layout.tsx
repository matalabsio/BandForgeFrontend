import type { Metadata, Viewport } from "next";
import { AppRoot } from "@/components/bandforge/app-root";
import { PwaRoot } from "@/components/pwa/pwa-root";
import { JsonLd } from "@/components/seo/json-ld";
import {
  SITE_DEFAULT_DESCRIPTION,
  SITE_DEFAULT_TITLE,
  defaultOgImage,
} from "@/lib/seo/metadata";
import { sitewideSchemaGraph } from "@/lib/seo/schema";
import { CANONICAL_SITE_URL } from "@/lib/site";
import "./globals.css";

const ogImage = defaultOgImage();

export const metadata: Metadata = {
  metadataBase: new URL(CANONICAL_SITE_URL),
  applicationName: "BandForge",
  manifest: "/manifest.webmanifest",
  title: {
    default: SITE_DEFAULT_TITLE,
    template: "%s | BandForge",
  },
  description: SITE_DEFAULT_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BandForge",
  },
  openGraph: {
    title: SITE_DEFAULT_TITLE,
    description: SITE_DEFAULT_DESCRIPTION,
    url: "/",
    siteName: "BandForge",
    type: "website",
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_DEFAULT_TITLE,
    description: SITE_DEFAULT_DESCRIPTION,
    images: [ogImage.url],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0d1f3c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-dvh font-sans" suppressHydrationWarning>
        <JsonLd data={sitewideSchemaGraph()} />
        <PwaRoot>
          <AppRoot>{children}</AppRoot>
        </PwaRoot>
      </body>
    </html>
  );
}
