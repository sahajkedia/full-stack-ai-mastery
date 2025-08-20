/**
 * Simple analytics tracking for immediate insights
 * This provides basic tracking until PostHog/GA4 is set up
 */

interface AnalyticsEvent {
	name: string;
	properties: Record<string, any>;
	timestamp: number;
	sessionId: string;
	userId?: string;
}

class SimpleAnalytics {
	private events: AnalyticsEvent[] = [];
	private sessionId: string;
	private userId?: string;
	private maxEvents = 1000; // Prevent memory issues

	constructor() {
		this.sessionId = this.generateSessionId();

		// In a real app, you'd get this from authentication
		this.userId = this.getOrCreateUserId();
	}

	/**
	 * Track an event
	 */
	track(eventName: string, properties: Record<string, any> = {}) {
		// Only track in browser environment
		if (typeof window === "undefined") return;

		const event: AnalyticsEvent = {
			name: eventName,
			properties: {
				...properties,
				url: window.location.href,
				userAgent: navigator.userAgent,
				timestamp: Date.now(),
			},
			timestamp: Date.now(),
			sessionId: this.sessionId,
			userId: this.userId,
		};

		this.events.push(event);

		// Prevent memory leaks
		if (this.events.length > this.maxEvents) {
			this.events = this.events.slice(-this.maxEvents / 2);
		}

		// Log to console in development
		if (process.env.NODE_ENV === "development") {
			console.log("📊 Analytics Event:", eventName, properties);
		}

		// In production, you would send this to your analytics service
		// Example: this.sendToAnalyticsService(event);
	}

	/**
	 * Track page view
	 */
	pageView(page: string, properties: Record<string, any> = {}) {
		this.track("page_view", {
			page,
			...properties,
		});
	}

	/**
	 * Track user interaction
	 */
	interaction(
		element: string,
		action: string,
		properties: Record<string, any> = {}
	) {
		this.track("user_interaction", {
			element,
			action,
			...properties,
		});
	}

	/**
	 * Track performance metrics
	 */
	performance(
		metric: string,
		value: number,
		properties: Record<string, any> = {}
	) {
		this.track("performance", {
			metric,
			value,
			...properties,
		});
	}

	/**
	 * Track errors
	 */
	error(error: Error, context: Record<string, any> = {}) {
		this.track("error", {
			message: error.message,
			stack: error.stack,
			...context,
		});
	}

	/**
	 * Get analytics summary
	 */
	getSummary() {
		const eventCounts = this.events.reduce((acc, event) => {
			acc[event.name] = (acc[event.name] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		return {
			totalEvents: this.events.length,
			sessionId: this.sessionId,
			userId: this.userId,
			eventCounts,
			sessionDuration: this.getSessionDuration(),
		};
	}

	/**
	 * Export events (for sending to analytics service)
	 */
	exportEvents(): AnalyticsEvent[] {
		return [...this.events];
	}

	/**
	 * Clear events (after sending to service)
	 */
	clearEvents(): void {
		this.events = [];
	}

	private generateSessionId(): string {
		return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	private getOrCreateUserId(): string {
		if (typeof window === "undefined") return "server";

		let userId = localStorage.getItem("astrology_user_id");
		if (!userId) {
			userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
			localStorage.setItem("astrology_user_id", userId);
		}
		return userId;
	}

	private getSessionDuration(): number {
		if (this.events.length === 0) return 0;
		const firstEvent = this.events[0];
		const lastEvent = this.events[this.events.length - 1];
		return lastEvent.timestamp - firstEvent.timestamp;
	}
}

// Create singleton instance
export const analytics = new SimpleAnalytics();

// Specific tracking functions for the astrology app
export const trackAstrologyEvent = {
	formStarted: () => analytics.track("birth_form_started"),

	formStepCompleted: (step: string) =>
		analytics.track("birth_form_step_completed", { step }),

	formCompleted: (timeToComplete: number) =>
		analytics.track("birth_form_completed", {
			timeToComplete,
		}),

	formAbandoned: (step: string, timeSpent: number) =>
		analytics.track("birth_form_abandoned", {
			step,
			timeSpent,
		}),

	predictionRequested: (hasChartData: boolean) =>
		analytics.track("prediction_requested", {
			hasChartData,
		}),

	predictionReceived: (responseTime: number, cached: boolean) =>
		analytics.track("prediction_received", {
			responseTime,
			cached,
		}),

	chartViewed: () => analytics.track("birth_chart_viewed"),

	streamingStarted: () => analytics.track("streaming_response_started"),

	streamingCompleted: (totalTime: number) =>
		analytics.track("streaming_response_completed", {
			totalTime,
		}),

	errorOccurred: (error: Error, context: string) =>
		analytics.error(error, { context }),

	cacheHit: (cacheKey: string) => analytics.track("cache_hit", { cacheKey }),

	cacheMiss: (cacheKey: string) => analytics.track("cache_miss", { cacheKey }),
};

// Auto-track page views
if (typeof window !== "undefined") {
	// Track initial page load
	analytics.pageView(window.location.pathname);

	// Track navigation (for SPAs)
	const originalPushState = history.pushState;
	const originalReplaceState = history.replaceState;

	history.pushState = function (...args) {
		originalPushState.apply(this, args);
		analytics.pageView(window.location.pathname);
	};

	history.replaceState = function (...args) {
		originalReplaceState.apply(this, args);
		analytics.pageView(window.location.pathname);
	};

	window.addEventListener("popstate", () => {
		analytics.pageView(window.location.pathname);
	});
}
