import { NextRequest, NextResponse } from "next/server";
import { AstrologyAPI } from "@/lib/astrology-api";
import { BirthChartInput } from "@/types/astrology";

// Force this API route to use Node.js runtime for crypto module support
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		// Transform the request data to match our BirthChartInput interface
		const birthChartInput: BirthChartInput = {
			name: body.name,
			gender: body.gender,
			dateOfBirth: new Date(
				parseInt(body.year),
				parseInt(body.month) - 1, // JavaScript months are 0-indexed
				parseInt(body.day)
			),
			timeOfBirth: {
				hours: parseInt(body.hours) || 0,
				minutes: parseInt(body.minutes) || 0,
				seconds: parseInt(body.seconds) || 0,
			},
			placeOfBirth: {
				name: body.placeOfBirth,
				latitude: parseFloat(body.latitude),
				longitude: parseFloat(body.longitude),
				timezone: parseFloat(body.timezone) || 0,
			},
		};

		// Validate input
		const validation = AstrologyAPI.validateBirthDetails(birthChartInput);
		if (!validation.isValid) {
			return NextResponse.json(
				{
					success: false,
					error: "Validation failed",
					details: validation.errors,
				},
				{ status: 400 }
			);
		}

		// Calculate birth chart
		const chartData = await AstrologyAPI.calculateBirthChart(birthChartInput);

		if (!chartData) {
			return NextResponse.json(
				{
					success: false,
					error: "Failed to calculate birth chart",
				},
				{ status: 500 }
			);
		}

		// Format response
		const formattedChart = AstrologyAPI.formatChartForDisplay(chartData);

		return NextResponse.json({
			success: true,
			data: {
				chart: formattedChart,
				raw: chartData,
				cached: false, // Could be enhanced to detect if data was cached
			},
		});
	} catch (error) {
		console.error("Chart calculation error:", error);

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
		const chartId = searchParams.get("id");

		if (chartId) {
			// Get specific chart by ID
			const chart = await AstrologyAPI.getStoredChart(chartId);

			if (!chart) {
				return NextResponse.json(
					{ success: false, error: "Chart not found" },
					{ status: 404 }
				);
			}

			const formattedChart = AstrologyAPI.formatChartForDisplay(
				chart.chartData
			);

			return NextResponse.json({
				success: true,
				data: {
					id: chart._id?.toString(),
					input: chart.input,
					chart: formattedChart,
					createdAt: chart.createdAt,
					accessCount: chart.accessCount,
				},
			});
		} else {
			// Get recent charts
			const limit = parseInt(searchParams.get("limit") || "10");
			const recentCharts = await AstrologyAPI.getRecentCharts(limit);

			return NextResponse.json({
				success: true,
				data: recentCharts,
			});
		}
	} catch (error) {
		console.error("Chart retrieval error:", error);

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
