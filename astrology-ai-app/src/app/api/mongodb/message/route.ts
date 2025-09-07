import { NextRequest, NextResponse } from "next/server";
import { getDatabase, COLLECTIONS } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export interface ChatMessage {
	_id?: ObjectId;
	sessionId: string;
	userId?: string;
	content: string;
	role: "user" | "assistant";
	timestamp: Date;
	metadata?: {
		chartData?: any;
		birthDetails?: any;
		messageType?: "text" | "chart" | "birth_details";
	};
}

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { action, data } = body;

		switch (action) {
			case "saveMessage":
				return await saveMessage(data);
			case "saveMessages":
				return await saveMessages(data);
			case "getSessionMessages":
				return await getSessionMessages(data);
			case "deleteMessage":
				return await deleteMessage(data);
			default:
				return NextResponse.json(
					{ success: false, error: "Invalid action" },
					{ status: 400 }
				);
		}
	} catch (error) {
		console.error("Message API error:", error);
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
		const messageId = searchParams.get("messageId");
		const limit = parseInt(searchParams.get("limit") || "50");

		if (messageId) {
			return await getMessageById(messageId);
		}

		if (sessionId) {
			return await getSessionMessages({ sessionId, limit });
		}

		return NextResponse.json(
			{ success: false, error: "Missing sessionId or messageId parameter" },
			{ status: 400 }
		);
	} catch (error) {
		console.error("Message API GET error:", error);
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

async function saveMessage(data: {
	sessionId: string;
	userId?: string;
	content: string;
	role: "user" | "assistant";
	metadata?: any;
}) {
	try {
		const db = await getDatabase();
		const collection = db.collection<ChatMessage>(COLLECTIONS.MESSAGES);

		const message: Omit<ChatMessage, "_id"> = {
			sessionId: data.sessionId,
			userId: data.userId,
			content: data.content,
			role: data.role,
			timestamp: new Date(),
			metadata: data.metadata || {},
		};

		const result = await collection.insertOne(message);

		if (result.acknowledged) {
			return NextResponse.json({
				success: true,
				data: {
					messageId: result.insertedId.toString(),
					message: "Message saved successfully",
				},
			});
		}

		return NextResponse.json(
			{ success: false, error: "Failed to save message" },
			{ status: 500 }
		);
	} catch (error) {
		console.error("Error saving message:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to save message" },
			{ status: 500 }
		);
	}
}

async function saveMessages(data: {
	sessionId: string;
	userId?: string;
	messages: Array<{
		content: string;
		role: "user" | "assistant";
		metadata?: any;
	}>;
}) {
	try {
		const db = await getDatabase();
		const collection = db.collection<ChatMessage>(COLLECTIONS.MESSAGES);

		const messages: Omit<ChatMessage, "_id">[] = data.messages.map((msg) => ({
			sessionId: data.sessionId,
			userId: data.userId,
			content: msg.content,
			role: msg.role,
			timestamp: new Date(),
			metadata: msg.metadata || {},
		}));

		const result = await collection.insertMany(messages);

		if (result.acknowledged) {
			return NextResponse.json({
				success: true,
				data: {
					insertedCount: result.insertedCount,
					message: `${result.insertedCount} messages saved successfully`,
				},
			});
		}

		return NextResponse.json(
			{ success: false, error: "Failed to save messages" },
			{ status: 500 }
		);
	} catch (error) {
		console.error("Error saving messages:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to save messages" },
			{ status: 500 }
		);
	}
}

async function getSessionMessages(data: { sessionId: string; limit?: number }) {
	try {
		const db = await getDatabase();
		const collection = db.collection<ChatMessage>(COLLECTIONS.MESSAGES);

		const messages = await collection
			.find({ sessionId: data.sessionId })
			.sort({ timestamp: 1 })
			.limit(data.limit || 50)
			.toArray();

		return NextResponse.json({
			success: true,
			data: messages,
		});
	} catch (error) {
		console.error("Error getting session messages:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to get session messages" },
			{ status: 500 }
		);
	}
}

async function getMessageById(messageId: string) {
	try {
		const db = await getDatabase();
		const collection = db.collection<ChatMessage>(COLLECTIONS.MESSAGES);

		const message = await collection.findOne({ _id: new ObjectId(messageId) });

		if (!message) {
			return NextResponse.json(
				{ success: false, error: "Message not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			data: message,
		});
	} catch (error) {
		console.error("Error getting message by ID:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to get message" },
			{ status: 500 }
		);
	}
}

async function deleteMessage(data: { messageId: string }) {
	try {
		const db = await getDatabase();
		const collection = db.collection<ChatMessage>(COLLECTIONS.MESSAGES);

		const result = await collection.deleteOne({
			_id: new ObjectId(data.messageId),
		});

		if (result.deletedCount > 0) {
			return NextResponse.json({
				success: true,
				message: "Message deleted successfully",
			});
		}

		return NextResponse.json(
			{ success: false, error: "Message not found" },
			{ status: 404 }
		);
	} catch (error) {
		console.error("Error deleting message:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to delete message" },
			{ status: 500 }
		);
	}
}

