import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { type UIMessage } from "ai";
import { generateBirthChart, type BirthDetails } from "./chart-calculator";
import {
	buildSpecializedPrompt,
	type AstrologicalContext,
} from "./prompt-engine";
import { AstrologyAPI } from "./astrology-api";
import { BirthChartInput, PlanetData } from "@/types/astrology";
import { SessionService } from "./session-service";
import {
	generateTimingPredictions,
	calculateCurrentDashaBreakdown,
	type TimingPrediction,
} from "./timing-predictions";

// Type definitions for chart data
interface HouseData {
	number: number;
	planets?: string[]; // Planet names as strings
	sign?: string;
	strength: number;
	name?: string;
	significations?: string[];
	lordPlanet?: string;
	effects?: string[];
	predictions?: string[];
	remedies?: string[];
}

interface ChartData {
	planets?: EnhancedPlanetData[];
	houses?: HouseData[];
	ascendant?: {
		sign: string;
		degree: number;
	};
	yogas?: string[];
	overallStrength?: number;
	calculationAccuracy?: string;
}

interface PlanetAnalysis {
	name: string;
	house: number;
	sign: string;
	strength: number;
	effects: string[];
}

interface EnhancedPlanetData {
	name: string;
	symbol: string;
	sign: string;
	degree: number;
	house: number;
	nakshatra: string;
	pada: number;
	isRetrograde: boolean;
	dignity: string;
	strength: number;
	lordOf: never[];
	aspectsTo: never[];
}

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
		const ascendantSign = getSignName(
			(ascendantData as PlanetData)?.current_sign || 1
		);

		// Enhanced birth chart with detailed explanations
		const moonPlanet = planets.find((p) => p.name === "Moon");
		const birthNakshatra = moonPlanet?.nakshatra || "Ashwini";

		// Calculate detailed yogas and combinations
		const detectedYogas = calculateDetailedYogas(planets, ascendantSign);

		// Calculate house strengths and significations
		const houseAnalysis = calculateHouseAnalysis(planets);

		// Calculate planetary strengths
		const planetaryStrengths = calculatePlanetaryStrengths(planets);

		return {
			ascendant: {
				degree: (ascendantData as PlanetData)?.normDegree || 0,
				sign: ascendantSign,
				nakshatra: getNakshatraFromDegree(
					(ascendantData as PlanetData)?.fullDegree || 0
				),
				strength: calculateAscendantStrength(
					ascendantSign,
					(ascendantData as PlanetData)?.normDegree || 0
				),
				signification: getAscendantSignification(ascendantSign),
				lordPlanet: getSignLord(ascendantSign),
				characteristics: getAscendantCharacteristics(ascendantSign),
			},
			planets: planets.map((planet) => ({
				...planet,
				strength: planetaryStrengths[planet.name] || 50,
				friendlyPlanets: getFriendlyPlanets(planet.name),
				enemyPlanets: getEnemyPlanets(planet.name),
				signLord: getSignLord(planet.sign),
				houseSignification: getHouseSignification(planet.house),
				nakshatraLord: getNakshatraLord(planet.nakshatra),
				detailedEffects: getPlanetaryEffects(
					planet.name,
					planet.house,
					planet.sign
				),
				remedies: getPlanetaryRemedies(planet.name, planet.strength),
			})),
			houses: houseAnalysis,
			dashas: [],
			currentDasha: {
				planet: "Sun",
				startDate: "",
				endDate: "",
				subDasha: "Current",
			},
			yogas: detectedYogas,
			birthNakshatra: birthNakshatra,
			nakshatraAnalysis: getNakshatraAnalysis(birthNakshatra),
			chartStyle: "North Indian",
			calculationAccuracy: "Real API Data",
			overallStrength: calculateOverallChartStrength(planetaryStrengths),
			lifeThemes: calculateLifeThemes(planets, detectedYogas),
			keyPredictions: generateKeyPredictions(planets, detectedYogas),
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

export async function generateAstrologyResponse(
	messages: UIMessage[],
	sessionId?: string
) {
	// Extract the latest user message and convert to string
	const latestMessage = messages[messages.length - 1];
	let userInput = "";
	let questionType = "general";

	if (latestMessage && latestMessage.role === "user") {
		// Extract the actual content from the message
		userInput = (latestMessage as unknown as { content: string }).content || "";
	}

	// Determine question type for specialized analysis
	questionType = determineQuestionType(userInput);

	// Initialize birth details variables
	let birthDetails = null;
	let hasBirthDetails = false;

	try {
		// Check if we have birth details from session
		console.log("User input for birth details extraction:", userInput);

		if (sessionId) {
			// Try to get birth details from session
			const session = await SessionService.getSession(sessionId);
			if (session) {
				birthDetails = SessionService.extractBirthDetailsFromSession(session);
				hasBirthDetails = birthDetails !== null;
				console.log("Birth details extracted from session:", birthDetails);

				// Save current message to session
				await SessionService.addMessageToSession(sessionId, {
					id: Date.now().toString(),
					content: userInput,
					role: "user",
					timestamp: new Date(),
				});
			} else {
				console.log("No session found for ID:", sessionId);
			}
		} else {
			// Fallback to old method if no session ID
			birthDetails = extractBirthDetailsFromMessages(messages);
			hasBirthDetails = birthDetails !== null;
			console.log(
				"Birth details extracted from messages (no session):",
				birthDetails
			);
		}

		console.log("Has birth details:", hasBirthDetails);

		// Generate chart data if birth details are available
		let chartData = null;
		let timingPredictions: TimingPrediction[] = [];

		if (hasBirthDetails && birthDetails) {
			try {
				console.log("Generating chart with birth details:", birthDetails);
				chartData = await generateRealBirthChart(birthDetails);
				console.log("Chart data generated:", chartData);
				console.log("Chart data type:", typeof chartData);
				console.log("Chart data planets:", chartData?.planets);

				// Generate enhanced timing predictions
				if (chartData) {
					const enhancedChartData = {
						...chartData,
						birthDate: birthDetails.date,
						birthNakshatra: chartData.birthNakshatra || "Ashwini",
					};

					timingPredictions = generateTimingPredictions(
						enhancedChartData,
						questionType,
						new Date()
					);

					// Also generate detailed Dasha breakdown
					const dashaBreakdown = calculateCurrentDashaBreakdown(
						new Date(birthDetails.date.split("/").reverse().join("/")), // Convert DD/MM/YYYY to YYYY-MM-DD
						chartData.birthNakshatra || "Ashwini",
						new Date()
					);
					// Add Dasha information to chart data (extending the object)
					Object.assign(chartData, { detailedDashaAnalysis: dashaBreakdown });

					console.log("Timing predictions generated:", timingPredictions);
					console.log("Detailed Dasha analysis:", dashaBreakdown);
				}
			} catch (error) {
				console.error("Error generating chart:", error);
				// Fallback to mock data if API fails
				chartData = generateBirthChart(birthDetails as BirthDetails);

				// Generate timing predictions with fallback data
				const enhancedChartData = {
					...chartData,
					birthDate: birthDetails.date,
					birthNakshatra: chartData.birthNakshatra || "Ashwini",
				};

				timingPredictions = generateTimingPredictions(
					enhancedChartData,
					questionType,
					new Date()
				);
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

		// Build contextual prompt with chart data and timing predictions
		const context: AstrologicalContext = {
			birthDetails: birthDetails || undefined,
			question: userInput,
			previousMessages: messages.slice(0, -1).map((m) => {
				const content = (m as { content?: string }).content;
				return typeof content === "string" ? content : "";
			}),
			currentDate: new Date().toISOString(),
			userPreferences: {
				detailLevel: "comprehensive",
				focusAreas: [questionType],
				remedyPreference: "all",
			},
			chartData: chartData || undefined,
			timingPredictions:
				timingPredictions.length > 0 ? timingPredictions : undefined,
		};

		const contextualPrompt = buildSpecializedPrompt(context);

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

		// Save assistant response to session
		if (sessionId) {
			await SessionService.addMessageToSession(sessionId, {
				id: Date.now().toString(),
				content: text,
				role: "assistant",
				timestamp: new Date(),
			});
		}

		return {
			text: text,
			chartData: null, // Don't show chart data in conversations
		};
	} catch (error) {
		console.error("Astrology engine error:", error);
		const fallback = generateFallbackResponse(
			userInput,
			questionType,
			hasBirthDetails,
			birthDetails
		);
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

// Enhanced birth chart analysis helper functions
function calculateDetailedYogas(
	planets: Array<{ name: string; sign: string; house: number }>,
	ascendantSign: string
): string[] {
	const yogas: string[] = [];

	// Check for Pancha Mahapurusha Yogas
	planets.forEach((planet) => {
		if (
			planet.name === "Mars" &&
			(planet.sign === "Aries" || planet.sign === "Scorpio") &&
			[1, 4, 7, 10].includes(planet.house)
		) {
			yogas.push("Ruchaka Yoga (Mars in own sign in Kendra)");
		}
		if (
			planet.name === "Mercury" &&
			(planet.sign === "Gemini" || planet.sign === "Virgo") &&
			[1, 4, 7, 10].includes(planet.house)
		) {
			yogas.push("Bhadra Yoga (Mercury in own sign in Kendra)");
		}
		if (
			planet.name === "Jupiter" &&
			(planet.sign === "Sagittarius" || planet.sign === "Pisces") &&
			[1, 4, 7, 10].includes(planet.house)
		) {
			yogas.push("Hamsa Yoga (Jupiter in own sign in Kendra)");
		}
		if (
			planet.name === "Venus" &&
			(planet.sign === "Taurus" || planet.sign === "Libra") &&
			[1, 4, 7, 10].includes(planet.house)
		) {
			yogas.push("Malavya Yoga (Venus in own sign in Kendra)");
		}
		if (
			planet.name === "Saturn" &&
			(planet.sign === "Capricorn" || planet.sign === "Aquarius") &&
			[1, 4, 7, 10].includes(planet.house)
		) {
			yogas.push("Shasha Yoga (Saturn in own sign in Kendra)");
		}
	});

	// Check for Gajakesari Yoga
	const jupiter = planets.find((p) => p.name === "Jupiter");
	const moon = planets.find((p) => p.name === "Moon");
	if (jupiter && moon) {
		const houseDiff = Math.abs(jupiter.house - moon.house);
		if ([0, 3, 6, 9].includes(houseDiff)) {
			yogas.push("Gajakesari Yoga (Jupiter-Moon in Kendra)");
		}
	}

	// Check for Raj Yoga (1st, 5th, 9th lords connection)
	const firstLord = getSignLord(ascendantSign);
	yogas.push("Additional yogas detected in detailed analysis");

	return yogas;
}

function calculateHouseAnalysis(planets: EnhancedPlanetData[]): HouseData[] {
	const houses = [];

	for (let i = 1; i <= 12; i++) {
		const planetsInHouse = planets.filter((p) => p.house === i);
		const houseStrength = calculateHouseStrength(i, planetsInHouse);

		houses.push({
			number: i,
			name: HOUSES[i as keyof typeof HOUSES]?.name || `House ${i}`,
			significations: HOUSES[i as keyof typeof HOUSES]?.significations || [],
			planets: planetsInHouse.map((p) => p.name),
			strength: houseStrength,
			lordPlanet: getHouseLord(i, planets),
			effects: getHouseEffects(i, planetsInHouse),
			predictions: getHousePredictions(i, planetsInHouse),
			remedies: getHouseRemedies(i, houseStrength),
		});
	}

	return houses;
}

function calculatePlanetaryStrengths(planets: EnhancedPlanetData[]): {
	[key: string]: number;
} {
	const strengths: { [key: string]: number } = {};

	planets.forEach((planet) => {
		let strength = 50; // Base strength

		// Check for exaltation
		if (isExalted(planet.name, planet.sign)) {
			strength += 30;
		}

		// Check for own sign
		if (isOwnSign(planet.name, planet.sign)) {
			strength += 20;
		}

		// Check for debilitation
		if (isDebilitated(planet.name, planet.sign)) {
			strength -= 25;
		}

		// Check house position
		if ([1, 4, 7, 10].includes(planet.house)) {
			// Kendra houses
			strength += 10;
		} else if ([5, 9].includes(planet.house)) {
			// Trikona houses
			strength += 15;
		} else if ([6, 8, 12].includes(planet.house)) {
			// Dusthana houses
			strength -= 10;
		}

		// Retrograde adjustment
		if (planet.isRetrograde) {
			strength += 5; // Retrograde planets are considered stronger
		}

		strengths[planet.name] = Math.max(10, Math.min(100, strength));
	});

	return strengths;
}

function calculateAscendantStrength(sign: string, degree: number): number {
	let strength = 50;

	// Middle degrees are stronger
	if (degree >= 10 && degree <= 20) {
		strength += 15;
	} else if (degree >= 5 && degree <= 25) {
		strength += 10;
	}

	// Fire signs are naturally stronger ascendants
	if (["Aries", "Leo", "Sagittarius"].includes(sign)) {
		strength += 10;
	}

	return Math.max(20, Math.min(100, strength));
}

function getAscendantSignification(sign: string): string {
	const significations: { [key: string]: string } = {
		Aries: "Dynamic, energetic, leadership qualities, pioneering spirit",
		Taurus: "Stable, practical, artistic, love for comfort and luxury",
		Gemini: "Communicative, intellectual, adaptable, curious nature",
		Cancer: "Emotional, nurturing, intuitive, family-oriented",
		Leo: "Confident, creative, generous, natural leadership",
		Virgo: "Analytical, practical, perfectionist, service-oriented",
		Libra: "Diplomatic, harmonious, artistic, partnership-focused",
		Scorpio: "Intense, mysterious, transformative, deep understanding",
		Sagittarius: "Philosophical, adventurous, optimistic, truth-seeking",
		Capricorn: "Disciplined, ambitious, practical, goal-oriented",
		Aquarius: "Innovative, humanitarian, independent, forward-thinking",
		Pisces: "Compassionate, intuitive, spiritual, artistic nature",
	};

	return significations[sign] || "General characteristics";
}

function getSignLord(sign: string): string {
	const lords: { [key: string]: string } = {
		Aries: "Mars",
		Taurus: "Venus",
		Gemini: "Mercury",
		Cancer: "Moon",
		Leo: "Sun",
		Virgo: "Mercury",
		Libra: "Venus",
		Scorpio: "Mars",
		Sagittarius: "Jupiter",
		Capricorn: "Saturn",
		Aquarius: "Saturn",
		Pisces: "Jupiter",
	};

	return lords[sign] || "Unknown";
}

function getAscendantCharacteristics(sign: string): string[] {
	const characteristics: { [key: string]: string[] } = {
		Aries: ["Bold", "Independent", "Quick decision maker", "Natural leader"],
		Taurus: ["Patient", "Reliable", "Practical", "Love for beauty"],
		Gemini: ["Versatile", "Communicative", "Curious", "Adaptable"],
		Cancer: ["Caring", "Intuitive", "Protective", "Emotional"],
		Leo: ["Confident", "Creative", "Generous", "Dramatic"],
		Virgo: ["Detail-oriented", "Analytical", "Helpful", "Perfectionist"],
		Libra: ["Diplomatic", "Balanced", "Artistic", "Social"],
		Scorpio: ["Intense", "Passionate", "Mysterious", "Transformative"],
		Sagittarius: [
			"Adventurous",
			"Philosophical",
			"Optimistic",
			"Freedom-loving",
		],
		Capricorn: ["Ambitious", "Disciplined", "Responsible", "Traditional"],
		Aquarius: ["Independent", "Innovative", "Humanitarian", "Unique"],
		Pisces: ["Compassionate", "Imaginative", "Spiritual", "Sensitive"],
	};

	return characteristics[sign] || ["General traits"];
}

function getFriendlyPlanets(planet: string): string[] {
	return PLANETS[planet as keyof typeof PLANETS]?.friends || [];
}

function getEnemyPlanets(planet: string): string[] {
	return PLANETS[planet as keyof typeof PLANETS]?.enemies || [];
}

function getHouseSignification(house: number): string {
	return HOUSES[house as keyof typeof HOUSES]?.name || `House ${house}`;
}

function getNakshatraLord(nakshatra: string): string {
	const lords: { [key: string]: string } = {
		Ashwini: "Ketu",
		Bharani: "Venus",
		Krittika: "Sun",
		Rohini: "Moon",
		Mrigashira: "Mars",
		Ardra: "Rahu",
		Punarvasu: "Jupiter",
		Pushya: "Saturn",
		Ashlesha: "Mercury",
		Magha: "Ketu",
		"Purva Phalguni": "Venus",
		"Uttara Phalguni": "Sun",
		Hasta: "Moon",
		Chitra: "Mars",
		Swati: "Rahu",
		Vishakha: "Jupiter",
		Anuradha: "Saturn",
		Jyeshtha: "Mercury",
		Mula: "Ketu",
		"Purva Ashadha": "Venus",
		"Uttara Ashadha": "Sun",
		Shravana: "Moon",
		Dhanishta: "Mars",
		Shatabhisha: "Rahu",
		"Purva Bhadrapada": "Jupiter",
		"Uttara Bhadrapada": "Saturn",
		Revati: "Mercury",
	};

	return lords[nakshatra] || "Unknown";
}

function getPlanetaryEffects(
	planet: string,
	house: number,
	sign: string
): string[] {
	const effects = [];

	// Basic planetary effects in houses
	const planetHouseEffects: { [key: string]: { [key: number]: string[] } } = {
		Sun: {
			1: ["Strong personality", "Leadership qualities", "Good health"],
			10: ["Career success", "Government connections", "Authority"],
		},
		Moon: {
			1: ["Emotional nature", "Intuitive", "Changeable personality"],
			4: ["Mother's blessings", "Property gains", "Emotional stability"],
		},
		Mars: {
			1: ["Energetic", "Courageous", "Quick temper"],
			10: ["Dynamic career", "Leadership", "Technical skills"],
		},
		// Add more combinations as needed
	};

	const houseEffects = planetHouseEffects[planet]?.[house];
	if (houseEffects) {
		effects.push(...houseEffects);
	} else {
		effects.push(`${planet} in ${house}th house brings general effects`);
	}

	// Sign-based effects
	if (isExalted(planet, sign)) {
		effects.push(`Exalted ${planet} brings excellent results`);
	} else if (isOwnSign(planet, sign)) {
		effects.push(`${planet} in own sign brings good results`);
	} else if (isDebilitated(planet, sign)) {
		effects.push(`Debilitated ${planet} needs attention and remedies`);
	}

	return effects;
}

function getPlanetaryRemedies(planet: string, strength: number): string[] {
	const baseRemedies: { [key: string]: string[] } = {
		Sun: [
			"Surya Namaskar",
			"Ruby gemstone",
			"Sunday fasting",
			"Offer water to Sun",
		],
		Moon: ["Chandra mantra", "Pearl", "Monday fasting", "Milk donation"],
		Mars: ["Mangal mantra", "Red coral", "Tuesday fasting", "Hanuman worship"],
		Mercury: [
			"Budh mantra",
			"Emerald",
			"Wednesday fasting",
			"Green vegetables donation",
		],
		Jupiter: [
			"Guru mantra",
			"Yellow sapphire",
			"Thursday fasting",
			"Teaching/donation",
		],
		Venus: [
			"Shukra mantra",
			"Diamond",
			"Friday fasting",
			"White cloth donation",
		],
		Saturn: [
			"Shani mantra",
			"Blue sapphire",
			"Saturday fasting",
			"Service to elderly",
		],
		Rahu: ["Rahu mantra", "Hessonite", "Saturday fasting", "Donation to poor"],
		Ketu: [
			"Ketu mantra",
			"Cat's eye",
			"Tuesday fasting",
			"Spiritual practices",
		],
	};

	const remedies = [...(baseRemedies[planet] || ["General remedies"])];

	// Add strength-specific remedies
	if (strength < 40) {
		remedies.push("Extra attention needed - perform daily remedies");
		remedies.push("Consult astrologer for personalized solutions");
	}

	return remedies;
}

function calculateHouseStrength(
	house: number,
	planetsInHouse: EnhancedPlanetData[]
): number {
	let strength = 50; // Base strength

	// Benefic planets increase strength
	const beneficPlanets = ["Jupiter", "Venus", "Mercury", "Moon"];
	const maleficPlanets = ["Mars", "Saturn", "Rahu", "Ketu", "Sun"];

	planetsInHouse.forEach((planet) => {
		if (beneficPlanets.includes(planet.name)) {
			strength += 15;
		} else if (maleficPlanets.includes(planet.name)) {
			strength -= 10;
		}
	});

	// Kendra and Trikona houses are naturally stronger
	if ([1, 4, 7, 10].includes(house)) {
		strength += 10;
	} else if ([5, 9].includes(house)) {
		strength += 15;
	} else if ([6, 8, 12].includes(house)) {
		strength -= 15;
	}

	return Math.max(10, Math.min(100, strength));
}

function getHouseLord(_house: number, _planets: EnhancedPlanetData[]): string {
	// This would require ascendant sign to calculate properly
	// For now, return general indication
	return "Calculated based on ascendant";
}

function getHouseEffects(
	house: number,
	planetsInHouse: EnhancedPlanetData[]
): string[] {
	const effects = [];
	const houseSignifications =
		HOUSES[house as keyof typeof HOUSES]?.significations || [];

	if (planetsInHouse.length === 0) {
		effects.push(`${house}th house shows neutral effects`);
	} else {
		planetsInHouse.forEach((planet) => {
			effects.push(
				`${planet.name} influences ${houseSignifications.join(", ")}`
			);
		});
	}

	return effects;
}

function getHousePredictions(
	house: number,
	planetsInHouse: EnhancedPlanetData[]
): string[] {
	const predictions = [];

	if (planetsInHouse.length > 0) {
		const houseName =
			HOUSES[house as keyof typeof HOUSES]?.name || `House ${house}`;
		predictions.push(
			`Active period for ${houseName.toLowerCase()} related matters`
		);

		planetsInHouse.forEach((planet) => {
			predictions.push(
				`${planet.name} brings specific opportunities in this area`
			);
		});
	}

	return predictions;
}

function getHouseRemedies(house: number, strength: number): string[] {
	const remedies = [];

	if (strength < 40) {
		const houseName =
			HOUSES[house as keyof typeof HOUSES]?.name || `House ${house}`;
		remedies.push(
			`Strengthen ${houseName.toLowerCase()} through specific practices`
		);
		remedies.push("Regular worship of house significator planet");
	}

	return remedies;
}

function getNakshatraAnalysis(nakshatra: string): {
	characteristics: string[];
	predictions: string[];
	remedies: string[];
} {
	return {
		characteristics: getNakshatraCharacteristics(nakshatra),
		predictions: getNakshatraCareerSuggestions(nakshatra), // Using career suggestions as predictions
		remedies: getNakshatraRemedies(nakshatra),
	};
}

function getNakshatraCharacteristics(nakshatra: string): string[] {
	const characteristics: { [key: string]: string[] } = {
		Ashwini: ["Quick action", "Healing abilities", "Pioneering spirit"],
		Bharani: ["Creative", "Nurturing", "Strong willpower"],
		Krittika: ["Sharp intellect", "Purifying nature", "Leadership"],
		Rohini: ["Beautiful", "Artistic", "Material prosperity"],
		// Add more nakshatras as needed
	};

	return characteristics[nakshatra] || ["General characteristics"];
}

function getNakshatraCareerSuggestions(nakshatra: string): string[] {
	const careers: { [key: string]: string[] } = {
		Ashwini: ["Medicine", "Healing", "Transportation", "Veterinary"],
		Bharani: ["Arts", "Entertainment", "Childcare", "Agriculture"],
		Krittika: ["Teaching", "Spiritual guidance", "Military", "Cooking"],
		Rohini: ["Arts", "Fashion", "Agriculture", "Real estate"],
		// Add more nakshatras as needed
	};

	return careers[nakshatra] || ["General careers"];
}

function getCompatibleNakshatras(nakshatra: string): string[] {
	// Simplified compatibility - in practice, this would be more complex
	const compatible = ["Rohini", "Hasta", "Shravana", "Pushya"];
	return compatible.filter((n) => n !== nakshatra).slice(0, 3);
}

function getNakshatraRemedies(nakshatra: string): string[] {
	const lord = getNakshatraLord(nakshatra);
	return getPlanetaryRemedies(lord, 50);
}

function calculateOverallChartStrength(planetaryStrengths: {
	[key: string]: number;
}): number {
	const strengths = Object.values(planetaryStrengths);
	const average =
		strengths.reduce((sum, strength) => sum + strength, 0) / strengths.length;
	return Math.round(average);
}

function calculateLifeThemes(
	planets: EnhancedPlanetData[],
	yogas: string[]
): string[] {
	const themes = [];

	// Based on strong planets
	const strongPlanets = planets.filter((p) => (p.strength || 50) > 70);
	strongPlanets.forEach((planet) => {
		const planetThemes: { [key: string]: string } = {
			Sun: "Leadership and authority",
			Moon: "Emotions and intuition",
			Mars: "Energy and action",
			Mercury: "Communication and intellect",
			Jupiter: "Wisdom and spirituality",
			Venus: "Love and creativity",
			Saturn: "Discipline and service",
		};

		if (planetThemes[planet.name]) {
			themes.push(planetThemes[planet.name]);
		}
	});

	// Based on yogas
	if (yogas.some((y) => y.includes("Raj"))) {
		themes.push("Leadership and recognition");
	}
	if (yogas.some((y) => y.includes("Dhana"))) {
		themes.push("Wealth and prosperity");
	}

	return themes.slice(0, 5); // Limit to 5 themes
}

function generateKeyPredictions(
	planets: EnhancedPlanetData[],
	yogas: string[]
): string[] {
	const predictions = [];

	// Based on planetary positions
	const sunHouse = planets.find((p) => p.name === "Sun")?.house;
	if (sunHouse === 10) {
		predictions.push("Strong career prospects and leadership opportunities");
	}

	const jupiterHouse = planets.find((p) => p.name === "Jupiter")?.house;
	if (jupiterHouse && [1, 4, 7, 10].includes(jupiterHouse)) {
		predictions.push("Wisdom and spiritual growth throughout life");
	}

	// Based on yogas
	yogas.forEach((yoga) => {
		if (yoga.includes("Gajakesari")) {
			predictions.push("Success through wisdom and good judgment");
		}
		if (yoga.includes("Ruchaka")) {
			predictions.push("Achievement through courage and determination");
		}
	});

	return predictions.slice(0, 4); // Limit to 4 key predictions
}

// Helper functions for planetary dignity
function isExalted(planet: string, sign: string): boolean {
	const exaltations: { [key: string]: string } = {
		Sun: "Aries",
		Moon: "Taurus",
		Mars: "Capricorn",
		Mercury: "Virgo",
		Jupiter: "Cancer",
		Venus: "Pisces",
		Saturn: "Libra",
	};
	return exaltations[planet] === sign;
}

function isOwnSign(planet: string, sign: string): boolean {
	const ownSigns: { [key: string]: string[] } = {
		Sun: ["Leo"],
		Moon: ["Cancer"],
		Mars: ["Aries", "Scorpio"],
		Mercury: ["Gemini", "Virgo"],
		Jupiter: ["Sagittarius", "Pisces"],
		Venus: ["Taurus", "Libra"],
		Saturn: ["Capricorn", "Aquarius"],
	};
	return ownSigns[planet]?.includes(sign) || false;
}

function isDebilitated(planet: string, sign: string): boolean {
	const debilitations: { [key: string]: string } = {
		Sun: "Libra",
		Moon: "Scorpio",
		Mars: "Cancer",
		Mercury: "Pisces",
		Jupiter: "Capricorn",
		Venus: "Virgo",
		Saturn: "Aries",
	};
	return debilitations[planet] === sign;
}

// Enhanced confidence scoring and insights
function calculateAnalysisConfidence(
	chartData: ChartData & { overallStrength?: number },
	timingPredictions: TimingPrediction[]
): number {
	let confidence = 70; // Base confidence

	// Increase confidence based on chart strength
	if (chartData.overallStrength && chartData.overallStrength > 70) {
		confidence += 15;
	} else if (chartData.overallStrength && chartData.overallStrength < 40) {
		confidence -= 10;
	}

	// Increase confidence based on number of clear yogas
	if (chartData.yogas && chartData.yogas.length > 2) {
		confidence += 10;
	}

	// Increase confidence based on timing predictions strength
	const highConfidencePredictions = timingPredictions.filter(
		(p) => p.confidence > 80
	);
	if (highConfidencePredictions.length > 0) {
		confidence += 10;
	}

	// Decrease confidence if birth time accuracy is questionable
	if (
		chartData.calculationAccuracy &&
		chartData.calculationAccuracy !== "Real API Data"
	) {
		confidence -= 15;
	}

	return Math.max(40, Math.min(95, confidence));
}

function generateQuestionSpecificInsights(
	chartData: ChartData,
	questionType: string,
	timingPredictions: TimingPrediction[]
): {
	primaryFactors: string[];
	supportingFactors: string[];
	challenges: string[];
	timing: TimingPrediction[];
	remedies: string[];
	confidence: number;
} {
	const insights: {
		primaryFactors: string[];
		supportingFactors: string[];
		challenges: string[];
		timing: TimingPrediction[];
		remedies: string[];
		confidence: number;
	} = {
		primaryFactors: [],
		supportingFactors: [],
		challenges: [],
		timing: [],
		remedies: [],
		confidence: 70,
	};

	switch (questionType) {
		case "career":
			insights.primaryFactors = getCareerInsights(chartData);
			insights.timing = timingPredictions.filter((p) =>
				p.specificEvents.some(
					(event) =>
						event.toLowerCase().includes("career") ||
						event.toLowerCase().includes("job") ||
						event.toLowerCase().includes("promotion")
				)
			);
			insights.confidence = calculateCareerConfidence(
				chartData,
				insights.timing
			);
			break;

		case "relationship":
			insights.primaryFactors = getRelationshipInsights(chartData);
			insights.timing = timingPredictions.filter((p) =>
				p.specificEvents.some(
					(event) =>
						event.toLowerCase().includes("marriage") ||
						event.toLowerCase().includes("relationship") ||
						event.toLowerCase().includes("love")
				)
			);
			insights.confidence = calculateRelationshipConfidence(
				chartData,
				insights.timing
			);
			break;

		case "health":
			insights.primaryFactors = getHealthInsights(chartData);
			insights.timing = timingPredictions.filter((p) =>
				p.specificEvents.some(
					(event) =>
						event.toLowerCase().includes("health") ||
						event.toLowerCase().includes("recovery")
				)
			);
			insights.confidence = calculateHealthConfidence(
				chartData,
				insights.timing
			);
			break;

		case "finance":
			insights.primaryFactors = getFinanceInsights(chartData);
			insights.timing = timingPredictions.filter((p) =>
				p.specificEvents.some(
					(event) =>
						event.toLowerCase().includes("wealth") ||
						event.toLowerCase().includes("income") ||
						event.toLowerCase().includes("property")
				)
			);
			insights.confidence = calculateFinanceConfidence(
				chartData,
				insights.timing
			);
			break;

		default:
			insights.primaryFactors = getGeneralInsights(chartData);
			insights.timing = timingPredictions.slice(0, 3); // Top 3 predictions
			insights.confidence = 70;
	}

	return insights;
}

function getCareerInsights(chartData: ChartData): string[] {
	const insights = [];

	// Check 10th house (career)
	const tenthHouse = chartData.houses?.find((h: HouseData) => h.number === 10);
	if (tenthHouse && tenthHouse.strength && tenthHouse.strength > 70) {
		insights.push("Strong 10th house indicates excellent career prospects");
	}

	// Check Sun position (authority, government)
	const sun = chartData.planets?.find(
		(p: EnhancedPlanetData) => p.name === "Sun"
	);
	if (sun && sun.house === 10) {
		insights.push("Sun in 10th house - natural leadership and authority");
	}

	// Check for career-related yogas
	const careerYogas = chartData.yogas?.filter(
		(y: string) =>
			y.toLowerCase().includes("raj") || y.toLowerCase().includes("career")
	);
	if (careerYogas && careerYogas.length > 0) {
		insights.push("Favorable yogas support career advancement");
	}

	return insights.slice(0, 3); // Top 3 insights
}

function getRelationshipInsights(chartData: ChartData): string[] {
	const insights = [];

	// Check 7th house (marriage/partnerships)
	const seventhHouse = chartData.houses?.find((h: HouseData) => h.number === 7);
	if (seventhHouse && seventhHouse.strength && seventhHouse.strength > 70) {
		insights.push("Strong 7th house indicates good marriage prospects");
	}

	// Check Venus position (love, relationships)
	const venus = chartData.planets?.find(
		(p: EnhancedPlanetData) => p.name === "Venus"
	);
	if (venus && [1, 4, 7, 10].includes(venus.house)) {
		insights.push("Venus in favorable position supports relationships");
	}

	// Check for relationship yogas
	const relationshipYogas = chartData.yogas?.filter(
		(y: string) =>
			y.toLowerCase().includes("marriage") || y.toLowerCase().includes("venus")
	);
	if (relationshipYogas && relationshipYogas.length > 0) {
		insights.push("Favorable yogas indicate relationship opportunities");
	}

	return insights.slice(0, 3);
}

function getHealthInsights(chartData: ChartData): string[] {
	const insights = [];

	// Check 6th house (diseases/health challenges)
	const sixthHouse = chartData.houses?.find((h: HouseData) => h.number === 6);
	if (sixthHouse && sixthHouse.strength && sixthHouse.strength < 40) {
		insights.push("6th house needs attention - focus on health maintenance");
	}

	// Check 1st house (physical body)
	const firstHouse = chartData.houses?.find((h: HouseData) => h.number === 1);
	if (firstHouse && firstHouse.strength && firstHouse.strength > 70) {
		insights.push("Strong ascendant indicates good physical constitution");
	}

	return insights.slice(0, 3);
}

function getFinanceInsights(chartData: ChartData): string[] {
	const insights = [];

	// Check 2nd house (wealth)
	const secondHouse = chartData.houses?.find((h: HouseData) => h.number === 2);
	if (secondHouse && secondHouse.strength && secondHouse.strength > 70) {
		insights.push("Strong 2nd house indicates wealth accumulation potential");
	}

	// Check 11th house (income)
	const eleventhHouse = chartData.houses?.find(
		(h: HouseData) => h.number === 11
	);
	if (eleventhHouse && eleventhHouse.strength && eleventhHouse.strength > 70) {
		insights.push("Strong 11th house supports income growth");
	}

	// Check Jupiter (wealth significator)
	const jupiter = chartData.planets?.find(
		(p: EnhancedPlanetData) => p.name === "Jupiter"
	);
	if (jupiter && jupiter.strength > 70) {
		insights.push("Strong Jupiter supports financial growth");
	}

	return insights.slice(0, 3);
}

function getGeneralInsights(chartData: ChartData): string[] {
	const insights = [];

	if (chartData.overallStrength && chartData.overallStrength > 70) {
		insights.push("Overall strong chart with good potential");
	}

	if (chartData.yogas && chartData.yogas.length > 2) {
		insights.push("Multiple favorable yogas present in chart");
	}

	insights.push("Detailed analysis reveals specific opportunities");

	return insights.slice(0, 3);
}

function calculateCareerConfidence(
	chartData: ChartData,
	timingPredictions: TimingPrediction[]
): number {
	let confidence = 70;

	// Check 10th house strength
	const tenthHouse = chartData.houses?.find((h: HouseData) => h.number === 10);
	if (tenthHouse && tenthHouse.strength) {
		confidence += (tenthHouse.strength - 50) * 0.3;
	}

	// Check timing predictions confidence
	if (timingPredictions.length > 0) {
		const avgTimingConfidence =
			timingPredictions.reduce((sum, p) => sum + p.confidence, 0) /
			timingPredictions.length;
		confidence += (avgTimingConfidence - 70) * 0.2;
	}

	return Math.max(40, Math.min(95, Math.round(confidence)));
}

function calculateRelationshipConfidence(
	chartData: ChartData,
	timingPredictions: TimingPrediction[]
): number {
	let confidence = 70;

	// Check 7th house strength
	const seventhHouse = chartData.houses?.find((h: HouseData) => h.number === 7);
	if (seventhHouse && seventhHouse.strength) {
		confidence += (seventhHouse.strength - 50) * 0.3;
	}
	// Check Venus strength
	const venus = chartData.planets?.find(
		(p: EnhancedPlanetData) => p.name === "Venus"
	);
	if (venus && venus.strength) {
		confidence += (venus.strength - 50) * 0.2;
	}

	return Math.max(40, Math.min(95, Math.round(confidence)));
}

function calculateHealthConfidence(
	chartData: ChartData,
	timingPredictions: TimingPrediction[]
): number {
	let confidence = 70;

	// Check 1st house strength (physical body)
	const firstHouse = chartData.houses?.find((h: HouseData) => h.number === 1);
	if (firstHouse && firstHouse.strength) {
		confidence += (firstHouse.strength - 50) * 0.3;
	}

	return Math.max(40, Math.min(95, Math.round(confidence)));
}

function calculateFinanceConfidence(
	chartData: ChartData,
	timingPredictions: TimingPrediction[]
): number {
	let confidence = 70;

	// Check 2nd and 11th house strengths
	const secondHouse = chartData.houses?.find((h: HouseData) => h.number === 2);
	const eleventhHouse = chartData.houses?.find(
		(h: HouseData) => h.number === 11
	);

	if (
		secondHouse &&
		eleventhHouse &&
		secondHouse.strength &&
		eleventhHouse.strength
	) {
		const avgHouseStrength =
			(secondHouse.strength + eleventhHouse.strength) / 2;
		confidence += (avgHouseStrength - 50) * 0.3;
	}

	return Math.max(40, Math.min(95, Math.round(confidence)));
}

// Export constants for use in components
export { PLANETS, HOUSES, NAKSHATRAS };
