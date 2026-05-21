import type { Metadata } from "next";
import { DM_Mono, DM_Sans, Inter } from "next/font/google";
import { AppRoot } from "@/components/bandforge/app-root";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${dmSans.variable} ${dmMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh font-sans" suppressHydrationWarning>
        <AppRoot>{children}</AppRoot>
      </body>
    </html>
  );
}
