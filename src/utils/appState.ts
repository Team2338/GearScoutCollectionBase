import { STORAGE_KEYS } from "@/constants";
import { clearFormDataFromLocalStorage } from "@/utils/localStorage";

const SESSION_STORAGE_KEYS = [
  STORAGE_KEYS.CURRENT_USER,
  STORAGE_KEYS.SECRET_CODE,
  STORAGE_KEYS.TBA_CODE,
  STORAGE_KEYS.SCHEDULE,
] as const;

const LOCAL_STORAGE_KEYS = [
  STORAGE_KEYS.TEAM_NUMBER,
  STORAGE_KEYS.SCOUTER_NAME,
  STORAGE_KEYS.EVENT_CODE,
  STORAGE_KEYS.MULTI_MATCH_DATA,
] as const;

/**
 * Removes app-specific state from storage so the next session starts clean.
 */
export function resetAppState(): void {
  clearFormDataFromLocalStorage();

  SESSION_STORAGE_KEYS.forEach((key) => sessionStorage.removeItem(key));
  LOCAL_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}
