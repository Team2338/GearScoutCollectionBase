import { useState, useEffect, useCallback } from "react";
import { isValidUser } from "@/model/Models";
import {
  getPendingMatches,
  submitAllPendingMatches,
} from "@/services/matchStorage";
import { TIMING, STORAGE_KEYS } from "@/constants";
import { logger } from "@/utils/logger";

interface UsePendingMatchesReturn {
  pendingCount: number;
  isRetrying: boolean;
  handleRetry: () => Promise<void>;
}

/**
 * Keeps the pending submission count in sync and retries queued matches on demand.
 */
export function usePendingMatches(): UsePendingMatchesReturn {
  const [pendingCount, setPendingCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = useCallback(async () => {
    const userDataStr = sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!userDataStr) {
      return;
    }

    setIsRetrying(true);

    try {
      // Retry only works when we have a valid authenticated user object.
      const parsed = JSON.parse(userDataStr);
      if (!isValidUser(parsed)) {
        logger.error("[Pending Matches] Invalid user data");
        return;
      }
      await submitAllPendingMatches(parsed);

      const pending = getPendingMatches(parsed);
      setPendingCount(pending.length);
    } catch (error) {
      logger.error("Error retrying submission:", error);
    } finally {
      setIsRetrying(false);
    }
  }, []);

  useEffect(() => {
    // Polling keeps the badge fresh after offline saves or successful retries.
    const update = () => {
      const userDataStr = sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (!userDataStr) {
        return;
      }

      try {
        const parsed = JSON.parse(userDataStr);
        if (!isValidUser(parsed)) {
          logger.warn("[Pending Matches] Invalid user data");
          return;
        }
        const pending = getPendingMatches(parsed);
        setPendingCount(pending.length);
      } catch (error) {
        if (error instanceof Error) {
          logger.warn("[Pending Matches] Error reading:", error.message);
        }
      }
    };

    update();
    const interval = setInterval(
      update,
      TIMING.PENDING_MATCHES_UPDATE_INTERVAL,
    );
    // When the browser regains connectivity, attempt an automatic retry
    const handleOnline = async () => {
      try {
        const userDataStr = sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        if (!userDataStr) return;
        const parsed = JSON.parse(userDataStr);
        if (!isValidUser(parsed)) return;
        // Only attempt if there are pending matches
        const pending = getPendingMatches(parsed);
        if (pending.length > 0) {
          setIsRetrying(true);
          await submitAllPendingMatches(parsed);
          const newPending = getPendingMatches(parsed);
          setPendingCount(newPending.length);
        }
      } catch (err) {
        logger.warn("Auto-retry on online failed:", err);
      } finally {
        setIsRetrying(false);
      }
    };
    window.addEventListener("online", handleOnline);
    return () => clearInterval(interval);
  }, []);

  return {
    pendingCount,
    isRetrying,
    handleRetry,
  };
}
