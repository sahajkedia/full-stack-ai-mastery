import { NextResponse } from "next/server";
import { AstrologyAPI } from "@/lib/astrology-api";

// Force this API route to use Node.js runtime for crypto module support
export const runtime = "nodejs";

export async function GET() {
	try {
		const stats = await AstrologyAPI.getApiStats();

		return NextResponse.json({
			success: true,
			data: {
				totalCharts: stats.totalCharts,
				totalApiCallsSaved: stats.totalApiCallsSaved,
				mostAccessedChart: stats.mostAccessedChart,
				cacheEfficiency:
					stats.totalCharts > 0
						? (
								(stats.totalApiCallsSaved /
									(stats.totalCharts + stats.totalApiCallsSaved)) *
								100
						  ).toFixed(2)
						: "0.00",
			},
		});
	} catch (error) {
		console.error("Stats retrieval error:", error);

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
