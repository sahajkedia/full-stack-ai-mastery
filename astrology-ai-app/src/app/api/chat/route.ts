import { generateAstrologyResponse } from "@/lib/astrology-engine";
import { type UIMessage } from "ai";

export const runtime = "edge";

export async function POST(req: Request) {
	const { messages }: { messages: UIMessage[] } = await req.json();

	try {
		const response = await generateAstrologyResponse(messages);
		
		// Handle both old string format and new object format
		if (typeof response === "string") {
			return new Response(JSON.stringify({ text: response }), {
				headers: { "Content-Type": "application/json" },
			});
		} else {
			// Extract just the text from the response object
			return new Response(JSON.stringify({ text: response.text, chartData: response.chartData }), {
				headers: { "Content-Type": "application/json" },
			});
		}
	} catch (error) {
		console.error("Astrology engine error:", error);
		return new Response(
			JSON.stringify({
				error: "Error generating astrology insights",
			}),
			{ status: 500 }
		);
	}
}
