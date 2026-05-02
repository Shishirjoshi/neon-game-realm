import React, { ReactNode } from "react";

interface ChessErrorBoundaryProps {
  children: ReactNode;
  onReset?: () => void;
}

interface ChessErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ChessErrorBoundary extends React.Component<
  ChessErrorBoundaryProps,
  ChessErrorBoundaryState
> {
  constructor(props: ChessErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Chess Game Error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-black/80 backdrop-blur border border-red-500 rounded-2xl p-8 shadow-2xl shadow-red-500/30">
            <h1 className="text-3xl font-bold text-red-400 mb-4">Game Error</h1>
            <p className="text-gray-300 mb-4">
              An error occurred while running the chess game.
            </p>
            <pre className="bg-gray-900 p-3 rounded text-xs text-red-300 overflow-auto mb-6 max-h-32">
              {this.state.error?.message}
            </pre>
            <button
              onClick={this.handleReset}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
