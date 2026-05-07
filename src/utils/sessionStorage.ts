/**
 * Session storage utilities for temporary data persistence
 */

import { logger } from "@/utils/logger";

/**
 * Save a value to sessionStorage
 * @param key - The storage key
 * @param value - The value to store (string or object)
 */
export function saveToSessionStorage(
  key: string,
  value: string | object,
): void {
  try {
    const stringValue =
      typeof value === "string" ? value : JSON.stringify(value);
    sessionStorage.setItem(key, stringValue);
  } catch (error) {
    if (error instanceof Error) {
      logger.warn("[Session Storage] Error saving:", error.message);
    }
  }
}

/**
 * Get a string value from sessionStorage
 * @param key - The storage key
 * @param defaultValue - The default value if key not found
 * @returns The stored value or default value
 */
export function getFromSessionStorage(key: string, defaultValue = ""): string {
  try {
    return sessionStorage.getItem(key) ?? defaultValue;
  } catch (error) {
    if (error instanceof Error) {
      logger.warn("[Session Storage] Error reading:", error.message);
    }
    return defaultValue;
  }
}

/**
 * Get a parsed JSON value from sessionStorage
 * @param key - The storage key
 * @param defaultValue - The default value if key not found
 * @returns The parsed value or default value
 */
export function getJsonFromSessionStorage<T>(
  key: string,
  defaultValue: T | null = null,
): T | null {
  try {
    const item = sessionStorage.getItem(key);
    if (!item) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    if (error instanceof Error) {
      logger.warn("[Session Storage] Error parsing JSON:", error.message);
    }
    return defaultValue;
  }
}

