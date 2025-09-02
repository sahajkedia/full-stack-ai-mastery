import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { type UIMessage } from "ai";
import { generateBirthChart, type BirthDetails } from "./chart-calculator";
import {
	buildSpecializedPrompt,
	type AstrologicalContext,
} from "./prompt-engine";
import { AstrologyAPI } from "./astrology-api";
import { BirthChartInput } from "@/types/astrology";

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
function extractBirthDetailsFromText(text: string) {
	// More flexible patterns to handle various formats
	const datePattern = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/;
	const timePattern = /(\d{1,2}):(\d{2})(?::(\d{2}))?/;

	// Look for specific birth detail patterns in text
	const birthDatePattern =
		/(?:Date of Birth|Birth Date|DOB).*?(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/i;
	const birthTimePattern =
		/(?:Time of Birth|Birth Time|TOB).*?(\d{1,2}):(\d{2})(?::(\d{2}))?/i;
	const birthPlacePattern =
		/(?:Place of Birth|Birth Place|POB).*?([A-Za-z\s,]+?)(?:\n|$)/i;

	const dateMatch = text.match(birthDatePattern) || text.match(datePattern);
	const timeMatch = text.match(birthTimePattern) || text.match(timePattern);
	const placeMatch = text.match(birthPlacePattern);

	if (dateMatch && timeMatch) {
		let place = "Unknown";

		if (placeMatch) {
			// Clean up the place string
			place = placeMatch[1]
				.replace(/[*\n\r]/g, "")
				.trim()
				.replace(/\s+/g, " ");
		}

		const result = {
			date: `${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}`,
			time: `${timeMatch[1]}:${timeMatch[2]}`,
			place: place,
		};

		return result;
	}

	return null;
}

function extractBirthDetailsFromMessages(messages: UIMessage[]) {
	console.log("Extracting birth details from message history...");

	// Look through all messages for birth details
	for (let i = messages.length - 1; i >= 0; i--) {
		const message = messages[i];
		const content = (message as { content?: string }).content;
		if (content && typeof content === "string") {
			const birthDetails = extractBirthDetailsFromText(content);
			if (birthDetails) {
				console.log("Birth details found in message:", birthDetails);
				return birthDetails;
			}
		}
	}

	// Also try extracting from the stringified version of recent messages
	const recentMessages = messages.slice(-5); // Check last 5 messages
	const combinedText = recentMessages
		.map((m) => (m as { content?: string }).content)
		.filter(Boolean)
		.join(" ");

	const birthDetails = extractBirthDetailsFromText(combinedText);
	if (birthDetails) {
		console.log("Birth details found in combined text:", birthDetails);
		return birthDetails;
	}

	console.log("No birth details found in message history");
	return null;
}

function determineQuestionType(userInput: string): string {
	const input = userInput.toLowerCase();

	// Check for past-tense questions first
	if (
		input.match(
			/\b(last|past|ago|was|were|did|happened|why|earlier|before|previous)\b/
		)
	) {
		return "past_event";
	}

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
	const birthDetails = extractBirthDetailsFromText(JSON.stringify(messages));

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

	// Build enhanced astrological context with current date
	const currentDate = new Date().toISOString();
	const context: AstrologicalContext = {
		birthDetails: birthDetails || undefined,
		question,
		previousMessages,
		currentDate, // Add current date for accurate timing predictions
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

// Generate real birth chart using the astrology API
async function generateRealBirthChart(birthDetails: {
	date: string;
	time: string;
	place: string;
}) {
	try {
		// Parse birth details
		const [day, month, year] = birthDetails.date.split("/").map(Number);
		const [hours, minutes] = birthDetails.time.split(":").map(Number);

		// Create BirthChartInput for the API
		const birthChartInput: BirthChartInput = {
			name: "User", // Default name since we don't have it
			gender: "male", // Default gender
			dateOfBirth: new Date(year, month - 1, day), // month is 0-indexed in JS Date
			timeOfBirth: {
				hours: hours,
				minutes: minutes,
				seconds: 0,
			},
			placeOfBirth: {
				name: birthDetails.place,
				latitude: 25.7771, // Default to Purnia coordinates for now
				longitude: 87.4753,
				timezone: 5.5, // IST
			},
		};

		// Call the astrology API
		const apiResponse = await AstrologyAPI.calculateBirthChart(birthChartInput);

		if (!apiResponse) {
			throw new Error("Failed to get chart data from API");
		}

		// Transform API response to match the expected format
		const planets = Object.entries(apiResponse.output[1] || {}).map(
			([name, planetData]) => ({
				name: name,
				symbol: getSymbolForPlanet(name),
				sign: getSignName(planetData.current_sign),
				degree: planetData.normDegree,
				house: planetData.house_number || 1,
				nakshatra: getNakshatraFromDegree(planetData.fullDegree),
				pada: Math.floor((planetData.normDegree % 13.333) / 3.333) + 1,
				isRetrograde: planetData.isRetro === "true",
				dignity: "neutral" as const,
				strength: 50,
				lordOf: [],
				aspectsTo: [],
			})
		);

		// Get ascendant info
		const ascendantData =
			apiResponse.output[0]["0"] || apiResponse.output[1]["Ascendant"];
		const ascendantSign = getSignName(ascendantData.current_sign);

		return {
			ascendant: {
				degree: ascendantData.normDegree,
				sign: ascendantSign,
				nakshatra: getNakshatraFromDegree(ascendantData.fullDegree),
			},
			planets,
			houses: [], // Will be calculated if needed
			dashas: [],
			currentDasha: {
				planet: "Sun",
				startDate: "",
				endDate: "",
				subDasha: "Current",
			},
			yogas: [],
			birthNakshatra:
				planets.find((p) => p.name === "Moon")?.nakshatra || "Ashwini",
			chartStyle: "North Indian",
			calculationAccuracy: "Real API Data",
		};
	} catch (error) {
		console.error("Error generating real birth chart:", error);
		throw error;
	}
}

// Helper functions
function getSymbolForPlanet(name: string): string {
	const symbols: { [key: string]: string } = {
		Sun: "☉",
		Moon: "☽",
		Mars: "♂",
		Mercury: "☿",
		Jupiter: "♃",
		Venus: "♀",
		Saturn: "♄",
		Rahu: "☊",
		Ketu: "☋",
		Ascendant: "⇡",
		Uranus: "♅",
		Neptune: "♆",
		Pluto: "♇",
	};
	return symbols[name] || "●";
}

function getSignName(signNumber: number): string {
	const signs = [
		"Aries",
		"Taurus",
		"Gemini",
		"Cancer",
		"Leo",
		"Virgo",
		"Libra",
		"Scorpio",
		"Sagittarius",
		"Capricorn",
		"Aquarius",
		"Pisces",
	];
	return signs[(signNumber - 1) % 12] || "Aries";
}

function getNakshatraFromDegree(degree: number): string {
	const nakshatras = [
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
	const nakshatraIndex = Math.floor(degree / 13.333);
	return nakshatras[nakshatraIndex % 27] || "Ashwini";
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

		// Check if we have birth details from conversation history
		console.log("User input for birth details extraction:", userInput);
		const birthDetails = extractBirthDetailsFromMessages(messages);
		const hasBirthDetails = birthDetails !== null;
		console.log("Birth details extracted:", birthDetails);
		console.log("Has birth details:", hasBirthDetails);

		// Generate chart data if birth details are available
		let chartData = null;
		if (hasBirthDetails && birthDetails) {
			try {
				console.log("Generating chart with birth details:", birthDetails);
				chartData = await generateRealBirthChart(birthDetails);
				console.log("Chart data generated:", chartData);
				console.log("Chart data type:", typeof chartData);
				console.log("Chart data planets:", chartData?.planets);
			} catch (error) {
				console.error("Error generating chart:", error);
				// Fallback to mock data if API fails
				chartData = generateBirthChart(birthDetails as BirthDetails);
			}
		} else {
			console.log("No birth details available for chart generation");
		}

		// If no API key is available, use fallback responses
		if (!process.env.OPENAI_API_KEY) {
			const response = await generateFallbackResponse(
				userInput,
				questionType,
				hasBirthDetails,
				birthDetails
			);

			return {
				text: response,
				chartData: null, // Don't show chart data in conversations
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
			chartData: null, // Don't show chart data in conversations
		};
	} catch (error) {
		console.error("Astrology engine error:", error);
		const fallback = generateFallbackResponse("", "general", false, null);
		return {
			text: await fallback,
			chartData: null, // Don't show chart data in conversations
		};
	}
}

// Helper function to get next few months for timing predictions
function getNextFewMonths(date: Date, count: number): string {
	const months = [];
	for (let i = 1; i <= count; i++) {
		const nextMonth = new Date(date.getFullYear(), date.getMonth() + i, 1);
		months.push(nextMonth.toLocaleString("default", { month: "long" }));
	}
	return months.join("-");
}

// Helper function to get past few months for historical analysis
function getPastFewMonths(date: Date, count: number): string {
	const months = [];
	for (let i = 1; i <= count; i++) {
		const pastMonth = new Date(date.getFullYear(), date.getMonth() - i, 1);
		months.push(pastMonth.toLocaleString("default", { month: "long" }));
	}
	return months.reverse().join("-"); // Reverse to show chronological order
}

async function generateFallbackResponse(
	userInput: string,
	questionType: string,
	hasBirthDetails: boolean,
	birthDetails: { date: string; time: string; place: string } | null
) {
	const currentDate = new Date();
	const currentMonth = currentDate.toLocaleString("default", { month: "long" });
	const currentYear = currentDate.getFullYear();

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
			chartData = await generateRealBirthChart(birthDetails);
		} catch (error) {
			console.error("Error generating chart:", error);
			// Fallback to mock data if API fails
			chartData = generateBirthChart(birthDetails as BirthDetails);
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
		const nextMonths = getNextFewMonths(currentDate, 2);
		return `Checking your chart...

Your 10th house very strong. Leadership qualities hai.

Government job yoga in your chart.

Next 6 months new opportunities coming.

${nextMonths} time bahut acha for career.

Which field are you in?`;
	}

	if (questionType === "relationship") {
		const nextMonths = getNextFewMonths(currentDate, 2);
		return `Let me check...

Do you have any partner right now?

Your 7th house shows marriage yoga coming.

Avoid love relationships for now.

${nextMonths} me koi new person mil sakta hai.

Venus well placed in your chart.`;
	}

	if (questionType === "past_event") {
		const pastMonths = getPastFewMonths(currentDate, 3);
		return `Let me check your past periods...

${pastMonths} me kaun sa dasha chal raha tha?

Past events match your planetary periods.

Saturn transit was affecting you last year.

Which specific time you asking about?

What happened exactly?`;
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
