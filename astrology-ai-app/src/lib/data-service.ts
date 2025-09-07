import { ChartService } from "./chart-service";
import { SessionService } from "./session-service";
import {
	BirthChartInput,
	StoredBirthChart,
	AstrologyApiResponse,
} from "@/types/astrology";

export interface DataServiceResponse<T = any> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}

export class DataService {
	/**
	 * Save complete user session with birth details, chart, and initial messages
	 */
	static async saveCompleteSession(data: {
		sessionId: string;
		userId?: string;
		birthDetails: BirthChartInput;
		chartData: AstrologyApiResponse;
		initialMessages?: Array<{
			content: string;
			role: "user" | "assistant";
		}>;
	}): Promise<
		DataServiceResponse<{
			sessionId: string;
			chartId: string;
			messageIds: string[];
		}>
	> {
		try {
			// 1. Create session
			const session = await SessionService.createSession(data.sessionId, {
				userId: data.userId,
				metadata: {
					sessionType: data.userId ? "returning_user" : "new_user",
				},
			});

			if (!session) {
				return {
					success: false,
					error: "Failed to create session",
				};
			}

			// 2. Save birth chart
			const chart = await ChartService.saveChart(
				data.birthDetails,
				data.chartData
			);
			if (!chart) {
				return {
					success: false,
					error: "Failed to save birth chart",
				};
			}

			// 3. Update session with birth details and chart
			await SessionService.updateSessionBirthDetails(
				data.sessionId,
				data.birthDetails
			);
			await SessionService.addChartToSession(
				data.sessionId,
				chart._id!.toString()
			);
			await SessionService.setCurrentChart(
				data.sessionId,
				chart._id!.toString()
			);

			// 4. Save initial messages if provided
			let messageIds: string[] = [];
			if (data.initialMessages && data.initialMessages.length > 0) {
				const messageResponse = await fetch("/api/mongodb/message", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "saveMessages",
						data: {
							sessionId: data.sessionId,
							userId: data.userId,
							messages: data.initialMessages,
						},
					}),
				});

				if (messageResponse.ok) {
					const messageData = await messageResponse.json();
					if (messageData.success) {
						messageIds = Array.from(
							{ length: data.initialMessages.length },
							(_, i) => `msg_${Date.now()}_${i}`
						);
					}
				}
			}

			// 5. Track analytics
			await this.trackAnalytics("session_start", data.sessionId, data.userId);
			await this.trackAnalytics(
				"chart_calculation",
				data.sessionId,
				data.userId,
				{
					chartId: chart._id!.toString(),
					birthDetails: data.birthDetails,
				}
			);

			return {
				success: true,
				data: {
					sessionId: data.sessionId,
					chartId: chart._id!.toString(),
					messageIds,
				},
			};
		} catch (error) {
			console.error("Error saving complete session:", error);
			return {
				success: false,
				error: "Failed to save complete session",
			};
		}
	}

	/**
	 * Save chat message and track analytics
	 */
	static async saveChatMessage(data: {
		sessionId: string;
		userId?: string;
		content: string;
		role: "user" | "assistant";
		metadata?: any;
	}): Promise<DataServiceResponse<{ messageId: string }>> {
		try {
			// Save message
			const response = await fetch("/api/mongodb/message", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "saveMessage",
					data,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to save message");
			}

			const result = await response.json();
			if (!result.success) {
				throw new Error(result.error || "Failed to save message");
			}

			// Track analytics
			await this.trackAnalytics("chat_message", data.sessionId, data.userId, {
				messageCount: 1,
				...data.metadata,
			});

			return {
				success: true,
				data: {
					messageId: result.data.messageId,
				},
			};
		} catch (error) {
			console.error("Error saving chat message:", error);
			return {
				success: false,
				error: "Failed to save chat message",
			};
		}
	}

	/**
	 * Get session with all related data
	 */
	static async getSessionData(sessionId: string): Promise<
		DataServiceResponse<{
			session: any;
			messages: any[];
			charts: StoredBirthChart[];
		}>
	> {
		try {
			// Get session
			const sessionResponse = await fetch(
				`/api/mongodb/session?sessionId=${sessionId}`
			);
			if (!sessionResponse.ok) {
				throw new Error("Failed to get session");
			}

			const sessionResult = await sessionResponse.json();
			if (!sessionResult.success) {
				throw new Error("Session not found");
			}

			// Get messages
			const messagesResponse = await fetch(
				`/api/mongodb/message?sessionId=${sessionId}`
			);
			const messagesResult = await messagesResponse.json();
			const messages = messagesResult.success ? messagesResult.data : [];

			// Get charts
			const charts: StoredBirthChart[] = [];
			if (
				sessionResult.data.chartIds &&
				sessionResult.data.chartIds.length > 0
			) {
				for (const chartId of sessionResult.data.chartIds) {
					const chart = await ChartService.getChartById(chartId);
					if (chart) {
						charts.push(chart);
					}
				}
			}

			return {
				success: true,
				data: {
					session: sessionResult.data,
					messages,
					charts,
				},
			};
		} catch (error) {
			console.error("Error getting session data:", error);
			return {
				success: false,
				error: "Failed to get session data",
			};
		}
	}

	/**
	 * Update birth details and recalculate chart
	 */
	static async updateBirthDetailsAndChart(data: {
		sessionId: string;
		userId?: string;
		birthDetails: BirthChartInput;
	}): Promise<
		DataServiceResponse<{
			chartId: string;
			chartData: AstrologyApiResponse;
		}>
	> {
		try {
			// 1. Update session birth details
			const sessionUpdated = await SessionService.updateSessionBirthDetails(
				data.sessionId,
				data.birthDetails
			);

			if (!sessionUpdated) {
				return {
					success: false,
					error: "Failed to update session birth details",
				};
			}

			// 2. Calculate new chart
			const chartData = await ChartService.calculateChartFromInput(
				data.birthDetails
			);
			if (!chartData) {
				return {
					success: false,
					error: "Failed to calculate new chart",
				};
			}

			// 3. Save new chart
			const chart = await ChartService.saveChart(data.birthDetails, chartData);
			if (!chart) {
				return {
					success: false,
					error: "Failed to save new chart",
				};
			}

			// 4. Update session with new chart
			await SessionService.addChartToSession(
				data.sessionId,
				chart._id!.toString()
			);
			await SessionService.setCurrentChart(
				data.sessionId,
				chart._id!.toString()
			);

			// 5. Track analytics
			await this.trackAnalytics(
				"birth_details_update",
				data.sessionId,
				data.userId,
				{
					chartId: chart._id!.toString(),
					birthDetails: data.birthDetails,
				}
			);

			return {
				success: true,
				data: {
					chartId: chart._id!.toString(),
					chartData,
				},
			};
		} catch (error) {
			console.error("Error updating birth details and chart:", error);
			return {
				success: false,
				error: "Failed to update birth details and chart",
			};
		}
	}

	/**
	 * Get user's chart history
	 */
	static async getUserChartHistory(userId: string): Promise<
		DataServiceResponse<{
			charts: StoredBirthChart[];
			sessions: any[];
		}>
	> {
		try {
			// Get user charts
			const chartsResponse = await fetch("/api/mongodb/user", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "getUserCharts",
					data: { userId },
				}),
			});

			if (!chartsResponse.ok) {
				throw new Error("Failed to get user charts");
			}

			const chartsResult = await chartsResponse.json();
			const charts = chartsResult.success ? chartsResult.data : [];

			// Get user sessions (you might want to add this to the session service)
			const sessions: any[] = []; // Placeholder for now

			return {
				success: true,
				data: {
					charts,
					sessions,
				},
			};
		} catch (error) {
			console.error("Error getting user chart history:", error);
			return {
				success: false,
				error: "Failed to get user chart history",
			};
		}
	}

	/**
	 * Track analytics events
	 */
	private static async trackAnalytics(
		eventType: string,
		sessionId: string,
		userId?: string,
		metadata?: any
	): Promise<void> {
		try {
			await fetch("/api/mongodb/analytics", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "trackEvent",
					data: {
						eventType,
						sessionId,
						userId,
						metadata,
					},
				}),
			});
		} catch (error) {
			console.error("Error tracking analytics:", error);
			// Don't fail the main operation if analytics tracking fails
		}
	}

	/**
	 * Clean up old data
	 */
	static async cleanupOldData(): Promise<
		DataServiceResponse<{
			chartsRemoved: number;
			sessionsRemoved: number;
			messagesRemoved: number;
			analyticsRemoved: number;
		}>
	> {
		try {
			// Clean up old charts
			const chartsRemoved = await ChartService.cleanupOldCharts(90);

			// Clean up old sessions
			const sessionsRemoved = await SessionService.cleanupOldSessions(7);

			// Clean up old messages (older than 30 days)
			const messagesRemoved = await this.cleanupOldMessages(30);

			// Clean up old analytics (older than 90 days)
			const analyticsRemoved = await this.cleanupOldAnalytics(90);

			return {
				success: true,
				data: {
					chartsRemoved,
					sessionsRemoved,
					messagesRemoved,
					analyticsRemoved,
				},
			};
		} catch (error) {
			console.error("Error cleaning up old data:", error);
			return {
				success: false,
				error: "Failed to cleanup old data",
			};
		}
	}

	/**
	 * Clean up old messages
	 */
	private static async cleanupOldMessages(daysOld: number): Promise<number> {
		try {
			const cutoffDate = new Date();
			cutoffDate.setDate(cutoffDate.getDate() - daysOld);

			const response = await fetch("/api/mongodb/message", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "cleanupOld",
					data: { cutoffDate: cutoffDate.toISOString() },
				}),
			});

			if (response.ok) {
				const result = await response.json();
				return result.success ? result.data.deletedCount : 0;
			}

			return 0;
		} catch (error) {
			console.error("Error cleaning up old messages:", error);
			return 0;
		}
	}

	/**
	 * Clean up old analytics
	 */
	private static async cleanupOldAnalytics(daysOld: number): Promise<number> {
		try {
			const cutoffDate = new Date();
			cutoffDate.setDate(cutoffDate.getDate() - daysOld);

			const response = await fetch("/api/mongodb/analytics", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "cleanupOld",
					data: { cutoffDate: cutoffDate.toISOString() },
				}),
			});

			if (response.ok) {
				const result = await response.json();
				return result.success ? result.data.deletedCount : 0;
			}

			return 0;
		} catch (error) {
			console.error("Error cleaning up old analytics:", error);
			return 0;
		}
	}
}

