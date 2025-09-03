import { getDatabase, COLLECTIONS } from "./mongodb";
import { ObjectId } from "mongodb";

export interface UserSession {
	_id?: ObjectId;
	sessionId: string;
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

	// Conversation history
	messages: Array<{
		id: string;
		content: string;
		role: "user" | "assistant";
		timestamp: Date;
	}>;

	// Chart references
	chartIds: string[];

	// Session metadata
	ipAddress?: string;
	userAgent?: string;
	isActive: boolean;
}

export class SessionService {
	/**
	 * Create a new session
	 */
	static async createSession(
		sessionId: string,
		metadata?: { ipAddress?: string; userAgent?: string }
	): Promise<UserSession | null> {
		try {
			const db = await getDatabase();
			const collection = db.collection<UserSession>(COLLECTIONS.SESSIONS);

			const now = new Date();
			const session: Omit<UserSession, "_id"> = {
				sessionId,
				createdAt: now,
				updatedAt: now,
				lastAccessedAt: now,
				messages: [],
				chartIds: [],
				isActive: true,
				...metadata,
			};

			const result = await collection.insertOne(session as UserSession);

			if (result.acknowledged) {
				return {
					_id: result.insertedId,
					...session,
				};
			}

			return null;
		} catch (error) {
			console.error("Error creating session:", error);
			return null;
		}
	}

	/**
	 * Get session by ID
	 */
	static async getSession(sessionId: string): Promise<UserSession | null> {
		try {
			const db = await getDatabase();
			const collection = db.collection<UserSession>(COLLECTIONS.SESSIONS);

			const session = await collection.findOne({ sessionId, isActive: true });

			if (session) {
				// Update last accessed time
				await collection.updateOne(
					{ sessionId },
					{ $set: { lastAccessedAt: new Date() } }
				);
			}

			return session;
		} catch (error) {
			console.error("Error getting session:", error);
			return null;
		}
	}

	/**
	 * Update session with birth details
	 */
	static async updateSessionBirthDetails(
		sessionId: string,
		birthDetails: UserSession["birthDetails"]
	): Promise<boolean> {
		try {
			const db = await getDatabase();
			const collection = db.collection<UserSession>(COLLECTIONS.SESSIONS);

			const result = await collection.updateOne(
				{ sessionId, isActive: true },
				{
					$set: {
						birthDetails,
						updatedAt: new Date(),
						lastAccessedAt: new Date(),
					},
				}
			);

			return result.modifiedCount > 0;
		} catch (error) {
			console.error("Error updating session birth details:", error);
			return false;
		}
	}

	/**
	 * Add message to session
	 */
	static async addMessageToSession(
		sessionId: string,
		message: {
			id: string;
			content: string;
			role: "user" | "assistant";
			timestamp: Date;
		}
	): Promise<boolean> {
		try {
			const db = await getDatabase();
			const collection = db.collection<UserSession>(COLLECTIONS.SESSIONS);

			const result = await collection.updateOne(
				{ sessionId, isActive: true },
				{
					$push: { messages: message },
					$set: {
						updatedAt: new Date(),
						lastAccessedAt: new Date(),
					},
				}
			);

			return result.modifiedCount > 0;
		} catch (error) {
			console.error("Error adding message to session:", error);
			return false;
		}
	}

	/**
	 * Add chart ID to session
	 */
	static async addChartToSession(
		sessionId: string,
		chartId: string
	): Promise<boolean> {
		try {
			const db = await getDatabase();
			const collection = db.collection<UserSession>(COLLECTIONS.SESSIONS);

			const result = await collection.updateOne(
				{ sessionId, isActive: true },
				{
					$addToSet: { chartIds: chartId }, // Use $addToSet to avoid duplicates
					$set: {
						updatedAt: new Date(),
						lastAccessedAt: new Date(),
					},
				}
			);

			return result.modifiedCount > 0;
		} catch (error) {
			console.error("Error adding chart to session:", error);
			return false;
		}
	}

	/**
	 * Get session messages
	 */
	static async getSessionMessages(
		sessionId: string
	): Promise<UserSession["messages"]> {
		try {
			const session = await this.getSession(sessionId);
			return session?.messages || [];
		} catch (error) {
			console.error("Error getting session messages:", error);
			return [];
		}
	}

	/**
	 * Extract birth details from session messages
	 */
	static extractBirthDetailsFromSession(
		session: UserSession
	): { date: string; time: string; place: string } | null {
		if (session.birthDetails) {
			// If we have structured birth details, use them
			const bd = session.birthDetails;
			const birthDate = new Date(bd.dateOfBirth);
			return {
				date: `${birthDate.getDate()}/${
					birthDate.getMonth() + 1
				}/${birthDate.getFullYear()}`,
				time: `${bd.timeOfBirth.hours}:${bd.timeOfBirth.minutes
					.toString()
					.padStart(2, "0")}`,
				place: bd.placeOfBirth.name,
			};
		}

		// Otherwise, extract from messages
		const combinedText = session.messages.map((m) => m.content).join(" ");

		// Look for birth detail patterns
		const datePattern = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/;
		const timePattern = /(\d{1,2}):(\d{2})(?::(\d{2}))?/;
		const birthDatePattern =
			/(?:Date of Birth|Birth Date|DOB).*?(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/i;
		const birthTimePattern =
			/(?:Time of Birth|Birth Time|TOB).*?(\d{1,2}):(\d{2})(?::(\d{2}))?/i;
		const birthPlacePattern =
			/(?:Place of Birth|Birth Place|POB).*?([A-Za-z\s,]+?)(?:\n|$)/i;

		const dateMatch =
			combinedText.match(birthDatePattern) || combinedText.match(datePattern);
		const timeMatch =
			combinedText.match(birthTimePattern) || combinedText.match(timePattern);
		const placeMatch = combinedText.match(birthPlacePattern);

		if (dateMatch && timeMatch) {
			let place = "Unknown";

			if (placeMatch) {
				place = placeMatch[1]
					.replace(/[*\n\r]/g, "")
					.trim()
					.replace(/\s+/g, " ");
			}

			return {
				date: `${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}`,
				time: `${timeMatch[1]}:${timeMatch[2]}`,
				place: place,
			};
		}

		return null;
	}

	/**
	 * Close/deactivate session
	 */
	static async closeSession(sessionId: string): Promise<boolean> {
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

			return result.modifiedCount > 0;
		} catch (error) {
			console.error("Error closing session:", error);
			return false;
		}
	}

	/**
	 * Clean up old sessions
	 */
	static async cleanupOldSessions(daysOld: number = 7): Promise<number> {
		try {
			const db = await getDatabase();
			const collection = db.collection<UserSession>(COLLECTIONS.SESSIONS);

			const cutoffDate = new Date();
			cutoffDate.setDate(cutoffDate.getDate() - daysOld);

			const result = await collection.deleteMany({
				lastAccessedAt: { $lt: cutoffDate },
				isActive: false,
			});

			return result.deletedCount || 0;
		} catch (error) {
			console.error("Error cleaning up old sessions:", error);
			return 0;
		}
	}

	/**
	 * Get session statistics
	 */
	static async getSessionStats(): Promise<{
		totalSessions: number;
		activeSessions: number;
		averageMessagesPerSession: number;
	}> {
		try {
			const db = await getDatabase();
			const collection = db.collection<UserSession>(COLLECTIONS.SESSIONS);

			const totalSessions = await collection.countDocuments();
			const activeSessions = await collection.countDocuments({
				isActive: true,
			});

			const avgResult = await collection
				.aggregate([
					{
						$group: {
							_id: null,
							avgMessages: { $avg: { $size: "$messages" } },
						},
					},
				])
				.toArray();

			const averageMessagesPerSession = avgResult[0]?.avgMessages || 0;

			return {
				totalSessions,
				activeSessions,
				averageMessagesPerSession:
					Math.round(averageMessagesPerSession * 100) / 100,
			};
		} catch (error) {
			console.error("Error getting session stats:", error);
			return {
				totalSessions: 0,
				activeSessions: 0,
				averageMessagesPerSession: 0,
			};
		}
	}
}
