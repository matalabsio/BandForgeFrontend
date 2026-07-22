import type { Metadata } from "next";
import { AboutExperience } from "@/components/bandforge/about/about-experience";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "About BandForge — IELTS Prep by MATA Labs",
  description:
    "BandForge is an online IELTS platform from MATA Labs in Hyderabad — free diagnostics and skill sprints for Telugu- and Urdu-speaking students in AP & TG.",
  path: "/about",
});

export default function AboutPage() {
  return <AboutExperience />;
}
