import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { mockTestNumberPath } from "@/lib/mock-catalog";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { number } = await params;
  return {
    title: `Test ${number} · BandForge`,
    robots: { index: false, follow: false },
  };
}

type Props = {
  params: Promise<{ number: string }>;
  searchParams: Promise<{ mock_attempt?: string }>;
};

/** Legacy `/test/[number]` → canonical `/test?test=N`. */
export default async function TestNumberRedirectPage({ params, searchParams }: Props) {
  const { number: numberRaw } = await params;
  const sp = await searchParams;
  const number = Number.parseInt(numberRaw, 10);

  if (!Number.isFinite(number) || number < 1) {
    notFound();
  }

  redirect(mockTestNumberPath(number, sp.mock_attempt ?? undefined));
}
