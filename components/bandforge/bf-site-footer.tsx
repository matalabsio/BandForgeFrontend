import Link from "next/link";
import { BfBrandBars } from "@/components/bandforge/bf-brand-bars";
import {
  marketingAppHref,
  marketingSignInHref,
} from "@/components/bandforge/bf-marketing-auth-links";
import { isAuthEnabled } from "@/lib/flags";
import { SITE_ENTITY_DESCRIPTION } from "@/lib/seo/metadata";

const legal = [
  { href: "/privacy-policy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/refund-policy", label: "Refunds" },
] as const;

const mobileLinks = [
  { href: "/diagnostic", label: "Diagnostic" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
  { href: "/telugu", label: "Telugu" },
  { href: "/hyderabad", label: "Hyderabad" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

const ieltsPrep = [
  { href: "/telugu", label: "Telugu speakers" },
  { href: "/urdu", label: "Urdu speakers" },
  { href: "/hyderabad", label: "Hyderabad" },
  { href: "/faq", label: "FAQ" },
  { href: "/vs-coaching-centres", label: "vs Coaching" },
  { href: "/blog", label: "Blog" },
] as const;

const productLinks = [
  { href: "/diagnostic", label: "Free diagnostic" },
  { href: "/pricing", label: "Pricing" },
  { href: "/writing", label: "Writing Sprint" },
  { href: "/speaking", label: "Speaking Sprint" },
  {
    href: !isAuthEnabled() ? "/dashboard" : marketingAppHref(),
    label: "Practice",
  },
  { href: "/test", label: "Mock tests" },
] as const;

const companyLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: marketingSignInHref(), label: "Sign in" },
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
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={`${title}-${l.href}-${l.label}`}>
            <Link
              href={l.href}
              prefetch
              className="cursor-pointer text-sm text-slate transition-colors duration-200 hover:text-cyan"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Site footer — static links so marketing routes can ISR without cookie reads. */
export function BandForgeSiteFooter() {
  return (
    <footer className="border-t border-white/7 bg-navy-deep text-white">
      <div className="px-5 py-8 sm:px-6 sm:py-[34px] sm:pb-10 lg:hidden">
        <div className="mb-3 flex items-center gap-[9px]">
          <BfBrandBars size="footer" />
          <p className="font-display text-[1.0625rem] font-bold tracking-tight">
            Band<span className="text-cyan">Forge</span>
          </p>
        </div>
        <p className="mb-[22px] max-w-[42ch] text-[0.8125rem] leading-normal text-[#7e93ad]">
          {SITE_ENTITY_DESCRIPTION}
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-[18px] text-[0.8125rem] text-slate">
          {mobileLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              prefetch
              className="text-slate no-underline hover:text-cyan"
            >
              {l.label}
            </Link>
          ))}
        </div>
        <p className="mt-[26px] text-[0.6875rem] text-[#54647c]">
          © {new Date().getFullYear()} BandForge · MATA Labs OPC
        </p>
      </div>

      <div className="mx-auto hidden w-full max-w-[1200px] px-8 py-12 lg:block xl:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <BfBrandBars size="sm" />
              <p className="font-display text-lg font-bold tracking-tight">
                Band<span className="text-cyan">Forge</span>
              </p>
            </div>
            <p className="mt-3.5 max-w-[42ch] text-sm leading-relaxed text-slate">
              {SITE_ENTITY_DESCRIPTION}
            </p>
          </div>
          <FooterColumn title="Product" links={productLinks} />
          <FooterColumn title="IELTS prep" links={ieltsPrep} />
          <FooterColumn title="Company" links={companyLinks} />
          <FooterColumn title="Legal" links={legal} />
        </div>

        <div className="mt-10 border-t border-white/6 pt-5 text-xs text-[#54647c]">
          © {new Date().getFullYear()} BandForge · MATA Labs OPC
        </div>
      </div>
    </footer>
  );
}
