import Link from "next/link";

const product = [
  { href: "/?start=1", label: "Start free mock test" },
  { href: "/features", label: "Features" },
  { href: "/ai-feedback", label: "AI evaluation" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/mobile", label: "Mobile & PWA" },
] as const;

const company = [
  { href: "/why", label: "Why BandForge" },
  { href: "/stories", label: "Testimonials" },
  { href: "/contact", label: "Contact" },
] as const;

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
      <p className="text-meta font-semibold uppercase tracking-wider text-white/45">
        {title}
      </p>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="cursor-pointer text-body text-white/70 transition-colors duration-200 hover:text-teal-light"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-white/15 text-white/55 transition-colors duration-200 hover:border-teal-light/40 hover:bg-white/5 hover:text-teal-light"
    >
      {children}
    </a>
  );
}

export function BandForgeSiteFooter() {
  return (
    <footer className="border-t border-border bg-navy text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div className="lg:col-span-1">
            <p className="text-lg font-bold tracking-tight">
              Band<span className="text-teal-light">Forge</span>
            </p>
            <p className="mt-1 text-meta text-white/50">by MATA Labs</p>
            <p className="mt-4 max-w-xs text-body leading-relaxed text-white/65">
              AI-first IELTS preparation — realistic mocks, instant scoring, and
              feedback loops built for Telugu-speaking students aiming global.
            </p>
            <div className="mt-6 flex gap-2">
              <SocialIcon href="https://x.com" label="X (Twitter)">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="https://www.linkedin.com" label="LinkedIn">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="https://www.youtube.com" label="YouTube">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </SocialIcon>
            </div>
          </div>
          <FooterColumn title="Product" links={product} />
          <FooterColumn title="Company" links={company} />
          <div>
            <p className="text-meta font-semibold uppercase tracking-wider text-white/45">
              Legal
            </p>
            <ul className="mt-4 space-y-2.5">
              {legal.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="cursor-pointer text-body text-white/70 transition-colors duration-200 hover:text-teal-light"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-center text-meta text-white/45 sm:text-left">
            © {new Date().getFullYear()} MATA Labs OPC. All rights reserved.
          </p>
          <p className="text-meta text-white/40">
            AI-first products for learning.
          </p>
        </div>
      </div>
    </footer>
  );
}
