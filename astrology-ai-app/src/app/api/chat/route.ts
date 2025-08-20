import { generateAstrologyResponse } from "@/lib/astrology-engine";
import { type UIMessage } from "ai";

export const runtime = "edge";

export async function POST(req: Request) {
	const {
		messages,
		stream = false,
	}: { messages: UIMessage[]; stream?: boolean } = await req.json();

	try {
		// For streaming requests
		if (stream) {
			const encoder = new TextEncoder();

			const stream = new ReadableStream({
				async start(controller) {
					try {
						// Send immediate acknowledgment
						controller.enqueue(
							encoder.encode(
								JSON.stringify({
									type: "status",
									message: "Processing your request...",
									timestamp: Date.now(),
								}) + "\n"
							)
						);

						// Brief delay to show processing state
						await new Promise((resolve) => setTimeout(resolve, 500));

						// Send chart calculation status
						controller.enqueue(
							encoder.encode(
								JSON.stringify({
									type: "status",
									message: "Calculating birth chart...",
									timestamp: Date.now(),
								}) + "\n"
							)
						);

						// Generate response
						const response = await generateAstrologyResponse(messages);

						// Send chart data if available
						if (
							response &&
							typeof response === "object" &&
							"chartData" in response &&
							response.chartData
						) {
							controller.enqueue(
								encoder.encode(
									JSON.stringify({
										type: "chart",
										data: response.chartData,
										timestamp: Date.now(),
									}) + "\n"
								)
							);
						}

						// Send AI generation status
						controller.enqueue(
							encoder.encode(
								JSON.stringify({
									type: "status",
									message: "Generating personalized insights...",
									timestamp: Date.now(),
								}) + "\n"
							)
						);

						// Send final response
						if (
							response &&
							typeof response === "object" &&
							"text" in response
						) {
							controller.enqueue(
								encoder.encode(
									JSON.stringify({
										type: "response",
										text: response.text,
										chartData:
											"chartData" in response ? response.chartData : null,
										timestamp: Date.now(),
									}) + "\n"
								)
							);
						}

						controller.close();
					} catch (error) {
						console.error("Streaming error:", error);
						controller.enqueue(
							encoder.encode(
								JSON.stringify({
									type: "error",
									message: "Error generating insights",
									timestamp: Date.now(),
								}) + "\n"
							)
						);
						controller.close();
					}
				},
			});

			return new Response(stream, {
				headers: {
					"Content-Type": "application/x-ndjson",
					"Cache-Control": "no-cache",
					Connection: "keep-alive",
				},
			});
		}

		// For non-streaming requests (backward compatibility)
		const response = await generateAstrologyResponse(messages);

		// Handle both old string format and new object format
		if (typeof response === "string") {
			return new Response(JSON.stringify({ text: response }), {
				headers: { "Content-Type": "application/json" },
			});
		} else {
			// Extract just the text from the response object
			if (response && typeof response === "object" && "text" in response) {
				return new Response(
					JSON.stringify({
						text: response.text,
						chartData: "chartData" in response ? response.chartData : null,
					}),
					{
						headers: { "Content-Type": "application/json" },
					}
				);
			} else {
				return new Response(
					JSON.stringify({ text: response || "No response generated" }),
					{
						headers: { "Content-Type": "application/json" },
					}
				);
			}
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
