import Link from "next/link";
import { BfBrandBars } from "@/components/bandforge/bf-brand-bars";
import {
  marketingAppHref,
  marketingSignInHref,
} from "@/components/bandforge/bf-marketing-auth-links";
import { getMarketingSessionUser } from "@/lib/marketing-auth-server";
import { isAuthEnabled } from "@/lib/flags";

async function footerNavLinks() {
  const user = await getMarketingSessionUser();
  const mobileLinks = [
    {
      href: user || !isAuthEnabled() ? "/dashboard" : marketingAppHref(),
      label: "Practice",
    },
    { href: "/test", label: "Mock tests" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  const product = [
    {
      href: user || !isAuthEnabled() ? "/dashboard" : marketingAppHref(),
      label: "Practice",
    },
    { href: "/test", label: "Mock tests" },
    { href: "/#pricing", label: "Pricing" },
  ] as const;

  const company = [
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    ...(user
      ? [{ href: "/dashboard", label: "Dashboard" }]
      : [{ href: marketingSignInHref(), label: "Sign in" }]),
  ];

  return { product, company, mobileLinks };
}

const legal = [
  { href: "/privacy-policy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
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
          <li key={l.href}>
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

export async function BandForgeSiteFooter() {
  const { product, company, mobileLinks } = await footerNavLinks();

  return (
    <footer className="border-t border-white/7 bg-navy-deep text-white">
      {/* Mobile footer */}
      <div className="px-6 py-[34px] pb-10 lg:hidden">
        <div className="mb-3 flex items-center gap-[9px]">
          <BfBrandBars size="footer" />
          <p className="font-display text-[1.0625rem] font-bold tracking-tight">
            Band<span className="text-cyan">Forge</span>
          </p>
        </div>
        <p className="mb-[22px] max-w-[30ch] text-[0.8125rem] leading-normal text-[#7e93ad]">
          Forging your band score — craft and precision.
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

      {/* Desktop footer */}
      <div className="mx-auto hidden max-w-[1200px] px-10 py-12 lg:block">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <BfBrandBars size="sm" />
              <p className="font-display text-lg font-bold tracking-tight">
                Band<span className="text-cyan">Forge</span>
              </p>
            </div>
            <p className="mt-3.5 max-w-[30ch] text-sm leading-relaxed text-slate">
              Forging your band score — craft and precision.
            </p>
          </div>
          <FooterColumn title="Product" links={product} />
          <FooterColumn title="Company" links={company} />
          <FooterColumn title="Legal" links={legal} />
        </div>

        <div className="mt-10 border-t border-white/6 pt-5 text-xs text-[#54647c]">
          © {new Date().getFullYear()} BandForge · MATA Labs OPC
        </div>
      </div>
    </footer>
  );
}
