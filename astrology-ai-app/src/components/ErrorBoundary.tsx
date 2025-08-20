"use client";

import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
	onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
	hasError: boolean;
	error?: Error;
	errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error("ErrorBoundary caught an error:", error, errorInfo);

		// Send to error tracking service
		if (typeof window !== "undefined") {
			// Log to console in development
			if (process.env.NODE_ENV === "development") {
				console.group("🚨 Error Boundary Caught Error");
				console.error("Error:", error);
				console.error("Error Info:", errorInfo);
				console.error("Component Stack:", errorInfo.componentStack);
				console.groupEnd();
			}

			// In production, you would send this to an error tracking service
			// Example: Sentry.captureException(error, { extra: errorInfo });
		}

		this.setState({ errorInfo });
		this.props.onError?.(error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			// Custom fallback UI
			if (this.props.fallback) {
				return this.props.fallback;
			}

			// Default error UI
			return (
				<div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
					<div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
						<div className="w-16 h-16 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
							<AlertTriangle className="w-8 h-8 text-red-400" />
						</div>

						<h1 className="text-2xl font-bold text-white mb-4">
							Something went wrong
						</h1>

						<p className="text-white/70 mb-6">
							We encountered an unexpected error. Don't worry, the cosmic forces
							are still with you!
						</p>

						{process.env.NODE_ENV === "development" && this.state.error && (
							<details className="text-left mb-6 p-4 bg-red-500/10 border border-red-400/30 rounded-lg">
								<summary className="text-red-300 font-medium cursor-pointer mb-2">
									Error Details (Dev Mode)
								</summary>
								<pre className="text-xs text-red-200 whitespace-pre-wrap overflow-auto max-h-32">
									{this.state.error.toString()}
									{this.state.errorInfo?.componentStack}
								</pre>
							</details>
						)}

						<div className="space-y-3">
							<Button
								onClick={() => {
									this.setState({
										hasError: false,
										error: undefined,
										errorInfo: undefined,
									});
								}}
								className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
								<RefreshCw className="w-4 h-4 mr-2" />
								Try Again
							</Button>

							<Button
								onClick={() => (window.location.href = "/")}
								variant="outline"
								className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20">
								<Home className="w-4 h-4 mr-2" />
								Go Home
							</Button>
						</div>

						<div className="mt-6 pt-6 border-t border-white/20">
							<p className="text-white/60 text-sm mb-3">
								Need help? Contact our support team.
							</p>
							<Button
								onClick={() => {
									// In a real app, this would open a support chat or email
									window.location.href =
										"mailto:support@astrologyai.com?subject=Error Report";
								}}
								variant="outline"
								size="sm"
								className="bg-white/5 border-white/20 text-white/80 hover:bg-white/10">
								<MessageCircle className="w-3 h-3 mr-2" />
								Report Issue
							</Button>
						</div>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

// Functional component wrapper for easier usage
interface ErrorFallbackProps {
	error: Error;
	resetError: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
	error,
	resetError,
}) => (
	<div className="bg-red-500/10 border border-red-400/30 rounded-lg p-6 text-center">
		<AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
		<h2 className="text-lg font-semibold text-white mb-2">
			Oops! Something went wrong
		</h2>
		<p className="text-white/70 text-sm mb-4">
			{error.message || "An unexpected error occurred"}
		</p>
		<Button
			onClick={resetError}
			size="sm"
			className="bg-red-500 hover:bg-red-600 text-white">
			<RefreshCw className="w-4 h-4 mr-2" />
			Try Again
		</Button>
	</div>
);

// Hook for handling async errors in functional components
export const useErrorHandler = () => {
	const [error, setError] = React.useState<Error | null>(null);

	const resetError = () => setError(null);

	const handleError = React.useCallback((error: Error) => {
		console.error("Async error caught:", error);
		setError(error);
	}, []);

	React.useEffect(() => {
		if (error) {
			throw error; // This will be caught by ErrorBoundary
		}
	}, [error]);

	return { handleError, resetError };
};
