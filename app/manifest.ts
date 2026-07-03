import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BandForge",
    short_name: "BandForge",
    description:
      "AI-first IELTS preparation — realistic mocks, instant Reading & Listening scores, and AI writing feedback.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0d1f3c",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
