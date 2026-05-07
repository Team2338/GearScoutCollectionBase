export interface IUser {
  teamNumber: string;
  scouterName: string;
  secretCode: string;
  eventCode: string;
}

/**
 * Confirms that a loaded value really has the fields the app needs from a user session.
 */
export function isValidUser(data: unknown): data is IUser {
  return (
    typeof data === "object" &&
    data !== null &&
    "teamNumber" in data &&
    "scouterName" in data &&
    "secretCode" in data &&
    "eventCode" in data &&
    typeof (data as IUser).teamNumber === "string" &&
    typeof (data as IUser).scouterName === "string" &&
    typeof (data as IUser).secretCode === "string" &&
    typeof (data as IUser).eventCode === "string"
  );
}

export interface IMatch {
  gameYear: number;
  eventCode: string;
  matchNumber: string;
  robotNumber: string;
  creator: string;
  allianceColor: AllianceColor;
  objectives: IObjective[];
  // Timestamp when this match was submitted (ms since epoch). Optional when not available.
  submittedAt?: number;
}

/**
 * One scored action recorded during a match, grouped by game mode.
 */
export interface IObjective {
  gamemode: Gamemode;
  objective: string;
  count: number;
}

/**
 * A single schedule row that maps the six robots to one match.
 */
export interface IMatchLineup {
  matchNumber: number;
  red1: number;
  red2: number;
  red3: number;
  blue1: number;
  blue2: number;
  blue3: number;
}

export enum AllianceColor {
  RED = "RED",
  BLUE = "BLUE",
  UNKNOWN = "UNKNOWN",
}

export enum Gamemode {
  AUTO = "AUTO",
  TELEOP = "TELEOP",
}

/**
 * Offline queue bundle stored per scouter so pending submissions can be retried later.
 */
export interface IMultiMatchStorage {
  scouterName: string;
  teamNumber: string;
  eventCode: string;
  matches: IStoredMatch[];
}

/**
 * The persisted shape for one submitted match, including retry metadata.
 */
export interface IStoredMatch {
  matchNumber: number;
  robotNumber: string;
  allianceColor: AllianceColor;
  // The scored actions for this match, grouped by game mode.
  timestamp: number;
  submitted?: boolean;
}
