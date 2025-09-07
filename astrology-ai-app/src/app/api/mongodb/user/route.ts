import { NextRequest, NextResponse } from "next/server";
import { getDatabase, COLLECTIONS } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { BirthChartInput, StoredBirthChart } from "@/types/astrology";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { action, data } = body;

		switch (action) {
			case "saveBirthChart":
				return await saveBirthChart(data);
			case "getUserCharts":
				return await getUserCharts(data);
			case "updateChart":
				return await updateChart(data);
			case "deleteChart":
				return await deleteChart(data);
			default:
				return NextResponse.json(
					{ success: false, error: "Invalid action" },
					{ status: 400 }
				);
		}
	} catch (error) {
		console.error("User API error:", error);
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
		const userId = searchParams.get("userId");
		const chartId = searchParams.get("chartId");

		if (chartId) {
			return await getChartById(chartId);
		}

		if (userId) {
			return await getUserCharts({ userId });
		}

		return NextResponse.json(
			{ success: false, error: "Missing userId or chartId parameter" },
			{ status: 400 }
		);
	} catch (error) {
		console.error("User API GET error:", error);
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

async function saveBirthChart(data: {
	userId: string;
	birthChart: StoredBirthChart;
}) {
	try {
		const db = await getDatabase();
		const collection = db.collection(COLLECTIONS.BIRTH_CHARTS);

		const now = new Date();
		const chartDocument = {
			...data.birthChart,
			userId: data.userId,
			createdAt: now,
			updatedAt: now,
		};

		const result = await collection.insertOne(chartDocument);

		if (result.acknowledged) {
			return NextResponse.json({
				success: true,
				data: {
					chartId: result.insertedId.toString(),
					message: "Birth chart saved successfully",
				},
			});
		}

		return NextResponse.json(
			{ success: false, error: "Failed to save birth chart" },
			{ status: 500 }
		);
	} catch (error) {
		console.error("Error saving birth chart:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to save birth chart" },
			{ status: 500 }
		);
	}
}

async function getUserCharts(data: { userId: string }) {
	try {
		const db = await getDatabase();
		const collection = db.collection(COLLECTIONS.BIRTH_CHARTS);

		const charts = await collection
			.find({ userId: data.userId })
			.sort({ createdAt: -1 })
			.toArray();

		return NextResponse.json({
			success: true,
			data: charts,
		});
	} catch (error) {
		console.error("Error getting user charts:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to get user charts" },
			{ status: 500 }
		);
	}
}

async function getChartById(chartId: string) {
	try {
		const db = await getDatabase();
		const collection = db.collection(COLLECTIONS.BIRTH_CHARTS);

		const chart = await collection.findOne({ _id: new ObjectId(chartId) });

		if (!chart) {
			return NextResponse.json(
				{ success: false, error: "Chart not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			data: chart,
		});
	} catch (error) {
		console.error("Error getting chart by ID:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to get chart" },
			{ status: 500 }
		);
	}
}

async function updateChart(data: {
	chartId: string;
	updates: Partial<StoredBirthChart>;
}) {
	try {
		const db = await getDatabase();
		const collection = db.collection(COLLECTIONS.BIRTH_CHARTS);

		const result = await collection.updateOne(
			{ _id: new ObjectId(data.chartId) },
			{
				$set: {
					...data.updates,
					updatedAt: new Date(),
				},
			}
		);

		if (result.modifiedCount > 0) {
			return NextResponse.json({
				success: true,
				message: "Chart updated successfully",
			});
		}

		return NextResponse.json(
			{ success: false, error: "Chart not found or no changes made" },
			{ status: 404 }
		);
	} catch (error) {
		console.error("Error updating chart:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to update chart" },
			{ status: 500 }
		);
	}
}

async function deleteChart(data: { chartId: string }) {
	try {
		const db = await getDatabase();
		const collection = db.collection(COLLECTIONS.BIRTH_CHARTS);

		const result = await collection.deleteOne({
			_id: new ObjectId(data.chartId),
		});

		if (result.deletedCount > 0) {
			return NextResponse.json({
				success: true,
				message: "Chart deleted successfully",
			});
		}

		return NextResponse.json(
			{ success: false, error: "Chart not found" },
			{ status: 404 }
		);
	} catch (error) {
		console.error("Error deleting chart:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to delete chart" },
			{ status: 500 }
		);
	}
}

