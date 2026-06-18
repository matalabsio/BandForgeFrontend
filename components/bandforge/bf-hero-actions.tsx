import { BfHeroStartCta } from "@/components/bandforge/bf-hero-start-cta";
import { getMarketingSessionUser } from "@/lib/marketing-auth-server";
import { isAuthEnabled } from "@/lib/flags";

const startClassName =
  "flex w-full items-center justify-center gap-2 rounded-full bg-cyan px-6 py-[17px] font-display text-[1.0625rem] font-semibold text-white no-underline shadow-[0_8px_20px_rgb(0_151_167/0.26)] transition-colors hover:bg-brand-sky-hover lg:inline-flex lg:w-auto lg:px-[30px] lg:py-[18px] lg:shadow-[0_10px_26px_rgb(0_151_167/0.26)]";

/** Hero CTAs — full-width on mobile, inline on desktop. */
export async function BfHeroActions() {
  const user = await getMarketingSessionUser();
  const initialAuthenticated = !isAuthEnabled() || Boolean(user);

  return (
    <div className="mt-[30px] lg:mt-9 lg:flex lg:flex-wrap lg:items-center lg:gap-[18px]">
      <BfHeroStartCta
        initialAuthenticated={initialAuthenticated}
        className={startClassName}
      />
      <p className="mt-3.5 text-[0.8125rem] text-muted-light lg:mt-0 lg:max-w-[18ch] lg:text-sm">
        No account needed to start. Results in 24 hours.
      </p>
    </div>
  );
}
