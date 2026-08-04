import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/** Calendar lives under Full Plan at `/study-plan`. */
export default function StudyPlanCalendarRedirect() {
  redirect("/study-plan");
}
