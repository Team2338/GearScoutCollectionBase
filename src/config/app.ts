const DEFAULT_CURRENT_GAME_YEAR = 2026;
const DEFAULT_APP_VERSION = "dev";
const DEFAULT_EVENT_CODE_EXAMPLE = "currentEvent";

/**
 * Central place for season-specific values that should be easy to swap each year.
 */
export const APP_CONFIG = {
  CURRENT_GAME_YEAR: Number(
    import.meta.env.VITE_CURRENT_GAME_YEAR ?? DEFAULT_CURRENT_GAME_YEAR,
  ) || DEFAULT_CURRENT_GAME_YEAR,
  APP_VERSION_FALLBACK: import.meta.env.VITE_APP_VERSION ?? DEFAULT_APP_VERSION,
  EVENT_CODE_EXAMPLE:
    import.meta.env.VITE_EVENT_CODE_EXAMPLE ?? DEFAULT_EVENT_CODE_EXAMPLE,
} as const;
