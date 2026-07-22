import Link from "next/link";
import { BfSectionHeading } from "@/components/bandforge/ui/bf-section-heading";
import { BfSeoLeadAnswer } from "@/components/seo/bf-seo-lead-answer";
import {
  DIAGNOSTIC_DURATION_MINUTES,
  HUMAN_REVIEW_SLA,
  SPRINT_ACCESS_DAYS,
  SPRINT_MOCK_COUNT,
  SPRINT_TASK_COUNT,
  formatPriceInr,
} from "@/lib/seo/claims";

type SprintLandingProps = {
  skill: "Writing" | "Speaking";
  priceInr: number;
  leadQuestion: string;
  leadAnswer: string;
  skillDetail: string;
};

export function SeoSprintLandingSections({
  skill,
  priceInr,
  leadQuestion,
  leadAnswer,
  skillDetail,
}: SprintLandingProps) {
  const steps = [
    {
      title: "Take the free diagnostic",
      body: `Know your real ${skill.toLowerCase()} band in ${DIAGNOSTIC_DURATION_MINUTES} minutes — free, no payment.`,
    },
    {
      title: `Complete your ${skill} sprint`,
      body: `${SPRINT_TASK_COUNT} focused tasks over ${SPRINT_ACCESS_DAYS} days with AI practice and human review ${HUMAN_REVIEW_SLA}.`,
    },
    {
      title: "Unlock your mock",
      body: `Finish all tasks to unlock ${SPRINT_MOCK_COUNT} full mock test and measure improvement.`,
    },
  ];

  const includes = [
    `${SPRINT_TASK_COUNT} ${skill.toLowerCase()} tasks over ${SPRINT_ACCESS_DAYS} days`,
    `Band 9-trained human review ${HUMAN_REVIEW_SLA}`,
    `${SPRINT_MOCK_COUNT} full mock unlocked on completion`,
    `Free ${DIAGNOSTIC_DURATION_MINUTES}-minute diagnostic included`,
    "Completion Guarantee — free extension if no improvement",
  ];

  return (
    <>
      <section className="bf-section bg-white/70">
        <div className="bf-container max-w-3xl">
          <BfSectionHeading as="h2">{leadQuestion}</BfSectionHeading>
          <div className="mt-4">
            <BfSeoLeadAnswer>{leadAnswer}</BfSeoLeadAnswer>
          </div>
          <p className="mt-4 text-base leading-relaxed text-ink/70">{skillDetail}</p>
        </div>
      </section>

      <section className="bf-section">
        <div className="bf-container">
          <BfSectionHeading as="h2">
            What you get for {formatPriceInr(priceInr)}
          </BfSectionHeading>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {includes.map((item) => (
              <li
                key={item}
                className="bf-min-card flex gap-3 p-4 text-sm leading-relaxed text-ink/75 sm:p-5 sm:text-base"
              >
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-teal" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bf-section bg-white/70">
        <div className="bf-container">
          <BfSectionHeading as="h2">How it works</BfSectionHeading>
          <ol className="mt-8 grid gap-5 sm:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title} className="bf-min-card p-5 sm:p-6">
                <p className="text-meta font-semibold text-cyan">Step {index + 1}</p>
                <h3 className="mt-2 font-display text-lg font-semibold text-navy">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/70 sm:text-base">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bf-section">
        <div className="bf-container max-w-3xl text-center">
          <BfSectionHeading as="h2">Need more than one skill?</BfSectionHeading>
          <p className="mt-4 text-base leading-relaxed text-ink/70">
            Dual Sprint covers Writing + Speaking from ₹1,799. All Skills Sprint covers
            all four sections from ₹2,999. The diagnostic stays free on every plan.
          </p>
          <Link
            href="/pricing"
            prefetch
            className="mt-6 inline-flex cursor-pointer items-center justify-center rounded-full border border-navy/15 bg-white px-6 py-3 text-sm font-semibold text-navy no-underline transition-colors hover:border-teal/40 hover:text-teal"
          >
            Compare all sprint plans
          </Link>
        </div>
      </section>
    </>
  );
}
