import type { IUser } from "@/model/Models";
import { AllianceColor, isValidUser } from "@/model/Models";
import { showError, showSuccess } from "@/utils/notifications";
import { showValidationError, clearValidationError } from "@/utils/validation";
import {
  saveToLocalStorage,
  getFromLocalStorage,
  clearFormDataFromLocalStorage,
} from "@/utils/localStorage";
import { getFromSessionStorage } from "@/utils/sessionStorage";
import { getJsonFromSessionStorage } from "@/utils/sessionStorage";
import {
  saveMatchToStorage,
  submitAllPendingMatches,
  cleanInvalidMatches,
} from "@/services/matchStorage";
import { logger } from "@/utils/logger";
import {
  fetchSchedule,
  getSchedule,
  isScheduleLoading,
  onScheduleLoadComplete,
  setSchedule,
  clearSchedule,
} from "@/services/scheduleService";
import { TIMING, STORAGE_KEYS } from "@/constants";

const SCHEDULE_LOAD_DELAY_MS = TIMING.SCHEDULE_LOAD_DELAY;
const AUTH_ERROR_REDIRECT_DELAY_MS = TIMING.AUTH_ERROR_REDIRECT_DELAY;

// The page switches between loading, manual entry, and schedule-driven entry.
function updateTeamNumberUI(): void {
  const loader = document.getElementById("schedule-loader");
  const dropdownContainer = document.getElementById(
    "team-number-dropdown-container",
  );
  const manualContainer = document.getElementById(
    "team-number-manual-container",
  );
  const allianceSection = document.getElementById("alliance-section");
  const matchNumberInput = document.getElementById(
    "match-number",
  ) as HTMLInputElement;
  const dropdown = document.getElementById(
    "team-number-dropdown",
  ) as HTMLSelectElement;

  if (
    !loader ||
    !dropdownContainer ||
    !manualContainer ||
    !allianceSection ||
    !dropdown
  )
    return;

  const schedule = getSchedule();

  if (schedule === null && isScheduleLoading()) {
    loader.classList.remove("hidden");
    dropdownContainer.classList.add("hidden");
    manualContainer.classList.add("hidden");
    allianceSection.classList.add("hidden");
    return;
  }

  const matchNumber = matchNumberInput?.value;

  if (schedule === null) {
    loader.classList.add("hidden");
    dropdownContainer.classList.add("hidden");
    manualContainer.classList.remove("hidden");
    allianceSection.classList.remove("hidden");
    updateAllianceButtonsState(true);
    return;
  }

  // Keep the dropdown visible but disabled until a match number has been entered.
  if (!matchNumber || matchNumber.trim() === "") {
    loader.classList.add("hidden");
    dropdownContainer.classList.remove("hidden");
    manualContainer.classList.add("hidden");
    allianceSection.classList.remove("hidden");
    dropdown.disabled = true;
    dropdown.value = "";
    updateAllianceButtonsState(false);
    return;
  }

  // Match numbers are displayed as 1-based, but schedule arrays are 0-based.
  const matchIndex = parseInt(matchNumber) - 1;
  if (isNaN(matchIndex) || matchIndex < 0 || matchIndex >= schedule.length) {
    loader.classList.add("hidden");
    dropdownContainer.classList.add("hidden");
    manualContainer.classList.remove("hidden");
    allianceSection.classList.remove("hidden");
    updateAllianceButtonsState(true);
    return;
  }

  // A valid match number means the team can be selected from the loaded schedule.
  const restoredTeamNumber = populateTeamDropdown(matchIndex);
  dropdownContainer.classList.remove("hidden");
  manualContainer.classList.add("hidden");
  allianceSection.classList.remove("hidden");
  dropdown.disabled = false;
  if (restoredTeamNumber) {
    const dropdown = document.getElementById(
      "team-number-dropdown",
    ) as HTMLSelectElement;
    const selectedOption = dropdown?.options[dropdown?.selectedIndex];
    if (selectedOption?.dataset.alliance) {
      const allianceValue = selectedOption.dataset.alliance;
      saveToLocalStorage("allianceColor", allianceValue);
    }
  }
}

function updateAllianceButtonsState(isManualMode: boolean): void {
  const allianceButtons = document.querySelectorAll(".alliance-toggle");
  allianceButtons.forEach((button) => {
    (button as HTMLButtonElement).disabled = !isManualMode;
  });
}

// Build the dropdown options from the match schedule and mark each robot's alliance.
function populateTeamDropdown(matchIndex: number): string | null {
  const schedule = getSchedule();
  if (!schedule) return null;

  const dropdown = document.getElementById(
    "team-number-dropdown",
  ) as HTMLSelectElement;
  if (!dropdown) return null;

  const lineup = schedule[matchIndex];
  const redRobots = [lineup.red1, lineup.red2, lineup.red3].map(String);
  const blueRobots = [lineup.blue1, lineup.blue2, lineup.blue3].map(String);

  dropdown.innerHTML = '<option value="">Select Team</option>';

  // Add red alliance header
  const redHeader = document.createElement("option");
  redHeader.disabled = true;
  redHeader.textContent = "━━ Red Alliance ━━";
  redHeader.classList.add("alliance-header-red");
  dropdown.appendChild(redHeader);

  redRobots.forEach((robot) => {
    const option = document.createElement("option");
    option.value = robot;
    option.textContent = robot;
    option.dataset.alliance = "red";
    dropdown.appendChild(option);
  });

  // Add blue alliance header
  const blueHeader = document.createElement("option");
  blueHeader.disabled = true;
  blueHeader.textContent = "━━ Blue Alliance ━━";
  blueHeader.classList.add("alliance-header-blue");
  dropdown.appendChild(blueHeader);

  blueRobots.forEach((robot) => {
    const option = document.createElement("option");
    option.value = robot;
    option.textContent = robot;
    option.dataset.alliance = "blue";
    dropdown.appendChild(option);
  });

  const savedTeamNumber = getFromLocalStorage("scoutedTeamNumber");
  if (
    savedTeamNumber &&
    (redRobots.includes(savedTeamNumber) ||
      blueRobots.includes(savedTeamNumber))
  ) {
    dropdown.value = savedTeamNumber;
    return savedTeamNumber;
  }
  return null;
}

// The scored actions for this match, grouped by game mode.

export function initializeDataCollection(): (() => void) | void {
  logger.info("[Data Collection] Initializing...");

  const form = document.getElementById(
    "data-collection-form",
  ) as HTMLFormElement;
  if (!form) {
    logger.error("[Data Collection] Form element not found");
    return;
  }

  // Prevent double initialization (React Strict Mode runs effects twice)
  if (form.dataset.initialized === "true") {
    logger.info("[Data Collection] Already initialized, skipping...");
    return () => {
      form.dataset.initialized = "false";
    };
  }

  // The form is wired imperatively, so this flag prevents duplicate listeners in dev mode.
  form.dataset.initialized = "true";

  // Start every new scouting session from a clean state.

  const submitButton = document.querySelector(
  // If a cached schedule exists, reuse it so the dropdown is ready before network fetches finish.
    ".submit-button",
  ) as HTMLButtonElement;
  const matchNumberInput = document.getElementById(
    "match-number",
  ) as HTMLInputElement;
  const teamNumberInput = document.getElementById(
    "team-number",
  ) as HTMLInputElement;
  const teamNumberDropdown = document.getElementById(
    "team-number-dropdown",
  ) as HTMLSelectElement;
  // The scored actions for this match, grouped by game mode.

  // Verify critical elements exist
  if (!matchNumberInput || !teamNumberInput) {
    logger.error("[Data Collection] Critical form elements not found");
    return;
  }

  let selectedAlliance = "";
  let hasUserInteracted = false;

  // The scored actions for this match, grouped by game mode.

  const userDataStr = sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!userDataStr) {
    showError("User data not found. Redirecting to login...");
    setTimeout(() => {
      window.location.href = "/";
    }, AUTH_ERROR_REDIRECT_DELAY_MS);
    return;
  }

  let userData: IUser;
  try {
    const parsed = JSON.parse(userDataStr);
    if (!isValidUser(parsed)) {
      throw new Error("Invalid user data format");
    }
    userData = parsed;
  } catch (error) {
    showError("Invalid user data. Redirecting to login...");
    setTimeout(() => {
      window.location.href = "/";
    }, AUTH_ERROR_REDIRECT_DELAY_MS);
    return;
  }

  cleanInvalidMatches(userData);

  // Initialize schedule from cache or fetch if needed
  const tbaCode = getFromSessionStorage(STORAGE_KEYS.TBA_CODE);
  if (tbaCode) {
    const cachedSchedule = getJsonFromSessionStorage<any[]>(
      STORAGE_KEYS.SCHEDULE,
    );
    if (
      cachedSchedule &&
      Array.isArray(cachedSchedule) &&
      cachedSchedule.length > 0
    ) {
      setSchedule(cachedSchedule, tbaCode);
      setTimeout(() => updateTeamNumberUI(), 50);
    } else {
      fetchSchedule(tbaCode);
      onScheduleLoadComplete(() => updateTeamNumberUI());
      setTimeout(() => updateTeamNumberUI(), SCHEDULE_LOAD_DELAY_MS);
    }
  } else {
    clearSchedule();
    setTimeout(() => updateTeamNumberUI(), 50);
  }

  function validateForm(showErrors = true): boolean {
    let isValid = true;

    clearValidationError("match-number");
    clearValidationError("team-number");
    clearValidationError("team-number-dropdown");

    const allianceSection = document.getElementById("alliance-section");
    if (allianceSection) {
      allianceSection.querySelector(".field-error")?.remove();
      allianceSection.classList.remove("has-error");
    }

    const hasMatchNumber =
      matchNumberInput && matchNumberInput.value.trim() !== "";
    if (!hasMatchNumber) {
      if (showErrors) {
        showValidationError("match-number", "Match number is required");
      }
      isValid = false;
    }

    const isDropdownMode =
      teamNumberDropdown &&
      !teamNumberDropdown.parentElement?.classList.contains("hidden");
    const hasTeamNumber = isDropdownMode
      ? teamNumberDropdown.value.trim() !== ""
      : teamNumberInput && teamNumberInput.value.trim() !== "";

    if (!hasTeamNumber) {
      if (showErrors) {
        const fieldId = isDropdownMode ? "team-number-dropdown" : "team-number";
        showValidationError(fieldId, "Team number is required");
      }
      isValid = false;
    }

    const hasAlliance = selectedAlliance !== "";

    if (!hasAlliance) {
      isValid = false;
    }

    if (submitButton) {
      submitButton.disabled = !isValid || !hasUserInteracted;
    }

    return isValid;
  }

  // Initialize submit button as disabled
  if (submitButton) {
    submitButton.disabled = true;
  }

  const formFields = document.querySelectorAll(".form-field");
  formFields.forEach((field) => {
    const input = field.querySelector("input");
    const select = field.querySelector("select");
    const inputElement = input || select;
    if (!inputElement) return;

    if (inputElement.value) {
      field.classList.add("has-value");
    }

    inputElement.addEventListener("input", () => {
      if (inputElement.value) {
        field.classList.add("has-value");
      } else {
        field.classList.remove("has-value");
      }
    });

    inputElement.addEventListener("change", () => {
      if (inputElement.value) {
        field.classList.add("has-value");
      } else {
        field.classList.remove("has-value");
      }
    });

    inputElement.addEventListener("blur", () => {
      if (!inputElement.value) {
        field.classList.remove("has-value");
      }
    });
  });

  if (teamNumberDropdown) {
    teamNumberDropdown.addEventListener("change", () => {
      if (isResetting) return;
      hasUserInteracted = true;
      const selectedOption =
        teamNumberDropdown.options[teamNumberDropdown.selectedIndex];
      const teamNumber = teamNumberDropdown.value;

      clearValidationError("team-number-dropdown");

      if (teamNumber && selectedOption?.dataset.alliance) {
        selectedAlliance = selectedOption.dataset.alliance;
        saveToLocalStorage("scoutedTeamNumber", teamNumber);
        saveToLocalStorage("allianceColor", selectedAlliance);

        allianceButtons.forEach((btn) => {
          if (btn.getAttribute("data-value") === selectedAlliance) {
            btn.classList.add("selected");
            btn.setAttribute("aria-checked", "true");
          } else {
            btn.classList.remove("selected");
            btn.setAttribute("aria-checked", "false");
          }
        });
        updateAllianceButtonsState(false);
      } else {
        selectedAlliance = "";
      }

      validateForm(false);
    });
  }

  if (matchNumberInput) {
    const savedMatchNumber = getFromLocalStorage("matchNumber");
    if (savedMatchNumber) {
      matchNumberInput.value = savedMatchNumber;
      updateTeamNumberUI();
    }
    matchNumberInput.addEventListener("input", () => {
      if (isResetting) return;
      hasUserInteracted = true;
      saveToLocalStorage("matchNumber", matchNumberInput.value);
      clearValidationError("match-number");
      updateTeamNumberUI();
      validateForm(false);
    });
  }

  if (teamNumberInput) {
    const savedTeamNumber = getFromLocalStorage("scoutedTeamNumber");
    if (savedTeamNumber) {
      teamNumberInput.value = savedTeamNumber;
    }
    teamNumberInput.addEventListener("input", () => {
      if (isResetting) return;
      hasUserInteracted = true;
      saveToLocalStorage("scoutedTeamNumber", teamNumberInput.value);
      clearValidationError("team-number");
      // Enable alliance buttons in manual mode
      updateAllianceButtonsState(true);
      validateForm(false);
    });
  }

  // Load saved alliance color
  const savedAlliance = getFromLocalStorage("allianceColor");
  if (savedAlliance) {
    selectedAlliance = savedAlliance;
  }

  // Alliance color toggle functionality
  const allianceButtons = document.querySelectorAll(".alliance-toggle");
  if (savedAlliance) {
    allianceButtons.forEach((btn) => {
      if (btn.getAttribute("data-value") === savedAlliance) {
        btn.classList.add("selected");
        btn.setAttribute("aria-checked", "true");
      } else {
        btn.setAttribute("aria-checked", "false");
      }
    });
  }

  allianceButtons.forEach((button) => {
    // Ensure keyboard activation also works for custom buttons
    button.addEventListener("keydown", (ev) => {
      const kev = ev as KeyboardEvent;
      if (kev.key === "Enter" || kev.key === " ") {
        kev.preventDefault();
        (button as HTMLButtonElement).click();
      }
    });

    button.addEventListener("click", () => {
      if (isResetting) return;
      hasUserInteracted = true;
      // Remove selected class and update ARIA from all buttons
      allianceButtons.forEach((btn) => {
        btn.classList.remove("selected");
        btn.setAttribute("aria-checked", "false");
      });

      // Add selected class and update ARIA to clicked button
      button.classList.add("selected");
      button.setAttribute("aria-checked", "true");
      const dataValue = button.getAttribute("data-value");
      selectedAlliance = dataValue ?? "";

      // Save to localStorage
      saveToLocalStorage("allianceColor", selectedAlliance);

      // Validate form after alliance selection
      validateForm(false);
    });
  });

  // The scored actions for this match, grouped by game mode.

  // Check if form is pre-filled with valid data on initialization
  // If all required fields have values, enable the submit button
  const hasPrefilledMatch =
    matchNumberInput && matchNumberInput.value.trim() !== "";

  // Check team number based on which mode is active
  const isDropdownMode =
    teamNumberDropdown &&
    !teamNumberDropdown.parentElement?.classList.contains("hidden");
  const hasPrefilledTeam = isDropdownMode
    ? teamNumberDropdown && teamNumberDropdown.value.trim() !== ""
    : teamNumberInput && teamNumberInput.value.trim() !== "";

  const hasPrefilledAlliance = selectedAlliance !== "";

  if (hasPrefilledMatch && hasPrefilledTeam && hasPrefilledAlliance) {
    hasUserInteracted = true;
    validateForm(false); // Validate without showing errors
  }

  // Submission state guard
  let isSubmitting = false;
  let isResetting = false;

  // Setup keyboard navigation for alliance and toggle groups
  const cleanupKeyboardNavFns: Array<() => void> = [];
  // dynamic import keyboard utilities to avoid bundler circular deps
  import("@/utils/keyboardNav")
    .then(({ setupKeyboardNavigation, makeKeyboardAccessible }) => {
      cleanupKeyboardNavFns.push(
        setupKeyboardNavigation(".toggle-button-group", ".toggle-button"),
      );
      cleanupKeyboardNavFns.push(
        setupKeyboardNavigation(".toggle-button-group", ".toggle-button-teleop"),
      );
      allianceButtons.forEach((btn) =>
        makeKeyboardAccessible(btn as HTMLElement),
      );
    })
    .catch(() => {
      /* optional: keyboard utilities not available */
    });

  // Function to reset form state
  function resetFormState() {
    // Set resetting flag first to prevent any event handlers from triggering validation
    isResetting = true;
    hasUserInteracted = false;

    // Clear current form state including cycles
    clearFormDataFromLocalStorage();
    localStorage.removeItem("cycles");
    localStorage.removeItem("autoCycles");

    // Reset form UI
    form.reset();

    // Clear validation errors immediately after resetting form
    clearValidationError("match-number");
    clearValidationError("team-number");
    clearValidationError("team-number-dropdown");
    const allianceSection = document.getElementById("alliance-section");
    if (allianceSection) {
      allianceSection.querySelector(".field-error")?.remove();
      allianceSection.classList.remove("has-error");
    }

    // The scored actions for this match, grouped by game mode.

    allianceButtons.forEach((btn) => btn.classList.remove("selected"));
    selectedAlliance = "";

    // The scored actions for this match, grouped by game mode.

    formFields.forEach((field) => field.classList.remove("has-value"));

    // Update button state without showing errors
    validateForm(false);

    // Regray the team number dropdown after reset
    updateTeamNumberUI();

    // Clear resetting flag at the very end
    setTimeout(() => {
      isResetting = false;
    }, 0);
  }

  // Form submit handler
  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      // Prevent concurrent submissions
      if (isSubmitting) {
        return;
      }

      if (!validateForm(false)) {
        return;
      }

      // Mark as submitting and disable submit button
      isSubmitting = true;

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";
      }

      try {
        const isDropdownMode =
          teamNumberDropdown &&
          !teamNumberDropdown.parentElement?.classList.contains("hidden");
        const robotNumber = isDropdownMode
          ? teamNumberDropdown.value
          : teamNumberInput?.value || "";
        const matchNumber = parseInt(matchNumberInput?.value || "0");

        // Validate match number
        if (matchNumber <= 0 || isNaN(matchNumber)) {
          showError("Invalid match number. Please enter a valid match number.");
          throw new Error("Invalid match number");
        }

        // Validate robot number
        if (!robotNumber || robotNumber.trim() === "") {
          showError("Invalid team number. Please enter a valid team number.");
          throw new Error("Invalid team number");
        }

        // Determine alliance color - get from dropdown if in dropdown mode
        let allianceColor: AllianceColor;
        if (isDropdownMode && teamNumberDropdown) {
          const selectedOption =
            teamNumberDropdown.options[teamNumberDropdown.selectedIndex];
          const alliance = selectedOption?.dataset.alliance;
          if (alliance === "red") {
            allianceColor = AllianceColor.RED;
          } else if (alliance === "blue") {
            allianceColor = AllianceColor.BLUE;
          } else {
            showError("Unable to determine alliance color. Please try again.");
            throw new Error("Invalid alliance color");
          }
        } else {
          // Manual mode - use selectedAlliance
          if (selectedAlliance === "red") {
            allianceColor = AllianceColor.RED;
          } else if (selectedAlliance === "blue") {
            allianceColor = AllianceColor.BLUE;
          } else {
            showError("Please select an alliance color.");
            throw new Error("Alliance color not selected");
          }
        }

        // Save match data to local storage first
        saveMatchToStorage(userData, {
          matchNumber,
          robotNumber,
          allianceColor,
        });

        showSuccess("Match data saved locally!");

        // Reset form state (clears localStorage and resets all UI)
        resetFormState();

        // Now try to submit all pending matches
        if (submitButton) {
          submitButton.textContent = "Submitting...";
        }

        await submitAllPendingMatches(userData);
      } catch (error) {
        if (error instanceof Error) {
          logger.warn(
            "[Data Collection] Error processing match data:",
            error.message,
          );
        }
        showError("Failed to save match data. Please try again.");
      } finally {
        isSubmitting = false;

        if (submitButton) {
          submitButton.textContent = "Submit";
          submitButton.disabled = true;
        }
      }
    });
  }

  // Return cleanup function
  return () => {
    form.dataset.initialized = "false";
    // remove keyboard nav handlers if present
    cleanupKeyboardNavFns.forEach((fn) => fn && fn());
  };
}
