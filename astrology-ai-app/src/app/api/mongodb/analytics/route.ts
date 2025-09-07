import { NextRequest, NextResponse } from "next/server";
import { getDatabase, COLLECTIONS } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export interface AnalyticsEvent {
	_id?: ObjectId;
	eventType:
		| "chart_calculation"
		| "chat_message"
		| "session_start"
		| "session_end"
		| "birth_details_update";
	sessionId: string;
	userId?: string;
	timestamp: Date;
	metadata: {
		chartId?: string;
		messageCount?: number;
		birthDetails?: any;
		apiResponseTime?: number;
		error?: string;
		userAgent?: string;
		ipAddress?: string;
		[key: string]: any;
	};
}

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { action, data } = body;

		switch (action) {
			case "trackEvent":
				return await trackEvent(data);
			case "trackChartCalculation":
				return await trackChartCalculation(data);
			case "trackChatMessage":
				return await trackChatMessage(data);
			case "trackSession":
				return await trackSession(data);
			default:
				return NextResponse.json(
					{ success: false, error: "Invalid action" },
					{ status: 400 }
				);
		}
	} catch (error) {
		console.error("Analytics API error:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Internal server error",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const action = searchParams.get("action");
		const startDate = searchParams.get("startDate");
		const endDate = searchParams.get("endDate");

		switch (action) {
			case "dashboard":
				return await getDashboardStats(startDate, endDate);
			case "chartUsage":
				return await getChartUsageStats(startDate, endDate);
			case "userEngagement":
				return await getUserEngagementStats(startDate, endDate);
			case "errorAnalysis":
				return await getErrorAnalysis(startDate, endDate);
			default:
				return await getBasicStats(startDate, endDate);
		}
	} catch (error) {
		console.error("Analytics API GET error:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Internal server error",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

async function trackEvent(data: {
	eventType: AnalyticsEvent["eventType"];
	sessionId: string;
	userId?: string;
	metadata?: any;
}) {
	try {
		const db = await getDatabase();
		const collection = db.collection<AnalyticsEvent>(COLLECTIONS.ANALYTICS);

		const event: Omit<AnalyticsEvent, "_id"> = {
			eventType: data.eventType,
			sessionId: data.sessionId,
			userId: data.userId,
			timestamp: new Date(),
			metadata: data.metadata || {},
		};

		const result = await collection.insertOne(event);

		if (result.acknowledged) {
			return NextResponse.json({
				success: true,
				data: {
					eventId: result.insertedId.toString(),
					message: "Event tracked successfully",
				},
			});
		}

		return NextResponse.json(
			{ success: false, error: "Failed to track event" },
			{ status: 500 }
		);
	} catch (error) {
		console.error("Error tracking event:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to track event" },
			{ status: 500 }
		);
	}
}

async function trackChartCalculation(data: {
	sessionId: string;
	userId?: string;
	chartId: string;
	apiResponseTime: number;
	birthDetails?: any;
	error?: string;
}) {
	try {
		const db = await getDatabase();
		const collection = db.collection<AnalyticsEvent>(COLLECTIONS.ANALYTICS);

		const event: Omit<AnalyticsEvent, "_id"> = {
			eventType: "chart_calculation",
			sessionId: data.sessionId,
			userId: data.userId,
			timestamp: new Date(),
			metadata: {
				chartId: data.chartId,
				apiResponseTime: data.apiResponseTime,
				birthDetails: data.birthDetails,
				error: data.error,
			},
		};

		const result = await collection.insertOne(event);

		if (result.acknowledged) {
			return NextResponse.json({
				success: true,
				data: {
					eventId: result.insertedId.toString(),
					message: "Chart calculation tracked successfully",
				},
			});
		}

		return NextResponse.json(
			{ success: false, error: "Failed to track chart calculation" },
			{ status: 500 }
		);
	} catch (error) {
		console.error("Error tracking chart calculation:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to track chart calculation" },
			{ status: 500 }
		);
	}
}

async function trackChatMessage(data: {
	sessionId: string;
	userId?: string;
	messageCount: number;
	chartId?: string;
}) {
	try {
		const db = await getDatabase();
		const collection = db.collection<AnalyticsEvent>(COLLECTIONS.ANALYTICS);

		const event: Omit<AnalyticsEvent, "_id"> = {
			eventType: "chat_message",
			sessionId: data.sessionId,
			userId: data.userId,
			timestamp: new Date(),
			metadata: {
				messageCount: data.messageCount,
				chartId: data.chartId,
			},
		};

		const result = await collection.insertOne(event);

		if (result.acknowledged) {
			return NextResponse.json({
				success: true,
				data: {
					eventId: result.insertedId.toString(),
					message: "Chat message tracked successfully",
				},
			});
		}

		return NextResponse.json(
			{ success: false, error: "Failed to track chat message" },
			{ status: 500 }
		);
	} catch (error) {
		console.error("Error tracking chat message:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to track chat message" },
			{ status: 500 }
		);
	}
}

async function trackSession(data: {
	eventType: "session_start" | "session_end";
	sessionId: string;
	userId?: string;
	metadata?: any;
}) {
	try {
		const db = await getDatabase();
		const collection = db.collection<AnalyticsEvent>(COLLECTIONS.ANALYTICS);

		const event: Omit<AnalyticsEvent, "_id"> = {
			eventType: data.eventType,
			sessionId: data.sessionId,
			userId: data.userId,
			timestamp: new Date(),
			metadata: data.metadata || {},
		};

		const result = await collection.insertOne(event);

		if (result.acknowledged) {
			return NextResponse.json({
				success: true,
				data: {
					eventId: result.insertedId.toString(),
					message: "Session event tracked successfully",
				},
			});
		}

		return NextResponse.json(
			{ success: false, error: "Failed to track session event" },
			{ status: 500 }
		);
	} catch (error) {
		console.error("Error tracking session event:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to track session event" },
			{ status: 500 }
		);
	}
}

async function getBasicStats(startDate?: string, endDate?: string) {
	try {
		const db = await getDatabase();
		const collection = db.collection<AnalyticsEvent>(COLLECTIONS.ANALYTICS);

		const filter: any = {};
		if (startDate && endDate) {
			filter.timestamp = {
				$gte: new Date(startDate),
				$lte: new Date(endDate),
			};
		}

		const totalEvents = await collection.countDocuments(filter);
		const uniqueSessions = await collection.distinct("sessionId", filter);
		const uniqueUsers = await collection.distinct("userId", filter);

		return NextResponse.json({
			success: true,
			data: {
				totalEvents,
				uniqueSessions: uniqueSessions.length,
				uniqueUsers: uniqueUsers.filter(Boolean).length,
			},
		});
	} catch (error) {
		console.error("Error getting basic stats:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to get basic stats" },
			{ status: 500 }
		);
	}
}

async function getDashboardStats(startDate?: string, endDate?: string) {
	try {
		const db = await getDatabase();
		const collection = db.collection<AnalyticsEvent>(COLLECTIONS.ANALYTICS);

		const filter: any = {};
		if (startDate && endDate) {
			filter.timestamp = {
				$gte: new Date(startDate),
				$lte: new Date(endDate),
			};
		}

		const [
			totalEvents,
			chartCalculations,
			chatMessages,
			sessionStarts,
			uniqueSessions,
		] = await Promise.all([
			collection.countDocuments(filter),
			collection.countDocuments({ ...filter, eventType: "chart_calculation" }),
			collection.countDocuments({ ...filter, eventType: "chat_message" }),
			collection.countDocuments({ ...filter, eventType: "session_start" }),
			collection.distinct("sessionId", filter),
		]);

		return NextResponse.json({
			success: true,
			data: {
				totalEvents,
				chartCalculations,
				chatMessages,
				sessionStarts,
				uniqueSessions: uniqueSessions.length,
				averageMessagesPerSession: chatMessages / uniqueSessions.length || 0,
			},
		});
	} catch (error) {
		console.error("Error getting dashboard stats:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to get dashboard stats" },
			{ status: 500 }
		);
	}
}

async function getChartUsageStats(startDate?: string, endDate?: string) {
	try {
		const db = await getDatabase();
		const collection = db.collection<AnalyticsEvent>(COLLECTIONS.ANALYTICS);

		const filter: any = { eventType: "chart_calculation" };
		if (startDate && endDate) {
			filter.timestamp = {
				$gte: new Date(startDate),
				$lte: new Date(endDate),
			};
		}

		const chartEvents = await collection.find(filter).toArray();
		const totalCharts = chartEvents.length;
		const successfulCharts = chartEvents.filter(
			(e) => !e.metadata.error
		).length;
		const averageResponseTime =
			chartEvents.reduce(
				(sum, e) => sum + (e.metadata.apiResponseTime || 0),
				0
			) / totalCharts || 0;

		return NextResponse.json({
			success: true,
			data: {
				totalCharts,
				successfulCharts,
				failedCharts: totalCharts - successfulCharts,
				successRate: (successfulCharts / totalCharts) * 100 || 0,
				averageResponseTime: Math.round(averageResponseTime * 100) / 100,
			},
		});
	} catch (error) {
		console.error("Error getting chart usage stats:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to get chart usage stats" },
			{ status: 500 }
		);
	}
}

async function getUserEngagementStats(startDate?: string, endDate?: string) {
	try {
		const db = await getDatabase();
		const collection = db.collection<AnalyticsEvent>(COLLECTIONS.ANALYTICS);

		const filter: any = {};
		if (startDate && endDate) {
			filter.timestamp = {
				$gte: new Date(startDate),
				$lte: new Date(endDate),
			};
		}

		const pipeline = [
			{ $match: filter },
			{
				$group: {
					_id: "$sessionId",
					eventCount: { $sum: 1 },
					lastActivity: { $max: "$timestamp" },
					hasChart: {
						$max: {
							$cond: [{ $eq: ["$eventType", "chart_calculation"] }, 1, 0],
						},
					},
				},
			},
			{
				$group: {
					_id: null,
					totalSessions: { $sum: 1 },
					averageEventsPerSession: { $avg: "$eventCount" },
					sessionsWithCharts: { $sum: "$hasChart" },
				},
			},
		];

		const result = await collection.aggregate(pipeline).toArray();
		const stats = result[0] || {
			totalSessions: 0,
			averageEventsPerSession: 0,
			sessionsWithCharts: 0,
		};

		return NextResponse.json({
			success: true,
			data: {
				totalSessions: stats.totalSessions,
				averageEventsPerSession:
					Math.round(stats.averageEventsPerSession * 100) / 100,
				sessionsWithCharts: stats.sessionsWithCharts,
				chartAdoptionRate:
					(stats.sessionsWithCharts / stats.totalSessions) * 100 || 0,
			},
		});
	} catch (error) {
		console.error("Error getting user engagement stats:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to get user engagement stats" },
			{ status: 500 }
		);
	}
}

async function getErrorAnalysis(startDate?: string, endDate?: string) {
	try {
		const db = await getDatabase();
		const collection = db.collection<AnalyticsEvent>(COLLECTIONS.ANALYTICS);

		const filter: any = { "metadata.error": { $exists: true, $ne: null } };
		if (startDate && endDate) {
			filter.timestamp = {
				$gte: new Date(startDate),
				$lte: new Date(endDate),
			};
		}

		const errorEvents = await collection.find(filter).toArray();
		const errorCounts: { [key: string]: number } = {};

		errorEvents.forEach((event) => {
			const error = event.metadata.error;
			if (error) {
				errorCounts[error] = (errorCounts[error] || 0) + 1;
			}
		});

		const sortedErrors = Object.entries(errorCounts)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 10);

		return NextResponse.json({
			success: true,
			data: {
				totalErrors: errorEvents.length,
				topErrors: sortedErrors.map(([error, count]) => ({ error, count })),
			},
		});
	} catch (error) {
		console.error("Error getting error analysis:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to get error analysis" },
			{ status: 500 }
		);
	}
}

