import { APP_CONFIG } from "@/config/app";

export const TIMING = {
  PENDING_MATCHES_UPDATE_INTERVAL: 5000,
  AUTH_ERROR_REDIRECT_DELAY: 2000,
  SCHEDULE_LOAD_DELAY: 600,
  SCHEDULE_FETCH_DEBOUNCE: 500,
  NOTIFICATION_DURATION_DEFAULT: 3000,
  NOTIFICATION_DURATION_ERROR: 5000,
  NOTIFICATION_FADE_OUT: 300,
  API_TIMEOUT: 10000,
} as const;

export const STORAGE_KEYS = {
  MULTI_MATCH_DATA: "multiMatchData",
  CURRENT_USER: "currentUser",
  TEAM_NUMBER: "teamNumber",
  SCOUTER_NAME: "scouterName",
  EVENT_CODE: "eventCode",
  SECRET_CODE: "secretCode",
  TBA_CODE: "tbaCode",
  SCHEDULE: "schedule",
} as const;

export const FORM_DATA_KEYS = [
  "matchNumber",
  "scoutedTeamNumber",
  "allianceColor",
  "leaveValue",
  "leftCounter",
  "rightCounter",
  "leftBumpCounter",
  "rightBumpCounter",
  "estimateSizeAuto",
  "leaveValueTeleop",
  "cycles",
  "estimateSize",
] as const;

export const API = {
  DEFAULT_BASE_URL: "https://gearitforward.com/api",
  CURRENT_GAME_YEAR: APP_CONFIG.CURRENT_GAME_YEAR,
} as const;

export const VALIDATION = {
  MAX_TEAM_NUMBER: 9999999,
  MIN_TEAM_NUMBER: 0,
  MAX_MATCH_NUMBER: 999,
  MIN_MATCH_NUMBER: 0,
  MAX_SCOUTER_NAME_LENGTH: 32,
  MAX_EVENT_CODE_LENGTH: 32,
  MAX_SECRET_CODE_LENGTH: 32,
  MAX_TBA_CODE_LENGTH: 6,
} as const;
