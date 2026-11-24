import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { firebaseConfig } from '../firebase';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
  isQuotaError: boolean;
  isPermissionError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
    isQuotaError: false,
    isPermissionError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    const rawMsg = error?.message || 'An unexpected error occurred.';
    let parsedMsg = rawMsg;
    try {
      const parsed = JSON.parse(rawMsg);
      if (parsed && typeof parsed.error === 'string') {
        parsedMsg = `${parsed.error}${parsed.path ? ` (${parsed.operationType} ${parsed.path})` : ''}`;
      }
    } catch {
      // Plain error string
    }

    const lower = parsedMsg.toLowerCase();
    return {
      hasError: true,
      errorMessage: parsedMsg,
      isQuotaError: lower.includes('quota exceeded'),
      isPermissionError: lower.includes('missing or insufficient permissions') || lower.includes('permission_denied'),
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application ErrorBoundary caught:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      errorMessage: '',
      isQuotaError: false,
      isPermissionError: false,
    });
  };

  public render() {
    if (this.state.hasError) {
      const upgradeUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/databases/${firebaseConfig.firestoreDatabaseId}/data?openUpgradeDialog=true`;

      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-16">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-xl text-center space-y-4">
            <AlertCircle className="size-12 text-destructive mx-auto" />
            <h2 className="font-display text-2xl font-bold text-foreground">
              {this.state.isQuotaError
                ? 'Database Usage Quota Reached'
                : this.state.isPermissionError
                ? 'Access Permission Required'
                : 'Something went wrong'}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {this.state.isQuotaError ? (
                <>
                  The daily free-tier Firestore usage quota has been reached. Quota resets tomorrow, or you can
                  review your plan in Firebase Console.
                </>
              ) : this.state.isPermissionError ? (
                <>
                  You do not have permission to perform this database action. Please sign in with an authorized
                  verified account and try again.
                </>
              ) : (
                'We encountered an unexpected application error. You can retry or reload the page.'
              )}
            </p>
            <div className="rounded-lg bg-muted/60 border border-border px-3 py-2 text-xs font-mono text-muted-foreground break-words text-left">
              {this.state.errorMessage}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {this.state.isQuotaError && (
                <a
                  href={upgradeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
                >
                  Open Firebase Console
                </a>
              )}
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
              >
                <RefreshCw className="size-3.5" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
