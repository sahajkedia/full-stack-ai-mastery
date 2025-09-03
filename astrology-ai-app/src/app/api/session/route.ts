import { NextRequest, NextResponse } from "next/server";
import { SessionService } from "@/lib/session-service";

// Force this API route to use Node.js runtime for crypto module support
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { sessionId, action, data } = body;

		if (!sessionId) {
			return NextResponse.json(
				{ success: false, error: "Session ID is required" },
				{ status: 400 }
			);
		}

		switch (action) {
			case "create":
				const session = await SessionService.createSession(sessionId, {
					ipAddress: request.headers.get("x-forwarded-for") || "unknown",
					userAgent: request.headers.get("user-agent") || "unknown",
				});

				return NextResponse.json({
					success: true,
					data: session,
				});

			case "updateBirthDetails":
				if (!data || !data.birthDetails) {
					return NextResponse.json(
						{ success: false, error: "Birth details are required" },
						{ status: 400 }
					);
				}

				const updated = await SessionService.updateSessionBirthDetails(
					sessionId,
					data.birthDetails
				);

				return NextResponse.json({
					success: updated,
					message: updated
						? "Birth details updated"
						: "Failed to update birth details",
				});

			case "addChart":
				if (!data || !data.chartId) {
					return NextResponse.json(
						{ success: false, error: "Chart ID is required" },
						{ status: 400 }
					);
				}

				const chartAdded = await SessionService.addChartToSession(
					sessionId,
					data.chartId
				);

				return NextResponse.json({
					success: chartAdded,
					message: chartAdded
						? "Chart added to session"
						: "Failed to add chart",
				});

			case "close":
				const closed = await SessionService.closeSession(sessionId);

				return NextResponse.json({
					success: closed,
					message: closed ? "Session closed" : "Failed to close session",
				});

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
			const stats = await SessionService.getSessionStats();
			return NextResponse.json({
				success: true,
				data: stats,
			});
		}

		if (!sessionId) {
			return NextResponse.json(
				{ success: false, error: "Session ID is required" },
				{ status: 400 }
			);
		}

		const session = await SessionService.getSession(sessionId);

		if (!session) {
			return NextResponse.json(
				{ success: false, error: "Session not found" },
				{ status: 404 }
			);
		}

		// Remove sensitive information before sending
		const publicSession = {
			sessionId: session.sessionId,
			createdAt: session.createdAt,
			lastAccessedAt: session.lastAccessedAt,
			messageCount: session.messages.length,
			chartCount: session.chartIds.length,
			hasBirthDetails: !!session.birthDetails,
			isActive: session.isActive,
		};

		return NextResponse.json({
			success: true,
			data: publicSession,
		});
	} catch (error) {
		console.error("Session retrieval error:", error);

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
