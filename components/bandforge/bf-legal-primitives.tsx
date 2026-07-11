import type { ReactNode } from "react";
import Link from "next/link";

type BfLegalSectionProps = {
  number: number;
  title: string;
  children: ReactNode;
  id?: string;
};

export function BfLegalSection({
  number,
  title,
  children,
  id,
}: BfLegalSectionProps) {
  return (
    <section
      id={id}
      className="border-t border-border-soft/70 pt-10 first:border-t-0 first:pt-0"
    >
      <div className="flex gap-4 sm:gap-5">
        <span
          aria-hidden
          className="mt-1 shrink-0 font-display text-meta font-semibold tabular-nums text-ink/25"
        >
          {String(number).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1 space-y-3">
          <h2 className="font-display text-[1.0625rem] font-semibold tracking-[-0.02em] text-navy sm:text-lg">
            {title}
          </h2>
          <div className="bf-legal-body space-y-3">{children}</div>
        </div>
      </div>
    </section>
  );
}

export function BfLegalP({ children }: { children: ReactNode }) {
  return (
    <p className="text-[0.9375rem] leading-[1.75] text-ink/75 sm:text-body">
      {children}
    </p>
  );
}

export function BfLegalList({ children }: { children: ReactNode }) {
  return <ul className="space-y-3">{children}</ul>;
}

export function BfLegalListItem({
  label,
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  return (
    <li className="flex gap-3 text-[0.9375rem] leading-[1.75] text-ink/75 sm:text-body">
      <span
        aria-hidden
        className="mt-[0.65rem] size-1.5 shrink-0 rounded-full bg-teal/45"
      />
      <span>
        {label ? (
          <>
            <span className="font-medium text-navy">{label}</span>
            {" — "}
          </>
        ) : null}
        {children}
      </span>
    </li>
  );
}

export function BfLegalCallout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-teal/12 bg-gradient-to-br from-teal/[0.05] via-white to-white px-6 py-5 sm:px-7 sm:py-6">
      <p className="text-meta font-semibold uppercase tracking-[0.14em] text-teal">
        {title}
      </p>
      <div className="bf-legal-body mt-3 space-y-3">{children}</div>
    </div>
  );
}

export function BfLegalLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      prefetch
      className="cursor-pointer font-medium text-teal underline decoration-teal/25 underline-offset-[3px] transition-colors duration-200 hover:text-teal-light hover:decoration-teal/50"
    >
      {children}
    </Link>
  );
}

export function BfLegalEmail({ email }: { email: string }) {
  return (
    <a
      href={`mailto:${email}`}
      className="cursor-pointer font-medium text-teal underline decoration-teal/25 underline-offset-[3px] transition-colors duration-200 hover:text-teal-light hover:decoration-teal/50"
    >
      {email}
    </a>
  );
}

type BfLegalContactCardProps = {
  name: string;
  designation: string;
  email: string;
  address: string;
  note?: string;
};

export function BfLegalContactCard({
  name,
  designation,
  email,
  address,
  note,
}: BfLegalContactCardProps) {
  return (
    <div className="rounded-xl border border-border-soft bg-surface-alt/60 px-5 py-4 sm:px-6 sm:py-5">
      <dl className="grid gap-x-6 gap-y-2 text-[0.9375rem] sm:grid-cols-[7rem_1fr]">
        <dt className="text-ink/45">Name</dt>
        <dd className="font-medium text-navy">{name}</dd>
        <dt className="text-ink/45">Role</dt>
        <dd className="text-ink/75">{designation}</dd>
        <dt className="text-ink/45">Email</dt>
        <dd>
          <BfLegalEmail email={email} />
        </dd>
        <dt className="text-ink/45">Address</dt>
        <dd className="text-ink/75">{address}</dd>
      </dl>
      {note ? (
        <p className="mt-4 border-t border-border-soft/70 pt-4 text-meta leading-relaxed text-ink/50">
          {note}
        </p>
      ) : null}
    </div>
  );
}
