import { Component, ErrorInfo, ReactNode } from "react";
import "./ErrorBoundary.scss";
import { logger } from "@/utils/logger";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches render-time errors and replaces the broken subtree with a safe fallback UI.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Logs the failure so it can be diagnosed without exposing it to the user.
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error("Error Boundary caught an error:", error, errorInfo);
  }

  /**
   * Clears the error state so the user can retry the current screen.
   */
  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback keeps the app usable even when a child component fails.
      return (
        <div className="error-boundary-container">
          <h1 className="error-boundary-title">Something went wrong</h1>
          <p className="error-boundary-message">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <button onClick={this.handleReset} className="error-boundary-button">
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
