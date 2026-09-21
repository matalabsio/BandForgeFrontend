import { EntitledRouteGate } from "@/components/bandforge/dashboard/entitled-route-gate";
import { ContentLibraryExperience } from "@/components/bandforge/study-plan/content-library-experience";
import { redirectIfUnauthenticated } from "@/lib/auth-guard-server";
import { fetchEntitlementGate } from "@/lib/entitled-route-server";
import { FULL_SKILL_PROGRAM_SLUG } from "@/lib/entitlement";
import {
  getCachedCookieHeader,
  getCachedServerSession,
} from "@/lib/server-cache";

export const dynamic = "force-dynamic";

export const metadata = { title: "Content Library · BandForge" };

export default async function ContentLibraryPage() {
  const cookieHeader = await getCachedCookieHeader();
  const user = await getCachedServerSession(cookieHeader);
  redirectIfUnauthenticated(user, "/content-library", cookieHeader);

  const { profile, subscription } = await fetchEntitlementGate(
    cookieHeader,
    user!.id,
  );

  return (
    <EntitledRouteGate
      learning={profile}
      subscription={subscription}
      paywallSlug={FULL_SKILL_PROGRAM_SLUG}
    >
      <ContentLibraryExperience />
    </EntitledRouteGate>
  );
}
