import axios from "axios";
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import type { IMatch, IMatchLineup, IUser } from "@/model/Models";
import { API, TIMING } from "@/constants";
import { logger } from "@/utils/logger";

const DEFAULT_API_BASE_URL = API.DEFAULT_BASE_URL;
const API_TIMEOUT_MS = TIMING.API_TIMEOUT;

type GearscoutResponse<T> = Promise<AxiosResponse<T>>;

// Normalizes unknown thrown values into Axios-specific error handling.
function isAxiosError(error: unknown): error is AxiosError {
  return axios.isAxiosError(error);
}

const resolveApiBaseUrl = (): string => {
  try {
    // Allow deployments to override the backend without changing source code.
    if (typeof import.meta !== "undefined" && import.meta.env) {
      const env = import.meta.env;
      const envBaseUrl =
        env.VITE_GEARSCOUT_API_BASE_URL || env.VITE_API_BASE_URL;

      if (typeof envBaseUrl === "string" && envBaseUrl.length > 0) {
        return envBaseUrl;
      }
    }
  } catch {
    return DEFAULT_API_BASE_URL;
  }

  return DEFAULT_API_BASE_URL;
};

class GearscoutService {
  private service: AxiosInstance = axios.create({
    baseURL: resolveApiBaseUrl(),
  });

  submitMatch = (user: IUser, match: IMatch): GearscoutResponse<void> => {
    // Authentication is sent as a custom header alongside the match payload.
    const url = `/v1/team/${user.teamNumber}`;
    const config: AxiosRequestConfig = {
      headers: {
        "Content-Type": "application/json",
        secretCode: user.secretCode,
      },
      timeout: API_TIMEOUT_MS,
    };

    return this.service.post(url, match, config).catch((error) => {
      if (isAxiosError(error)) {
        if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
          logger.error("[API] Request timeout - check your connection");
          throw new Error(
            "Request timeout. Please check your internet connection and try again.",
          );
        }
        if (error.response) {
          const status = error.response.status;
          logger.warn("[API] Response status:", status);

          if (status === 401) {
            throw new Error(
              "Authentication failed. Please check your secret code and try logging in again.",
            );
          } else if (status === 403) {
            throw new Error(
              "Access forbidden. Your team may not have permission to submit data.",
            );
          } else if (status === 404) {
            throw new Error("API endpoint not found. Please contact support.");
          } else if (status === 400) {
            throw new Error(
              "Invalid match data. Please check your entries and try again.",
            );
          } else if (status >= 500) {
            throw new Error("Server error. Please try again in a few moments.");
          }
        } else if (error.request) {
          logger.error("[API] No response received from server");
          throw new Error(
            "Cannot reach server. Please check your internet connection.",
          );
        }
      }

      if (error instanceof Error) {
        logger.warn("[API] Submit match failed:", error.message);
      }
      throw error;
    });
  };

  getEventSchedule = (
    gameYear: number,
    tbaCode: string,
  ): GearscoutResponse<IMatchLineup[]> => {
    // The schedule endpoint powers the match-number-driven dropdown on the scouting page.
    const url = `/v2/schedule/gameYear/${gameYear}/event/${tbaCode}`;
    const config: AxiosRequestConfig = {
      timeout: API_TIMEOUT_MS,
    };

    return this.service.get(url, config);
  };
}

const service = new GearscoutService();
export default service;

export { isAxiosError };
