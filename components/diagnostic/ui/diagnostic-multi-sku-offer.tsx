"use client";

import { Check, Star } from "lucide-react";
import type { MultiSkuOfferView, SkuOfferCardModel } from "@/lib/diagnostic-sku-offer";
import { cn } from "@/lib/utils";

type Props = {
  offer: MultiSkuOfferView;
  onCheckout: (planSlug: string, wasPrimary: boolean) => void;
  checkoutDisabled?: boolean;
  checkoutLoading?: boolean;
};

/**
 * Multi-SKU diagnostic offer: highlighted primary + secondary / Coming soon cards.
 */
export function DiagnosticMultiSkuOffer({
  offer,
  onCheckout,
  checkoutDisabled = false,
  checkoutLoading = false,
}: Props) {
  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h3 className="font-display text-[18px] font-bold tracking-[-0.02em] text-[#0B1B33] sm:text-[20px]">
          Your recommended plan
        </h3>
        {offer.pendingNote ? (
          <p className="mt-1.5 text-[13px] leading-relaxed text-[#5A6B82]">
            {offer.pendingNote}
          </p>
        ) : null}
        {offer.fellBackFromInactive ? (
          <p className="mt-1.5 text-[12px] leading-relaxed text-[#8494AC]">
            Your top match isn&apos;t available to buy yet — here&apos;s the best
            active program for your gaps.
          </p>
        ) : null}
      </div>

      <PrimaryOfferCard
        card={offer.primary}
        reason={offer.reason}
        onCheckout={onCheckout}
        checkoutDisabled={checkoutDisabled}
        checkoutLoading={checkoutLoading}
      />

      <div>
        <h4 className="mb-3 text-[13px] font-semibold tracking-wide text-[#5A6B82] uppercase">
          Other programs
        </h4>
        <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-3 sm:gap-3.5 sm:overflow-visible [&::-webkit-scrollbar]:hidden">
          {offer.secondary.map((card) => (
            <SecondaryOfferCard
              key={card.slug}
              card={card}
              onCheckout={onCheckout}
              checkoutDisabled={checkoutDisabled}
              checkoutLoading={checkoutLoading}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PrimaryOfferCard({
  card,
  reason,
  onCheckout,
  checkoutDisabled,
  checkoutLoading,
}: {
  card: SkuOfferCardModel;
  reason: string;
  onCheckout: (planSlug: string, wasPrimary: boolean) => void;
  checkoutDisabled: boolean;
  checkoutLoading: boolean;
}) {
  const canBuy = card.isActive && !card.comingSoon;

  return (
    <article className="relative min-w-0 overflow-visible rounded-[18px] border-[1.5px] border-cyan bg-[#0B1B33] p-5 shadow-[0_0_0_4px_rgba(0,188,212,0.12),0_16px_40px_rgba(13,31,60,0.28)] sm:p-8">
      <span className="absolute -top-3.5 right-4 z-10 inline-flex max-w-[calc(100%-2rem)] items-center gap-1.5 truncate rounded-full bg-cyan px-3.5 py-1.5 text-[11px] font-bold text-[#06222B] sm:right-6 sm:text-[13px]">
        <Star className="size-3 fill-[#06222B] text-[#06222B]" />
        Recommended for you
      </span>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
        <div className="min-w-0">
          <h3 className="font-display text-[22px] font-bold text-white sm:text-2xl">
            {card.name}
          </h3>
          <p className="mt-1 text-[13px] text-[#B8C2D6] sm:text-[14px]">
            {card.subtitle}
          </p>
          <p className="mt-3 text-[13px] leading-snug font-medium text-[#2FB8C6] sm:text-[14px]">
            {reason}
          </p>
          <div className="mt-4 flex flex-wrap items-baseline gap-2">
            <span className="font-mono text-[36px] leading-none font-bold tracking-[-0.02em] text-white sm:text-[42px]">
              {card.priceLabel}
            </span>
            <span className="text-[13px] text-[#8494AC] sm:text-[14px]">
              {card.priceNote}
            </span>
          </div>
          {card.comingSoon ? (
            <p className="mt-4 inline-flex rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-[12px] font-semibold text-[#B8C2D6]">
              Coming soon
            </p>
          ) : (
            <button
              type="button"
              onClick={() => onCheckout(card.slug, true)}
              disabled={checkoutDisabled || checkoutLoading || !canBuy}
              className={cn(
                "mt-5 inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#2FB8C6] px-5 text-[15px] font-bold text-[#0B1B33] transition-colors duration-200 hover:bg-[#3ec4d1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50 disabled:pointer-events-none disabled:opacity-60 sm:h-[52px] sm:text-[17px]",
              )}
            >
              {checkoutLoading ? "Processing…" : `${card.cta} →`}
            </button>
          )}
        </div>

        <ul className="min-w-0 list-none space-y-3.5 sm:space-y-4">
          {card.features.slice(0, 4).map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2.5 text-[13px] leading-snug text-white sm:text-[15px]"
            >
              <Check
                className="mt-0.5 size-4 shrink-0 text-[#2FB8C6]"
                strokeWidth={2.6}
              />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function SecondaryOfferCard({
  card,
  onCheckout,
  checkoutDisabled,
  checkoutLoading,
}: {
  card: SkuOfferCardModel;
  onCheckout: (planSlug: string, wasPrimary: boolean) => void;
  checkoutDisabled: boolean;
  checkoutLoading: boolean;
}) {
  return (
    <article className="flex w-[min(280px,85vw)] shrink-0 flex-col rounded-[16px] border border-navy/10 bg-[#F4F7FA] p-4 sm:w-auto sm:min-w-0">
      <div className="font-display text-[16px] font-bold text-navy">{card.name}</div>
      <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-[#6E83A0]">
        {card.subtitle}
      </p>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="font-mono text-[22px] font-medium text-teal">
          {card.priceLabel}
        </span>
        <span className="text-[11px] text-[#6E83A0]">{card.priceNote}</span>
      </div>
      <ul className="mt-3 mb-4 flex flex-1 flex-col gap-1.5">
        {card.features.slice(0, 2).map((f) => (
          <li key={f} className="flex items-start gap-1.5 text-[12px] text-[#3D4D63]">
            <Check className="mt-0.5 size-3.5 shrink-0 text-cyan" strokeWidth={2.6} />
            <span className="line-clamp-2">{f}</span>
          </li>
        ))}
      </ul>
      {card.comingSoon ? (
        <span className="inline-flex h-11 items-center justify-center rounded-xl border border-dashed border-navy/20 text-[13px] font-semibold text-[#6E83A0]">
          Coming soon
        </span>
      ) : (
        <button
          type="button"
          onClick={() => onCheckout(card.slug, false)}
          disabled={checkoutDisabled || checkoutLoading}
          className="flex h-11 w-full cursor-pointer items-center justify-center rounded-xl border-[1.5px] border-cyan/50 font-display text-[14px] font-semibold text-teal transition-colors hover:bg-cyan/5 disabled:pointer-events-none disabled:opacity-60"
        >
          {checkoutLoading ? "Processing…" : card.cta}
        </button>
      )}
    </article>
  );
}
