import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught component error in Campus Carbon app:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.hash = '';
    window.location.reload();
  };

  private handleResetToHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.hash = '';
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-ivory flex items-center justify-center p-4 sm:p-6 font-sans">
          <div className="max-w-xl w-full bg-white rounded-3xl border border-red-200 shadow-xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-black text-navy-900 tracking-tight">An unexpected display error occurred</h2>
                <p className="text-xs text-navy-600">The application encountered an error while rendering this view.</p>
              </div>
            </div>

            <div className="bg-navy-50/70 rounded-2xl p-4 border border-navy-100 text-xs text-navy-700 space-y-2">
              <p className="font-semibold text-navy-900">What you can do:</p>
              <ul className="list-disc list-inside space-y-1 text-navy-600">
                <li>Reload the page to fetch the latest application state.</li>
                <li>Clear your browser cache if you recently updated the app.</li>
                <li>Return to the homepage to restart your assessment cleanly.</li>
              </ul>
            </div>

            {this.state.error && (
              <details className="text-xs bg-slate-900 text-slate-100 p-3.5 rounded-xl overflow-x-auto">
                <summary className="font-mono text-xs cursor-pointer text-slate-300 hover:text-white font-bold select-none">
                  Technical Details ({this.state.error.name})
                </summary>
                <div className="mt-2 font-mono text-[11px] text-red-300 break-words">
                  {this.state.error.message}
                </div>
                {this.state.errorInfo && (
                  <pre className="mt-2 font-mono text-[10px] text-slate-400 whitespace-pre-wrap leading-tight">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto flex-1 py-3 px-4 rounded-xl bg-cobalt hover:bg-cobalt-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>

              <button
                onClick={this.handleResetToHome}
                className="w-full sm:w-auto py-3 px-4 rounded-xl bg-white hover:bg-navy-50 text-navy-800 border border-navy-200 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Back to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
