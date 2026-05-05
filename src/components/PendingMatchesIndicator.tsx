interface PendingMatchesIndicatorProps {
  pendingCount: number;
  isRetrying: boolean;
  onRetry: () => void;
}

/**
 * Displays the offline queue size and gives the user a manual retry action.
 */
export const PendingMatchesIndicator = ({
  pendingCount,
  isRetrying,
  onRetry,
}: PendingMatchesIndicatorProps) => {
  if (pendingCount === 0) {
    return null;
  }

  return (
    <div className="pending-matches-indicator">
      <span className="pending-matches-count">{pendingCount}</span> pending
      <button
        type="button"
        className="retry-submit-button"
        onClick={onRetry}
        disabled={isRetrying}
        aria-label="Retry submitting pending matches"
      >
        ↻
      </button>
    </div>
  );
};
