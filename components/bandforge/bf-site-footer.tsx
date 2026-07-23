import Link from "next/link";
import { BfBrandBars } from "@/components/bandforge/bf-brand-bars";
import { marketingAppHref } from "@/components/bandforge/bf-marketing-auth-links";
import { SITE_ENTITY_DESCRIPTION } from "@/lib/seo/metadata";

const COPYRIGHT_YEAR = 2026;

const productLinks = [
  { href: "/diagnostic", label: "Free diagnostic" },
  { href: "/writing", label: "Writing Sprint" },
  { href: "/speaking", label: "Speaking Sprint" },
  { href: "/how-it-works", label: "Mock tests" },
  { href: "/pricing", label: "Pricing" },
  { href: marketingAppHref(), label: "Practice" },
] as const;

const ieltsPrepLinks = [
  { href: "/telugu", label: "Telugu speakers" },
  { href: "/urdu", label: "Urdu speakers" },
  { href: "/hyderabad", label: "Hyderabad" },
  { href: "/faq", label: "FAQ" },
  { href: "/vs-coaching-centres", label: "vs Coaching" },
  { href: "/blog", label: "Blog" },
] as const;

const companyLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

const legalLinks = [
  { href: "/privacy-policy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/refund-policy", label: "Refunds" },
] as const;

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="font-display text-sm font-semibold text-white">{title}</p>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2.5 lg:mt-4 lg:block lg:space-y-2.5 lg:gap-0">
        {links.map((l) => (
          <li key={`${title}-${l.href}-${l.label}`} className="lg:block">
            <Link
              href={l.href}
              prefetch
              className="cursor-pointer text-[0.8125rem] text-slate transition-colors duration-200 hover:text-cyan lg:text-sm"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Site footer — Product / IELTS prep / Company / Legal, responsive. */
export function BandForgeSiteFooter() {
  return (
    <footer className="border-t border-white/7 bg-navy-deep text-white">
      <div className="mx-auto w-full max-w-[1200px] px-5 py-8 sm:px-6 sm:py-[34px] lg:px-10 lg:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr] lg:gap-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-[9px] lg:gap-2.5">
              <BfBrandBars size="footer" />
              <p className="font-display text-[1.0625rem] font-bold tracking-tight lg:text-[1.1875rem]">
                Band<span className="text-cyan">Forge</span>
              </p>
            </div>
            <p className="mt-3.5 max-w-[42ch] text-[0.8125rem] leading-normal text-[#7e93ad] lg:text-sm lg:leading-relaxed">
              {SITE_ENTITY_DESCRIPTION}
            </p>
          </div>
          <FooterColumn title="Product" links={productLinks} />
          <FooterColumn title="IELTS prep" links={ieltsPrepLinks} />
          <FooterColumn title="Company" links={companyLinks} />
          <FooterColumn title="Legal" links={legalLinks} />
        </div>

        <div className="mt-8 border-t border-white/6 pt-5 text-[0.6875rem] text-[#54647c] lg:mt-10 lg:text-xs">
          © {COPYRIGHT_YEAR} BandForge · MATA Labs OPC
        </div>
      </div>
    </footer>
  );
}
