import type { Metadata } from "next";
import { DM_Mono, DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://matalabs.io"),
  title: {
    default: "MATA Labs | Launching Soon",
    template: "%s | MATA Labs",
  },
  description:
    "MATA Labs is building AI-first digital products, systems, and experiences.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "MATA Labs | Launching Soon",
    description:
      "MATA Labs is building AI-first digital products, systems, and experiences.",
    url: "/",
    siteName: "MATA Labs",
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
      className={`${dmSans.variable} ${dmMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
