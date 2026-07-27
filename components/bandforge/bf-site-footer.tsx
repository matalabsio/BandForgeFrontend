import Link from "next/link";
import { MapPin } from "lucide-react";
import { BfBrandBars } from "@/components/bandforge/bf-brand-bars";
import {
  BF_FOOTER_COLUMNS,
  BF_FOOTER_YEAR,
  type BfFooterLink,
} from "@/components/bandforge/bf-footer-links";
import { cn } from "@/lib/utils";

/** Short footer blurb — not the full SEO entity description. */
const FOOTER_BLURB =
  "IELTS prep for Telugu- and Urdu-speaking students in Telangana and Andhra Pradesh. Based in Hyderabad.";

function FooterLinkRow({ link }: { link: BfFooterLink }) {
  const Icon = link.icon;
  return (
    <li>
      <Link
        href={link.href}
        prefetch
        className="group inline-flex cursor-pointer items-center gap-2 py-1.5 text-[0.8125rem] text-[#8FA3B8] no-underline transition-colors duration-200 hover:text-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40 sm:text-[0.875rem]"
      >
        <Icon
          className="size-3.5 shrink-0 text-[#5B6F86] transition-colors duration-200 group-hover:text-cyan"
          strokeWidth={1.75}
          aria-hidden
        />
        <span>{link.label}</span>
      </Link>
    </li>
  );
}

type Props = {
  className?: string;
  /** When true, omit outer top border (e.g. already bordered by parent). */
  embedded?: boolean;
};

/** Site footer — compact brand + icon links, responsive. */
export function BandForgeSiteFooter({ className, embedded = false }: Props) {
  return (
    <footer
      className={cn(
        "bg-[#0D1F3C] text-white",
        !embedded && "border-t border-white/[0.07]",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-[1100px] px-5 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-[minmax(0,280px)_1fr_minmax(0,160px)] lg:gap-12 xl:gap-16">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              prefetch
              className="inline-flex cursor-pointer items-center gap-2.5 no-underline transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D1F3C]"
              aria-label="BandForge home"
            >
              <BfBrandBars size="footer" />
              <span className="font-display text-[1.0625rem] font-bold tracking-tight sm:text-[1.125rem]">
                Band<span className="text-cyan">Forge</span>
              </span>
            </Link>

            <p className="mt-3.5 max-w-[34ch] text-[0.8125rem] leading-[1.55] text-[#8FA3B8] sm:text-[0.875rem] sm:leading-[1.6]">
              {FOOTER_BLURB}
            </p>

            <p className="mt-4 inline-flex items-center gap-1.5 text-[0.75rem] text-[#6B7F96]">
              <MapPin className="size-3.5 shrink-0 text-cyan" strokeWidth={2} aria-hidden />
              <span>Hyderabad, Telangana</span>
            </p>
          </div>

          {/* Link columns */}
          {BF_FOOTER_COLUMNS.map((col) => {
            const ColIcon = col.icon;
            return (
              <nav key={col.title} aria-label={col.title} className="min-w-0">
                <div className="mb-3 flex items-center gap-2">
                  <ColIcon
                    className="size-3.5 shrink-0 text-cyan"
                    strokeWidth={2}
                    aria-hidden
                  />
                  <p className="font-display text-[0.8125rem] font-semibold tracking-wide text-white uppercase sm:text-sm sm:normal-case sm:tracking-tight">
                    {col.title}
                  </p>
                </div>
                <ul className="flex flex-col">
                  {col.links.map((link) => (
                    <FooterLinkRow
                      key={`${col.title}-${link.href}-${link.label}`}
                      link={link}
                    />
                  ))}
                </ul>
              </nav>
            );
          })}
        </div>

        <div className="mt-9 flex flex-col gap-2 border-t border-white/[0.08] pt-5 sm:mt-10 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <p className="text-[0.6875rem] text-[#64748B] sm:text-xs">
            © {BF_FOOTER_YEAR} BandForge · MATA Labs OPC
          </p>
          <p className="text-[0.6875rem] text-[#54647C] sm:text-xs">
            IELTS prep for Telugu &amp; Urdu speakers
          </p>
        </div>
      </div>
    </footer>
  );
}
