"use server";

import { revalidatePath } from "next/cache";
import { getCompetitiveProgrammingData } from "./index";
import { cpStore } from "./store";
import type { CompetitiveProgrammingData } from "./types";

export interface RefreshResult {
  success: boolean;
  cooldownActive: boolean;
  remainingMs?: number;
  data?: CompetitiveProgrammingData;
  error?: string;
}

const COOLDOWN_DURATION_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Server Action to trigger a Competitive Programming data refresh.
 * Enforces a shared 5-minute cooldown between all requests.
 */
export async function refreshCPData(): Promise<RefreshResult> {
  try {
    const cached = await cpStore.get();
    const now = Date.now();

    // 1. Check if the 5-minute cooldown is active
    if (cached) {
      const elapsed = now - cached.lastSuccessTimestamp;
      if (elapsed < COOLDOWN_DURATION_MS) {
        return {
          success: false,
          cooldownActive: true,
          remainingMs: COOLDOWN_DURATION_MS - elapsed,
          data: cached.data,
        };
      }
    }

    // 2. Fetch fresh data by bypassing the cache
    const freshData = await getCompetitiveProgrammingData(true);

    // 3. Determine if any platform failed
    const hasErrors = Object.keys(freshData.errors).length > 0;

    // 4. Save to cache
    // "If any platform fails due to a temporary network or API issue, do not update the cooldown timestamp."
    const lastSuccessTimestamp = cached
      ? cached.lastSuccessTimestamp
      : 0;
    
    const nextSuccessTimestamp = hasErrors ? lastSuccessTimestamp : now;

    await cpStore.set({
      lastSuccessTimestamp: nextSuccessTimestamp,
      data: freshData,
    });

    if (hasErrors) {
      return {
        success: false,
        cooldownActive: false,
        data: freshData,
        error: "Some platforms failed to refresh. Cooldown was not started.",
      };
    }

    revalidatePath("/competitive-programming");

    return {
      success: true,
      cooldownActive: false,
      data: freshData,
    };
  } catch (error) {
    console.error("Competitive programming refresh action failed:", error);
    return {
      success: false,
      cooldownActive: false,
      error: error instanceof Error ? error.message : "Unknown error occurred.",
    };
  }
}

/**
 * Simple helper to check the current cooldown status without triggering a refresh.
 */
export async function getCooldownStatus(): Promise<{
  cooldownActive: boolean;
  remainingMs: number;
}> {
  const cached = await cpStore.get();
  if (!cached) {
    return { cooldownActive: false, remainingMs: 0 };
  }
  const now = Date.now();
  const elapsed = now - cached.lastSuccessTimestamp;
  if (elapsed < COOLDOWN_DURATION_MS) {
    return {
      cooldownActive: true,
      remainingMs: COOLDOWN_DURATION_MS - elapsed,
    };
  }
  return { cooldownActive: false, remainingMs: 0 };
}
