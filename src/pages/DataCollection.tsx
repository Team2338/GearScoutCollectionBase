import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { initializeDataCollection } from "@/scripts/data-collection";
import { usePendingMatches } from "@/hooks/usePendingMatches";
import { PendingMatchesIndicator } from "@/components/PendingMatchesIndicator";
import { VALIDATION } from "@/constants";
import "@/styles/data-collection.scss";

const DataCollection = () => {
  const navigate = useNavigate();
  const { pendingCount, isRetrying, handleRetry } = usePendingMatches();

  useEffect(() => {
    // The data collection page uses imperative DOM logic, so we initialize it once on mount.
    const cleanup = initializeDataCollection();

    // Returning cleanup keeps React Strict Mode from leaving duplicate listeners behind.
    return cleanup;
  }, []);

  const handleBack = useCallback(() => {
    navigate("/");
  }, [navigate]);

  return (
    <>
      <div className="header">
        <PendingMatchesIndicator
          pendingCount={pendingCount}
          isRetrying={isRetrying}
          onRetry={handleRetry}
        />
        <div className="header-main">
          <div className="logo">
            <img
              src="/logos/192-pwa.png"
              alt="2338 logo"
              height={100}
              width={100}
              loading="eager"
            />
          </div>
          <div className="analytics">
            <a
              href="https://data.gearitforward.com/"
              className="analytics-button"
            >
              ANALYTICS
            </a>
          </div>
        </div>
      </div>

      <main className="page data-collection-page">
        <form className="data-collection-form" id="data-collection-form">
          <div className="content-wrapper">
            <div className="form-field">
              <input
                id="match-number"
                name="matchNumber"
                type="number"
                min={VALIDATION.MIN_MATCH_NUMBER}
                max={VALIDATION.MAX_MATCH_NUMBER}
                autoComplete="off"
                aria-label="Match number (0-999)"
                aria-required="true"
              />
              <label htmlFor="match-number">Match Number</label>
            </div>

            <div id="team-number-container">
              <div className="team-number-loader hidden" id="schedule-loader">
                <div className="textbox-placeholder">Team Number</div>
                <div className="spin-loader"></div>
              </div>

              <div
                className="form-field hidden"
                id="team-number-dropdown-container"
              >
                <select
                  id="team-number-dropdown"
                  name="teamNumberDropdown"
                  aria-label="Select team number from match schedule"
                  aria-required="true"
                >
                  <option value="">Select Team</option>
                </select>
                <label htmlFor="team-number-dropdown">Team Number</label>
              </div>

              <div className="form-field" id="team-number-manual-container">
                <input
                  id="team-number"
                  name="teamNumber"
                  type="number"
                  autoComplete="off"
                  aria-label="Team number to scout"
                  aria-required="true"
                  min={VALIDATION.MIN_TEAM_NUMBER}
                  max={VALIDATION.MAX_TEAM_NUMBER}
                />
                <label htmlFor="team-number">Team Number</label>
              </div>
            </div>

            <div className="alliance-section" id="alliance-section">
              <div
                className="toggle-button-group"
                role="group"
                aria-label="Alliance color selection"
              >
                <button
                  type="button"
                  className="alliance-toggle red"
                  data-value="red"
                  aria-label="Select red alliance"
                  role="radio"
                  aria-checked="false"
                >
                  RED ALLIANCE
                </button>
                <button
                  type="button"
                  className="alliance-toggle blue"
                  data-value="blue"
                  aria-label="Select blue alliance"
                  role="radio"
                  aria-checked="false"
                >
                  BLUE ALLIANCE
                </button>
              </div>
            </div>

            <h2 className="section-title">Auto</h2>
            <h2 className="section-title">Teleop</h2>

            <div className="action-area">
              <button
                type="button"
                className="back-button"
                onClick={handleBack}
                aria-label="Go back to login page"
              >
                Back
              </button>
              <button
                type="submit"
                className="submit-button"
                aria-label="Submit match data"
              >
                Submit
              </button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
};

export default DataCollection;
