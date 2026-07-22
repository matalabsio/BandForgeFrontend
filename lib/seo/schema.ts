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
