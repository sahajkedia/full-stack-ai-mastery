import { NextRequest, NextResponse } from "next/server";
import { getDatabase, COLLECTIONS } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export interface UserSession {
	_id?: ObjectId;
	sessionId: string;
	userId?: string;
	createdAt: Date;
	updatedAt: Date;
	lastAccessedAt: Date;

	// User data
	birthDetails?: {
		name: string;
		gender: "male" | "female";
		dateOfBirth: Date;
		timeOfBirth: {
			hours: number;
			minutes: number;
			seconds: number;
		};
		placeOfBirth: {
			name: string;
			latitude: number;
			longitude: number;
			timezone: number;
		};
	};

	// Chart references
	chartIds: string[];
	currentChartId?: string;

	// Session metadata
	ipAddress?: string;
	userAgent?: string;
	isActive: boolean;
	metadata?: {
		preferences?: any;
		lastQuery?: string;
		sessionType?: "new_user" | "returning_user" | "guest";
	};
}

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { action, data } = body;

		switch (action) {
			case "create":
				return await createSession(data);
			case "updateBirthDetails":
				return await updateSessionBirthDetails(data);
			case "addChart":
				return await addChartToSession(data);
			case "setCurrentChart":
				return await setCurrentChart(data);
			case "updateMetadata":
				return await updateSessionMetadata(data);
			case "close":
				return await closeSession(data);
			default:
				return NextResponse.json(
					{ success: false, error: "Invalid action" },
					{ status: 400 }
				);
		}
	} catch (error) {
		console.error("Session API error:", error);
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
		const sessionId = searchParams.get("sessionId");
		const action = searchParams.get("action");

		if (action === "stats") {
			return await getSessionStats();
		}

		if (!sessionId) {
			return NextResponse.json(
				{ success: false, error: "Session ID is required" },
				{ status: 400 }
			);
		}

		return await getSession(sessionId);
	} catch (error) {
		console.error("Session API GET error:", error);
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

async function createSession(data: {
	sessionId: string;
	userId?: string;
	metadata?: any;
}) {
	try {
		const db = await getDatabase();
		const collection = db.collection<UserSession>(COLLECTIONS.SESSIONS);

		const now = new Date();
		const session: Omit<UserSession, "_id"> = {
			sessionId: data.sessionId,
			userId: data.userId,
			createdAt: now,
			updatedAt: now,
			lastAccessedAt: now,
			chartIds: [],
			isActive: true,
			metadata: {
				sessionType: data.userId ? "returning_user" : "new_user",
				...data.metadata,
			},
		};

		const result = await collection.insertOne(session as UserSession);

		if (result.acknowledged) {
			return NextResponse.json({
				success: true,
				data: {
					sessionId: result.insertedId.toString(),
					session: {
						_id: result.insertedId,
						...session,
					},
				},
			});
		}

		return NextResponse.json(
			{ success: false, error: "Failed to create session" },
			{ status: 500 }
		);
	} catch (error) {
		console.error("Error creating session:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to create session" },
			{ status: 500 }
		);
	}
}

async function getSession(sessionId: string) {
	try {
		const db = await getDatabase();
		const collection = db.collection<UserSession>(COLLECTIONS.SESSIONS);

		const session = await collection.findOne({ sessionId, isActive: true });

		if (!session) {
			return NextResponse.json(
				{ success: false, error: "Session not found" },
				{ status: 404 }
			);
		}

		// Update last accessed time
		await collection.updateOne(
			{ sessionId },
			{ $set: { lastAccessedAt: new Date() } }
		);

		// Remove sensitive information before sending
		const publicSession = {
			sessionId: session.sessionId,
			userId: session.userId,
			createdAt: session.createdAt,
			lastAccessedAt: session.lastAccessedAt,
			chartCount: session.chartIds.length,
			currentChartId: session.currentChartId,
			hasBirthDetails: !!session.birthDetails,
			isActive: session.isActive,
			metadata: session.metadata,
		};

		return NextResponse.json({
			success: true,
			data: publicSession,
		});
	} catch (error) {
		console.error("Error getting session:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to get session" },
			{ status: 500 }
		);
	}
}

async function updateSessionBirthDetails(data: {
	sessionId: string;
	birthDetails: UserSession["birthDetails"];
}) {
	try {
		const db = await getDatabase();
		const collection = db.collection<UserSession>(COLLECTIONS.SESSIONS);

		const result = await collection.updateOne(
			{ sessionId, isActive: true },
			{
				$set: {
					birthDetails: data.birthDetails,
					updatedAt: new Date(),
					lastAccessedAt: new Date(),
				},
			}
		);

		if (result.modifiedCount > 0) {
			return NextResponse.json({
				success: true,
				message: "Birth details updated successfully",
			});
		}

		return NextResponse.json(
			{ success: false, error: "Session not found or no changes made" },
			{ status: 404 }
		);
	} catch (error) {
		console.error("Error updating session birth details:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to update birth details" },
			{ status: 500 }
		);
	}
}

async function addChartToSession(data: { sessionId: string; chartId: string }) {
	try {
		const db = await getDatabase();
		const collection = db.collection<UserSession>(COLLECTIONS.SESSIONS);

		const result = await collection.updateOne(
			{ sessionId, isActive: true },
			{
				$addToSet: { chartIds: data.chartId },
				$set: {
					updatedAt: new Date(),
					lastAccessedAt: new Date(),
				},
			}
		);

		if (result.modifiedCount > 0) {
			return NextResponse.json({
				success: true,
				message: "Chart added to session successfully",
			});
		}

		return NextResponse.json(
			{ success: false, error: "Session not found or no changes made" },
			{ status: 404 }
		);
	} catch (error) {
		console.error("Error adding chart to session:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to add chart to session" },
			{ status: 500 }
		);
	}
}

async function setCurrentChart(data: { sessionId: string; chartId: string }) {
	try {
		const db = await getDatabase();
		const collection = db.collection<UserSession>(COLLECTIONS.SESSIONS);

		const result = await collection.updateOne(
			{ sessionId, isActive: true },
			{
				$set: {
					currentChartId: data.chartId,
					updatedAt: new Date(),
					lastAccessedAt: new Date(),
				},
			}
		);

		if (result.modifiedCount > 0) {
			return NextResponse.json({
				success: true,
				message: "Current chart updated successfully",
			});
		}

		return NextResponse.json(
			{ success: false, error: "Session not found or no changes made" },
			{ status: 404 }
		);
	} catch (error) {
		console.error("Error setting current chart:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to set current chart" },
			{ status: 500 }
		);
	}
}

async function updateSessionMetadata(data: {
	sessionId: string;
	metadata: Partial<UserSession["metadata"]>;
}) {
	try {
		const db = await getDatabase();
		const collection = db.collection<UserSession>(COLLECTIONS.SESSIONS);

		const result = await collection.updateOne(
			{ sessionId, isActive: true },
			{
				$set: {
					metadata: data.metadata,
					updatedAt: new Date(),
					lastAccessedAt: new Date(),
				},
			}
		);

		if (result.modifiedCount > 0) {
			return NextResponse.json({
				success: true,
				message: "Session metadata updated successfully",
			});
		}

		return NextResponse.json(
			{ success: false, error: "Session not found or no changes made" },
			{ status: 404 }
		);
	} catch (error) {
		console.error("Error updating session metadata:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to update session metadata" },
			{ status: 500 }
		);
	}
}

async function closeSession(data: { sessionId: string }) {
	try {
		const db = await getDatabase();
		const collection = db.collection<UserSession>(COLLECTIONS.SESSIONS);

		const result = await collection.updateOne(
			{ sessionId },
			{
				$set: {
					isActive: false,
					updatedAt: new Date(),
				},
			}
		);

		if (result.modifiedCount > 0) {
			return NextResponse.json({
				success: true,
				message: "Session closed successfully",
			});
		}

		return NextResponse.json(
			{ success: false, error: "Session not found" },
			{ status: 404 }
		);
	} catch (error) {
		console.error("Error closing session:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to close session" },
			{ status: 500 }
		);
	}
}

async function getSessionStats() {
	try {
		const db = await getDatabase();
		const collection = db.collection<UserSession>(COLLECTIONS.SESSIONS);

		const totalSessions = await collection.countDocuments();
		const activeSessions = await collection.countDocuments({ isActive: true });

		const avgResult = await collection
			.aggregate([
				{
					$group: {
						_id: null,
						avgCharts: { $avg: { $size: "$chartIds" } },
					},
				},
			])
			.toArray();

		const averageChartsPerSession = avgResult[0]?.avgCharts || 0;

		return NextResponse.json({
			success: true,
			data: {
				totalSessions,
				activeSessions,
				averageChartsPerSession:
					Math.round(averageChartsPerSession * 100) / 100,
			},
		});
	} catch (error) {
		console.error("Error getting session stats:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to get session stats" },
			{ status: 500 }
		);
	}
}

