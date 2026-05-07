/**
 * Schedule management service
 */

import type { IMatchLineup } from "@/model/Models";
import gearscoutService from "@/services/gearscout-services";
import { showError } from "@/utils/notifications";
import { debounce } from "@/utils/debounce";
import { logger } from "@/utils/logger";
import { TIMING, API } from "@/constants";

// Constants
const SCHEDULE_FETCH_DEBOUNCE_MS = TIMING.SCHEDULE_FETCH_DEBOUNCE;
const CURRENT_GAME_YEAR = API.CURRENT_GAME_YEAR;

// Schedule state
let schedule: IMatchLineup[] | null = null;
let scheduleIsLoading = false;
let currentEventCode = "";
let scheduleCompletedCallback: (() => void) | null = null;

/**
 * Get current schedule
 * @returns The current schedule or null if not loaded
 */
export function getSchedule(): IMatchLineup[] | null {
  return schedule;
}

/**
 * Check if schedule is currently loading
 * @returns True if schedule is being fetched
 */
export function isScheduleLoading(): boolean {
  return scheduleIsLoading;
}

/**
 * Register callback to be called when schedule loading completes
 * @param callback - Function to call when schedule load completes
 */
export function onScheduleLoadComplete(callback: () => void): void {
  scheduleCompletedCallback = callback;
}

/**
 * Directly set the schedule (useful for pre-loaded data)
 * @param scheduleData - The schedule data to set
 * @param eventCode - The event code for this schedule
 */
export function setSchedule(
  scheduleData: IMatchLineup[],
  eventCode: string,
): void {
  schedule = scheduleData;
  currentEventCode = eventCode;
}

/**
 * Clear the cached schedule
 */
export function clearSchedule(): void {
  schedule = null;
  currentEventCode = "";
}

/**
 * Fetch schedule from API (internal implementation)
 * @param eventCode - The event code to fetch schedule for
 */
async function fetchScheduleInternal(eventCode: string): Promise<void> {
  if (!eventCode || eventCode.trim() === "") {
    schedule = null;
    return;
  }

  // Already have this schedule
  if (currentEventCode === eventCode && schedule !== null) {
    return;
  }

  scheduleIsLoading = true;

  try {
    const response = await gearscoutService.getEventSchedule(
      CURRENT_GAME_YEAR,
      eventCode,
    );
    schedule = response.data;
    currentEventCode = eventCode;
  } catch (error) {
    if (error instanceof Error) {
      logger.warn(
        "[Schedule Service] Failed to fetch schedule:",
        error.message,
      );
    }
    schedule = null;
    currentEventCode = "";
    showError("Failed to load event schedule. Manual team entry will be used.");
  } finally {
    scheduleIsLoading = false;
    // Notify listeners that schedule loading is complete
    if (scheduleCompletedCallback) {
      scheduleCompletedCallback();
    }
  }
}

/**
 * Fetch schedule from API with debouncing
 * @param eventCode - The event code to fetch schedule for
 */
export const fetchSchedule = debounce(
  fetchScheduleInternal,
  SCHEDULE_FETCH_DEBOUNCE_MS,
);

