import { generateAstrologyResponse } from "@/lib/astrology-engine";
import { type UIMessage } from "ai";

export const runtime = "nodejs";

export async function POST(req: Request) {
	const { messages, sessionId }: { messages: UIMessage[]; sessionId?: string } =
		await req.json();

	try {
		const response = await generateAstrologyResponse(messages, sessionId);

		// Handle both old string format and new object format
		if (typeof response === "string") {
			return new Response(JSON.stringify({ text: response }), {
				headers: { "Content-Type": "application/json" },
			});
		} else {
			// Extract just the text from the response object, don't include chart data
			return new Response(JSON.stringify({ text: response.text }), {
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
