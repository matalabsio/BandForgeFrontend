import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Mono, DM_Sans } from "next/font/google";
import { AppRoot } from "@/components/bandforge/app-root";
import { GOOGLE_FONTS_STYLESHEET_HREF } from "@/lib/google-fonts";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://matalabs.io"),
  title: {
    default: "BandForge | AI-first IELTS preparation",
    template: "%s | BandForge",
  },
  description:
    "Real IELTS-style mocks, AI writing evaluation, speaking insights, and instant Reading & Listening scores — built for Telugu-speaking students targeting Band 7+.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "BandForge | AI-first IELTS preparation",
    description:
      "Realistic IELTS simulations, AI-powered feedback, and personalised practice — by MATA Labs.",
    url: "/",
    siteName: "BandForge",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [{ url: "/icon.png", type: "image/png", sizes: "32x32" }],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
  },
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
      className={`${bricolage.variable} ${dmSans.variable} ${dmMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link href={GOOGLE_FONTS_STYLESHEET_HREF} rel="stylesheet" />
      </head>
      <body className="min-h-dvh font-sans" suppressHydrationWarning>
        <AppRoot>{children}</AppRoot>
      </body>
    </html>
  );
}
