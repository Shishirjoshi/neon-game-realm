import React, { Component, ErrorInfo, ReactNode } from 'react';
import { GlassPanel } from './GlassPanel';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('❌ Error Boundary caught:', error);
    console.error('Error info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-black">
          <GlassPanel className="p-8 max-w-md">
            <h2 className="text-2xl font-bold text-red-400 mb-2">Component Error</h2>
            <p className="text-muted-foreground mb-4">{this.state.error?.message}</p>
            <pre className="bg-black/50 p-2 rounded text-xs text-red-400 overflow-auto max-h-48 mb-4">
              {this.state.error?.stack}
            </pre>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              Go to Home
            </button>
          </GlassPanel>
        </div>
      );
    }

    return this.props.children;
  }
}
