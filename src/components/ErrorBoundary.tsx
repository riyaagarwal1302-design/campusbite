import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'An unexpected error occurred.',
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('CampusBite ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, message: '' });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      let displayMessage = 'Something went wrong while syncing your CampusBite data.';
      try {
        const parsed = JSON.parse(this.state.message) as { error?: string };
        if (parsed.error) {
          displayMessage = parsed.error;
        }
      } catch {
        displayMessage = this.state.message;
      }

      return (
        <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-stone-200 rounded-xl p-8 text-center shadow-sm">
            <div className="w-11 h-11 rounded-full bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h2 className="font-display text-xl font-semibold text-[#171E1A] mb-2">
              Unable to complete request
            </h2>
            <p className="text-sm text-stone-600 mb-6 break-words">{displayMessage}</p>
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#166534] hover:bg-[#14532D] rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
