import { cache } from "react";
import { getServerUser } from "@/lib/auth";
import { getCookieHeader } from "@/lib/cookies-server";
import {
  fetchDashboardPayload,
  fetchDashboardSummary,
} from "@/lib/dashboard-server";

export const getCachedCookieHeader = cache(getCookieHeader);

export const getCachedServerUser = cache((cookieHeader: string) =>
  getServerUser(cookieHeader),
);

export const getCachedDashboardPayload = cache((cookieHeader: string) =>
  fetchDashboardPayload(cookieHeader),
);

export const getCachedDashboardSummary = cache((cookieHeader: string) =>
  fetchDashboardSummary(cookieHeader),
);
