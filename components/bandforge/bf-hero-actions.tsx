import Link from "next/link";
import { BfHeroStartCta } from "@/components/bandforge/bf-hero-start-cta";
import { getMarketingSessionUser } from "@/lib/marketing-auth-server";
import { isAuthEnabled } from "@/lib/flags";

const startClassName =
  "inline-flex w-full min-w-[10rem] items-center justify-center rounded-full bg-white/90 px-6 py-2.5 text-center text-sm font-medium text-[#1E1E2E] shadow-[0_4px_20px_rgba(30,30,46,0.08)] ring-1 ring-[#1E1E2E]/10 backdrop-blur-sm transition-[color,box-shadow,transform] hover:bg-white hover:shadow-[0_6px_24px_rgba(30,30,46,0.12)] sm:w-auto";

/** Hero CTAs — signed-in users go to dashboard; others go to login. */
export async function BfHeroActions() {
  const user = await getMarketingSessionUser();
  const initialAuthenticated = !isAuthEnabled() || Boolean(user);

  return (
    <div className="flex w-full max-w-md flex-col items-center justify-center gap-3 sm:max-w-none sm:flex-row sm:gap-4">
      <BfHeroStartCta
        initialAuthenticated={initialAuthenticated}
        className={startClassName}
      />
      <Link
        href="/demo"
        prefetch
        className="inline-flex w-full min-w-[10rem] items-center justify-center rounded-full bg-[#1E1E2E] px-6 py-2.5 text-center text-sm font-medium text-white shadow-[0_4px_20px_rgba(30,30,46,0.22)] transition-[color,box-shadow,transform] hover:bg-[#14141f] hover:shadow-[0_6px_24px_rgba(30,30,46,0.28)] sm:w-auto"
      >
        View Demo
      </Link>
    </div>
  );
}
