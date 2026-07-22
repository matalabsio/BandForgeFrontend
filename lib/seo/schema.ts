import type { BlogPost } from "@/lib/seo/blog-posts";
import type { FaqItem } from "@/lib/seo/faq-content";
import { faqLeadAnswer } from "@/lib/seo/faq-content";
import { SITE_ENTITY_DESCRIPTION } from "@/lib/seo/metadata";
import { SPRINT_PLANS } from "@/lib/seo/claims";
import { siteUrl } from "@/lib/site";

/** Fill when social URLs are confirmed (Instagram, Facebook, YouTube, WhatsApp). */
export const SAME_AS_URLS: string[] = [];

export function organizationId(): string {
  return `${siteUrl()}/#organization`;
}

type JsonLdObject = Record<string, unknown>;

export function organizationSchema(): JsonLdObject {
  const org: JsonLdObject = {
    "@type": "Organization",
    "@id": organizationId(),
    name: "BandForge",
    url: siteUrl(),
    logo: siteUrl("/icon-512.png"),
    description: SITE_ENTITY_DESCRIPTION,
    parentOrganization: {
      "@type": "Organization",
      name: "MATA Labs OPC Private Limited",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Hyderabad",
      addressRegion: "Telangana",
      addressCountry: "IN",
    },
  };

  if (SAME_AS_URLS.length > 0) {
    org.sameAs = SAME_AS_URLS;
  }

  return org;
}

export function websiteSchema(): JsonLdObject {
  return {
    "@type": "WebSite",
    "@id": `${siteUrl()}/#website`,
    name: "BandForge",
    url: siteUrl(),
    publisher: { "@id": organizationId() },
  };
}

/** Sitewide Organization + WebSite as a single @graph document. */
export function sitewideSchemaGraph(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@graph": [organizationSchema(), websiteSchema()],
  };
}

export function pricingProductSchemas(): JsonLdObject[] {
  const pricingUrl = siteUrl("/pricing");
  const orgRef = { "@id": organizationId() };

  return SPRINT_PLANS.map((product) => ({
    "@type": "Product",
    "@id": `${pricingUrl}/#${product.slug}`,
    name: product.name,
    description: product.schemaDescription,
    url: pricingUrl,
    brand: orgRef,
    seller: orgRef,
    offers: {
      "@type": "Offer",
      url: pricingUrl,
      priceCurrency: "INR",
      price: String(product.priceInr),
      availability: "https://schema.org/InStock",
      seller: orgRef,
    },
  }));
}

/** Pricing page graph: Products only (Organization already on every page via layout). */
export function pricingSchemaGraph(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@graph": pricingProductSchemas(),
  };
}

function sprintPlanBySlug(slug: string) {
  const plan = SPRINT_PLANS.find((entry) => entry.slug === slug);
  if (!plan) {
    throw new Error(`Unknown sprint slug: ${slug}`);
  }
  return plan;
}

export function webPageSchema({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}): JsonLdObject {
  const url = siteUrl(path);
  return {
    "@type": "WebPage",
    "@id": `${url}/#webpage`,
    name,
    description,
    url,
    isPartOf: { "@id": `${siteUrl()}/#website` },
  };
}

export function sprintProductSchema(slug: string): JsonLdObject {
  const plan = sprintPlanBySlug(slug);
  const pagePath = slug === "writing-sprint" ? "/writing" : "/speaking";
  const pageUrl = siteUrl(pagePath);
  const orgRef = { "@id": organizationId() };

  return {
    "@type": "Product",
    "@id": `${pageUrl}/#${plan.slug}`,
    name: plan.name,
    description: plan.schemaDescription,
    url: pageUrl,
    brand: orgRef,
    seller: orgRef,
    offers: {
      "@type": "Offer",
      url: pageUrl,
      priceCurrency: "INR",
      price: String(plan.priceInr),
      availability: "https://schema.org/InStock",
      seller: orgRef,
    },
  };
}

export function sprintPageSchemaGraph(
  slug: "writing-sprint" | "speaking-sprint",
  page: { name: string; description: string; path: string },
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@graph": [webPageSchema(page), sprintProductSchema(slug)],
  };
}

export function faqPageSchema(faq: FaqItem[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faqLeadAnswer(item.answer),
      },
    })),
  };
}

export function localBusinessSchema(): JsonLdObject {
  const url = siteUrl("/hyderabad");
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": `${url}/#localbusiness`,
    name: "BandForge — IELTS Coaching in Hyderabad",
    description: SITE_ENTITY_DESCRIPTION,
    url,
    image: siteUrl("/icon-512.png"),
    priceRange: "₹999–₹2,999",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Gachibowli",
      addressLocality: "Hyderabad",
      addressRegion: "Telangana",
      postalCode: "500032",
      addressCountry: "IN",
    },
    areaServed: [
      { "@type": "State", name: "Telangana" },
      { "@type": "State", name: "Andhra Pradesh" },
    ],
    parentOrganization: { "@id": organizationId() },
  };
}

export function blogCollectionSchema(): JsonLdObject {
  const url = siteUrl("/blog");
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}/#collection`,
    name: "BandForge IELTS Blog",
    description:
      "IELTS preparation guides, band-score tips, and study advice for Telugu- and Urdu-speaking students in AP and Telangana.",
    url,
    isPartOf: { "@id": `${siteUrl()}/#website` },
    publisher: { "@id": organizationId() },
  };
}

export function blogPostingSchema(post: BlogPost): JsonLdObject {
  const url = siteUrl(`/blog/${post.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}/#article`,
    headline: post.title,
    description: post.description,
    url,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { "@id": organizationId() },
    publisher: { "@id": organizationId() },
    mainEntityOfPage: { "@id": `${url}/#webpage` },
  };
}
