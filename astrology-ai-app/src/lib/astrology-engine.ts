import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { type UIMessage } from "ai";
import { generateBirthChart, type BirthDetails } from "./chart-calculator";
import {
	buildSpecializedPrompt,
	type AstrologicalContext,
} from "./prompt-engine";

// Enhanced Vedic Astrology Knowledge Base
const NAKSHATRAS = [
	"Ashwini",
	"Bharani",
	"Krittika",
	"Rohini",
	"Mrigashira",
	"Ardra",
	"Punarvasu",
	"Pushya",
	"Ashlesha",
	"Magha",
	"Purva Phalguni",
	"Uttara Phalguni",
	"Hasta",
	"Chitra",
	"Swati",
	"Vishakha",
	"Anuradha",
	"Jyeshtha",
	"Mula",
	"Purva Ashadha",
	"Uttara Ashadha",
	"Shravana",
	"Dhanishta",
	"Shatabhisha",
	"Purva Bhadrapada",
	"Uttara Bhadrapada",
	"Revati",
];

const PLANETS = {
	Sun: {
		symbol: "☉",
		color: "text-orange-500",
		nature: "Sattvic",
		element: "Fire",
		exaltation: "Aries 10°",
		debilitation: "Libra 10°",
		ownSign: "Leo",
		friends: ["Mars", "Jupiter"],
		enemies: ["Venus", "Saturn"],
		neutral: ["Mercury"],
	},
	Moon: {
		symbol: "☽",
		color: "text-white",
		nature: "Sattvic",
		element: "Water",
		exaltation: "Taurus 3°",
		debilitation: "Scorpio 3°",
		ownSign: "Cancer",
		friends: ["Mercury", "Venus"],
		enemies: ["Sun", "Mars"],
		neutral: ["Jupiter", "Saturn"],
	},
	Mars: {
		symbol: "♂",
		color: "text-red-500",
		nature: "Tamasic",
		element: "Fire",
		exaltation: "Capricorn 28°",
		debilitation: "Cancer 28°",
		ownSign: "Aries, Scorpio",
		friends: ["Sun", "Jupiter"],
		enemies: ["Mercury", "Venus"],
		neutral: ["Moon", "Saturn"],
	},
	Mercury: {
		symbol: "☿",
		color: "text-green-500",
		nature: "Rajasic",
		element: "Earth",
		exaltation: "Virgo 15°",
		debilitation: "Pisces 15°",
		ownSign: "Gemini, Virgo",
		friends: ["Venus", "Saturn"],
		enemies: ["Sun", "Mars"],
		neutral: ["Moon", "Jupiter"],
	},
	Jupiter: {
		symbol: "♃",
		color: "text-yellow-500",
		nature: "Sattvic",
		element: "Ether",
		exaltation: "Cancer 5°",
		debilitation: "Capricorn 5°",
		ownSign: "Sagittarius, Pisces",
		friends: ["Sun", "Mars"],
		enemies: ["Mercury", "Venus"],
		neutral: ["Moon", "Saturn"],
	},
	Venus: {
		symbol: "♀",
		color: "text-pink-500",
		nature: "Rajasic",
		element: "Water",
		exaltation: "Pisces 27°",
		debilitation: "Virgo 27°",
		ownSign: "Taurus, Libra",
		friends: ["Mercury", "Saturn"],
		enemies: ["Sun", "Mars"],
		neutral: ["Moon", "Jupiter"],
	},
	Saturn: {
		symbol: "♄",
		color: "text-blue-500",
		nature: "Tamasic",
		element: "Air",
		exaltation: "Libra 20°",
		debilitation: "Aries 20°",
		ownSign: "Capricorn, Aquarius",
		friends: ["Mercury", "Venus"],
		enemies: ["Sun", "Mars"],
		neutral: ["Moon", "Jupiter"],
	},
	Rahu: {
		symbol: "☊",
		color: "text-purple-500",
		nature: "Tamasic",
		element: "Shadow",
		exaltation: "Taurus 20°",
		debilitation: "Scorpio 20°",
		ownSign: "Aquarius",
		friends: ["Venus", "Saturn"],
		enemies: ["Sun", "Moon"],
		neutral: ["Mars", "Mercury", "Jupiter"],
	},
	Ketu: {
		symbol: "☋",
		color: "text-gray-500",
		nature: "Tamasic",
		element: "Shadow",
		exaltation: "Scorpio 20°",
		debilitation: "Taurus 20°",
		ownSign: "Scorpio",
		friends: ["Mars", "Saturn"],
		enemies: ["Sun", "Moon"],
		neutral: ["Mercury", "Venus", "Jupiter"],
	},
};

const HOUSES = {
	1: {
		name: "Ascendant (Lagna)",
		significations: [
			"Self",
			"Personality",
			"Physical body",
			"Appearance",
			"Health",
			"Vitality",
		],
		nature: "Kendra",
		karaka: "Sun",
	},
	2: {
		name: "Wealth (Dhana)",
		significations: ["Family", "Wealth", "Speech", "Food", "Eyes", "Face"],
		nature: "Dusthana",
		karaka: "Jupiter",
	},
	3: {
		name: "Siblings (Sahaja)",
		significations: [
			"Courage",
			"Siblings",
			"Short journeys",
			"Communication",
			"Arms",
			"Neck",
		],
		nature: "Upachaya",
		karaka: "Mars",
	},
	4: {
		name: "Mother (Matru)",
		significations: [
			"Mother",
			"Home",
			"Vehicles",
			"Happiness",
			"Education",
			"Land",
		],
		nature: "Kendra",
		karaka: "Moon",
	},
	5: {
		name: "Children (Putra)",
		significations: [
			"Children",
			"Intelligence",
			"Education",
			"Romance",
			"Speculation",
			"Creativity",
		],
		nature: "Trikona",
		karaka: "Jupiter",
	},
	6: {
		name: "Enemies (Shatru)",
		significations: [
			"Enemies",
			"Diseases",
			"Debts",
			"Service",
			"Litigation",
			"Obstacles",
		],
		nature: "Dusthana",
		karaka: "Mars",
	},
	7: {
		name: "Spouse (Kalatra)",
		significations: [
			"Spouse",
			"Partnership",
			"Marriage",
			"Business",
			"Foreign lands",
			"Sexual life",
		],
		nature: "Kendra",
		karaka: "Venus",
	},
	8: {
		name: "Longevity (Ayush)",
		significations: [
			"Longevity",
			"Obstacles",
			"Mysteries",
			"Transformation",
			"Occult",
			"Accidents",
		],
		nature: "Dusthana",
		karaka: "Saturn",
	},
	9: {
		name: "Dharma (Bhagya)",
		significations: [
			"Dharma",
			"Religion",
			"Guru",
			"Long journeys",
			"Father",
			"Luck",
		],
		nature: "Trikona",
		karaka: "Jupiter",
	},
	10: {
		name: "Career (Karma)",
		significations: [
			"Career",
			"Profession",
			"Authority",
			"Government",
			"Honor",
			"Status",
		],
		nature: "Kendra",
		karaka: "Sun",
	},
	11: {
		name: "Income (Labha)",
		significations: [
			"Income",
			"Gains",
			"Friends",
			"Desires",
			"Elder siblings",
			"Wishes",
		],
		nature: "Upachaya",
		karaka: "Jupiter",
	},
	12: {
		name: "Expenses (Vyaya)",
		significations: [
			"Expenses",
			"Losses",
			"Bed pleasures",
			"Foreign lands",
			"Moksha",
			"Hospitalization",
		],
		nature: "Dusthana",
		karaka: "Saturn",
	},
};

// Enhanced System Prompt moved to prompt-engine.ts for better organization

// Helper functions for enhanced analysis
function extractBirthDetails(userInput: string) {
	console.log("Extracting birth details from:", userInput);

	// More flexible patterns to handle various formats
	const datePattern = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/;
	const timePattern = /(\d{1,2}):(\d{2})/;
	// More flexible place pattern to handle various formats
	const placePattern = /([A-Za-z\s]+),\s*([A-Za-z\s]+)(?:,\s*([A-Za-z\s]+))?/;

	const dateMatch = userInput.match(datePattern);
	const timeMatch = userInput.match(timePattern);
	const placeMatch = userInput.match(placePattern);

	console.log("Date match:", dateMatch);
	console.log("Time match:", timeMatch);
	console.log("Place match:", placeMatch);

	if (dateMatch && timeMatch && placeMatch) {
		const result = {
			date: `${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}`,
			time: `${timeMatch[1]}:${timeMatch[2]}`,
			place: placeMatch[0],
		};
		console.log("Birth details extracted successfully:", result);
		return result;
	}

	// Fallback: Try to extract from comma-separated format
	console.log("Trying fallback extraction...");
	const parts = userInput.split(",").map((part) => part.trim());
	console.log("Split parts:", parts);

	if (parts.length >= 3) {
		// Try to parse date from first part
		const datePart = parts[0];
		const dateMatch2 = datePart.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);

		// Try to parse time from second part
		const timePart = parts[1];
		const timeMatch2 = timePart.match(/(\d{1,2}):(\d{2})/);

		if (dateMatch2 && timeMatch2) {
			const result = {
				date: `${dateMatch2[1]}/${dateMatch2[2]}/${dateMatch2[3]}`,
				time: `${timeMatch2[1]}:${timeMatch2[2]}`,
				place: parts.slice(2).join(", "),
			};
			console.log("Birth details extracted with fallback:", result);
			return result;
		}
	}

	console.log("No birth details found in input");
	return null;
}

function determineQuestionType(userInput: string): string {
	const input = userInput.toLowerCase();

	if (
		input.includes("career") ||
		input.includes("job") ||
		input.includes("profession") ||
		input.includes("work")
	) {
		return "career";
	}
	if (
		input.includes("marriage") ||
		input.includes("relationship") ||
		input.includes("love") ||
		input.includes("spouse")
	) {
		return "relationship";
	}
	if (
		input.includes("health") ||
		input.includes("medical") ||
		input.includes("disease") ||
		input.includes("illness")
	) {
		return "health";
	}
	if (
		input.includes("finance") ||
		input.includes("money") ||
		input.includes("wealth") ||
		input.includes("income")
	) {
		return "finance";
	}
	if (
		input.includes("education") ||
		input.includes("study") ||
		input.includes("learning") ||
		input.includes("course")
	) {
		return "education";
	}
	if (
		input.includes("spiritual") ||
		input.includes("dharma") ||
		input.includes("moksha") ||
		input.includes("meditation")
	) {
		return "spiritual";
	}

	return "general";
}

function buildContextualPrompt(
	messages: UIMessage[],
	questionType: string,
	chartData?: {
		ascendant: { sign: string; degree: number };
		planets: Array<{
			name: string;
			sign: string;
			house: number;
			degree: number;
			nakshatra: string;
			isRetrograde: boolean;
		}>;
		currentDasha: {
			planet: string;
			startDate: string;
			endDate: string;
			subDasha: string;
		};
		yogas: string[];
	}
) {
	const birthDetails = extractBirthDetails(JSON.stringify(messages));

	// Extract content from messages safely
	const latestMessage = messages[messages.length - 1];
	const messageContent = (latestMessage as unknown as { content?: string })
		?.content;
	const latestMessageContent = (
		latestMessage as unknown as { content?: unknown }
	)?.content;
	const question =
		typeof messageContent === "string"
			? messageContent
			: JSON.stringify(latestMessageContent || "");

	const previousMessages = messages.slice(0, -1).map((m) => {
		const content = (m as unknown as { content?: string })?.content;
		const messageContentUnknown = (m as unknown as { content?: unknown })
			?.content;
		return typeof content === "string"
			? content
			: JSON.stringify(messageContentUnknown || "");
	});

	// Build enhanced astrological context
	const context: AstrologicalContext = {
		birthDetails: birthDetails || undefined,
		question,
		previousMessages,
		userPreferences: {
			detailLevel: "basic",
			focusAreas: [questionType],
			remedyPreference: "all",
		},
		chartData: chartData || undefined,
	};

	// Use the enhanced prompt engine
	return buildSpecializedPrompt(context);
}

export async function generateAstrologyResponse(messages: UIMessage[]) {
	try {
		// Extract the latest user message and convert to string
		const latestMessage = messages[messages.length - 1];
		let userInput = "";

		if (latestMessage && latestMessage.role === "user") {
			// Extract the actual content from the message
			userInput =
				(latestMessage as unknown as { content: string }).content || "";
		}

		// Determine question type for specialized analysis
		const questionType = determineQuestionType(userInput);

		// Check if we have birth details
		console.log("User input for birth details extraction:", userInput);
		const birthDetails = extractBirthDetails(userInput);
		const hasBirthDetails = birthDetails !== null;
		console.log("Birth details extracted:", birthDetails);
		console.log("Has birth details:", hasBirthDetails);
		console.log("User input length:", userInput.length);
		console.log("User input type:", typeof userInput);

		// Generate chart data if birth details are available
		let chartData = null;
		if (hasBirthDetails && birthDetails) {
			try {
				console.log("Generating chart with birth details:", birthDetails);
				chartData = generateBirthChart(birthDetails as BirthDetails);
				console.log("Chart data generated:", chartData);
				console.log("Chart data type:", typeof chartData);
				console.log("Chart data planets:", chartData?.planets);
			} catch (error) {
				console.error("Error generating chart:", error);
			}
		} else {
			console.log("No birth details available for chart generation");
		}

		// If no API key is available, use fallback responses
		if (!process.env.OPENAI_API_KEY) {
			const response = generateFallbackResponse(
				userInput,
				questionType,
				hasBirthDetails,
				birthDetails
			);

			return {
				text: response,
				chartData: chartData,
			};
		}

		// Build contextual prompt with chart data
		const contextualPrompt = buildContextualPrompt(
			messages,
			questionType,
			chartData || undefined
		);

		// Convert messages to proper format
		const formattedMessages = messages.map((msg) => {
			const content = (msg as unknown as { content?: string })?.content;
			const msgContent = (msg as unknown as { content?: unknown })?.content;
			return {
				role: msg.role,
				content:
					typeof content === "string"
						? content
						: JSON.stringify(msgContent || ""),
			};
		});

		const { text } = await generateText({
			model: openai("gpt-4-turbo"),
			system: contextualPrompt,
			messages: formattedMessages,
			temperature: 0.7, // Balanced creativity and accuracy
		});

		return {
			text: text,
			chartData: chartData,
		};
	} catch (error) {
		console.error("Astrology engine error:", error);
		const fallback = generateFallbackResponse("", "general", false, null);
		return {
			text: fallback,
			chartData: null,
		};
	}
}

function generateFallbackResponse(
	userInput: string,
	questionType: string,
	hasBirthDetails: boolean,
	birthDetails: { date: string; time: string; place: string } | null
) {
	// If no birth details provided, request them
	if (!hasBirthDetails) {
		return `Namaste 🙏 

Mujhe aapka birth details chahiye:
Date, time, place?

Example: 15/12/1990, 14:30, Mumbai`;
	}

	// Generate chart data if birth details are available
	let chartData = null;
	if (hasBirthDetails && birthDetails) {
		try {
			chartData = generateBirthChart(birthDetails as BirthDetails);
		} catch (error) {
			console.error("Error generating chart:", error);
		}
	}

	// If birth details are provided, provide specialized responses
	if (questionType === "health") {
		return `Wait, let me check your chart..

Do you have back pain or joint issues?

Your 6th house shows some health challenges. Saturn transit affecting you.

Good news - Jupiter helping with recovery.

Next 3-6 months gradual improvement coming.

Try Om Namah Shivaya daily. Yellow sapphire will help.`;
	}

	if (questionType === "career") {
		return `Checking your chart...

Your 10th house very strong. Leadership qualities hai.

Government job yoga in your chart.

Next 6 months new opportunities coming.

October-November time bahut acha for career.

Which field are you in?`;
	}

	if (questionType === "relationship") {
		return `Let me check...

Do you have any partner right now?

Your 7th house shows marriage yoga coming.

Avoid love relationships for now.

October-November me koi new person mil sakta hai.

Venus well placed in your chart.`;
	}

	// Default response for other question types
	return `Wait let me analyze...

Your chart shows good potential.

Jupiter transit bringing opportunities.

Next 6 months important time for you.

What do you want to know about?
Career, health, relationships?`;
}

// Export constants for use in components
export { PLANETS, HOUSES, NAKSHATRAS };
