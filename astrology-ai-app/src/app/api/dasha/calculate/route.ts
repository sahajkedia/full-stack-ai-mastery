import { NextRequest, NextResponse } from "next/server";
import { DashaService } from "@/lib/dasha-service";
import { BirthChartInput } from "@/types/astrology";

// Force this API route to use Node.js runtime
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

		// Optional event date for dasha calculation
		const eventDate = body.eventDate ? new Date(body.eventDate) : undefined;

		// Calculate dasha information
		const dashaData = await DashaService.calculateDasha(
			birthChartInput,
			eventDate
		);

		if (!dashaData) {
			return NextResponse.json(
				{
					success: false,
					error: "Failed to calculate dasha information",
				},
				{ status: 500 }
			);
		}

		// Validate dasha data
		const validation = DashaService.validateDashaData(dashaData);
		if (!validation.isValid) {
			return NextResponse.json(
				{
					success: false,
					error: "Dasha data validation failed",
					details: validation.errors,
				},
				{ status: 400 }
			);
		}

		// Format response
		const formattedDasha = DashaService.formatDashaForDisplay(dashaData);

		return NextResponse.json({
			success: true,
			data: {
				dasha: formattedDasha,
				raw: dashaData,
			},
		});
	} catch (error) {
		console.error("Dasha calculation error:", error);

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
		const planet = searchParams.get("planet");

		if (planet) {
			// Get dasha description for a specific planet
			const description = DashaService.getDashaDescription(planet);

			return NextResponse.json({
				success: true,
				data: {
					planet,
					description,
				},
			});
		} else {
			// Get all available dasha descriptions
			const planets = [
				"Sun",
				"Moon",
				"Mars",
				"Mercury",
				"Jupiter",
				"Venus",
				"Saturn",
				"Rahu",
				"Ketu",
			];

			const descriptions = planets.map((planet) => ({
				planet,
				description: DashaService.getDashaDescription(planet),
			}));

			return NextResponse.json({
				success: true,
				data: descriptions,
			});
		}
	} catch (error) {
		console.error("Dasha description error:", error);

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
