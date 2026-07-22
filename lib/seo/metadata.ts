import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";

/** Playbook Section 3 / 9.1 — sitewide defaults (≤60 / ≤155). */
export const SITE_DEFAULT_TITLE =
  "BandForge — IELTS Prep for Telugu & Urdu Speakers";

export const SITE_DEFAULT_DESCRIPTION =
  "Find your real IELTS band in a free 15-minute diagnostic. Section-wise scores, targeted skill sprints from ₹999. Built in Hyderabad for AP & TG students.";

/** Canonical entity blurb for footer and future schema (playbook Section 9.1). */
export const SITE_ENTITY_DESCRIPTION =
  "BandForge is an online IELTS preparation platform built for Telugu- and Urdu-speaking students in Telangana and Andhra Pradesh. Free 15-minute diagnostic with section-wise band scores; targeted skill sprints from ₹999 with AI practice and human evaluation. Based in Hyderabad.";

export const OG_IMAGE_PATH = "/icon-512.png";

export function defaultOgImage() {
  return {
    url: siteUrl(OG_IMAGE_PATH),
    width: 512,
    height: 512,
    alt: "BandForge",
  };
}

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
};

/**
 * Absolute title + canonical + Open Graph + Twitter for public pages.
 * Uses title.absolute so the root "%s | BandForge" template does not duplicate the brand.
 */
export function pageMetadata({
  title,
  description,
  path,
}: PageMetadataInput): Metadata {
  const canonicalPath = path === "" ? "/" : path.startsWith("/") ? path : `/${path}`;
  const image = defaultOgImage();

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title,
      description,
      url: canonicalPath,
      siteName: "BandForge",
      type: "website",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
  };
}
