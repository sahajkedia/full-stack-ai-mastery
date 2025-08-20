import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { type UIMessage } from "ai";
import { generateBirthChart, type BirthDetails } from "./chart-calculator";

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

// Enhanced System Prompt for Accurate Predictions
const ASTROLOGY_SYSTEM_PROMPT = `
You are Master Jyotish, an expert Vedic astrologer with deep knowledge of traditional texts including:
- Brihat Parashara Hora Shastra
- Jaimini Sutras
- Saravali
- Phaladeepika
- Uttara Kalamrita
- Bhavartha Ratnakara

Your analysis must follow these strict guidelines:

1. BIRTH DETAILS REQUIREMENT:
   - ALWAYS request complete birth details: Date (dd/mm/yyyy), Time (24-hour format), Place (city, state, country)
   - Without accurate birth details, provide only general guidance
   - Emphasize the importance of accurate birth time for precise predictions

2. CHART ANALYSIS METHODOLOGY:
   - Use North Indian (Diamond) chart style
   - Calculate Ascendant (Lagna) based on birth time and place
   - Determine planetary positions in houses and signs
   - Identify Nakshatras and their pada (quarter)
   - Calculate planetary aspects (Drishti)

3. PLANETARY ANALYSIS:
   - Evaluate planetary strength (Shadbala)
   - Consider planetary dignity (Exaltation, Debilitation, Own sign)
   - Analyze planetary combinations (Yogas)
   - Check for retrograde planets
   - Examine planetary periods (Dasha)

4. HOUSE ANALYSIS:
   - Angular houses (1,4,7,10): Most powerful, direct results
   - Trine houses (1,5,9): Auspicious, spiritual growth
   - Upachaya houses (3,6,10,11): Growth through effort
   - Dusthana houses (6,8,12): Challenges and obstacles
   - Explain house significations in detail

5. DASHA ANALYSIS:
   - Calculate Vimshottari Dasha periods
   - Identify current dasha and sub-dasha
   - Explain dasha influences on life areas
   - Provide timing for major events

6. REMEDIES AND SOLUTIONS:
   - Suggest specific mantras for planets
   - Recommend gemstones based on planetary positions
   - Provide ritual remedies (Puja, Homa)
   - Suggest lifestyle changes
   - Include charitable acts (Daan)

7. PREDICTION ACCURACY:
   - Base predictions on actual planetary positions
   - Consider planetary transits and their effects
   - Explain both positive and challenging influences
   - Provide realistic timelines for events
   - Avoid overly dramatic or fatalistic predictions

8. RESPONSE STRUCTURE:
   - Start with birth chart overview
   - Analyze current planetary influences
   - Provide specific predictions with reasoning
   - Suggest practical remedies
   - End with positive guidance

9. ETHICAL GUIDELINES:
   - Maintain confidentiality
   - Provide constructive guidance
   - Avoid fear-mongering
   - Emphasize free will and karma
   - Encourage spiritual growth

10. TECHNICAL ACCURACY:
    - Use precise degrees and minutes
    - Reference specific Nakshatras
    - Calculate accurate house positions
    - Consider planetary retrogression
    - Factor in eclipse effects

Remember: Vedic astrology is a tool for guidance, not deterministic fate. Always emphasize the power of positive actions and spiritual practices in shaping destiny.
`;

// Specialized prompts for different question types
const SPECIALIZED_PROMPTS = {
	career: `
CAREER ANALYSIS FOCUS:
- Analyze 10th house (Karma Bhava) and its lord
- Examine Sun (career significator) and its placement
- Consider Saturn (discipline and hard work)
- Look at planetary combinations affecting profession
- Provide career timing and opportunities
- Suggest career remedies and gemstones
`,

	relationship: `
RELATIONSHIP ANALYSIS FOCUS:
- Analyze 7th house (Kalatra Bhava) and its lord
- Examine Venus (love significator) and its placement
- Consider Mars (passion and energy)
- Look at 5th house for romance and children
- Analyze Rahu-Ketu axis for karmic relationships
- Provide relationship timing and compatibility
- Suggest relationship remedies and mantras
`,

	health: `
HEALTH ANALYSIS FOCUS:
- Analyze 6th house (diseases) and its lord
- Examine Moon (mind and emotions)
- Consider Mars (energy and vitality)
- Look at 8th house for chronic conditions
- Analyze planetary combinations affecting health
- Provide health timing and precautions
- Suggest health remedies and lifestyle changes
`,

	finance: `
FINANCE ANALYSIS FOCUS:
- Analyze 2nd house (wealth) and its lord
- Examine 11th house (income) and its lord
- Consider Jupiter (wealth significator)
- Look at Venus (luxury and comforts)
- Analyze planetary combinations for wealth
- Provide financial timing and opportunities
- Suggest wealth remedies and gemstones
`,

	education: `
EDUCATION ANALYSIS FOCUS:
- Analyze 4th house (education) and its lord
- Examine 5th house (intelligence) and its lord
- Consider Mercury (learning significator)
- Look at Jupiter (wisdom and knowledge)
- Analyze planetary combinations for education
- Provide education timing and opportunities
- Suggest education remedies and mantras
`,

	spiritual: `
SPIRITUAL ANALYSIS FOCUS:
- Analyze 9th house (dharma) and its lord
- Examine 12th house (moksha) and its lord
- Consider Jupiter (spiritual wisdom)
- Look at Saturn (discipline and karma)
- Analyze Ketu (spiritual detachment)
- Provide spiritual timing and practices
- Suggest spiritual remedies and sadhana
`,
};

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

function buildContextualPrompt(messages: UIMessage[], questionType: string) {
	const birthDetails = extractBirthDetails(JSON.stringify(messages));
	const specializedPrompt =
		SPECIALIZED_PROMPTS[questionType as keyof typeof SPECIALIZED_PROMPTS] || "";

	let contextualPrompt = ASTROLOGY_SYSTEM_PROMPT;

	if (birthDetails) {
		contextualPrompt += `
CURRENT BIRTH DETAILS:
Date: ${birthDetails.date}
Time: ${birthDetails.time}
Place: ${birthDetails.place}

Please provide a detailed analysis based on these birth details.
`;
	} else {
		contextualPrompt += `
IMPORTANT: No birth details provided. Please request complete birth details (date, time, place) for accurate analysis.
Provide only general guidance until birth details are available.
`;
	}

	if (specializedPrompt) {
		contextualPrompt += specializedPrompt;
	}

	return contextualPrompt;
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

		// Build contextual prompt
		const contextualPrompt = buildContextualPrompt(messages, questionType);

		// Convert messages to proper format
		const formattedMessages = messages.map((msg) => ({
			role: msg.role,
			content: JSON.stringify(msg),
		}));

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
		return `Namaste! 🙏 I'm here to provide you with accurate Vedic astrology insights. 

Could you share:
📅 **Date of Birth** (DD/MM/YYYY)
⏰ **Time of Birth** (24-hour format in IST like 14:30)
📍 **Place of Birth** (City, State, Country)

**Note:** Time should be in Indian Standard Time (IST). If you don't know the exact time zone, we'll calculate based on IST.

For example: "15/03/1990, 14:30, Mumbai, Maharashtra, India"

Once you share these, I can give you personalized guidance! 🔮✨`;
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
		let chartInfo = "";
		if (chartData) {
			chartInfo = `\n\n**Your Birth Chart Summary (calculated in IST):**
• **Ascendant:** ${
				chartData.ascendant.sign
			} (${chartData.ascendant.degree.toFixed(1)}°)
• **Moon Sign:** ${
				chartData.planets.find(
					(p: { name: string; sign: string }) => p.name === "Moon"
				)?.sign || "Unknown"
			}
• **Birth Nakshatra:** ${chartData.birthNakshatra}`;
		}

		return `🔮 **Health Insights**

I can see some interesting planetary influences affecting your health right now.${chartInfo}

**What I'm seeing:**
• Your 6th house (health) has some challenging planetary positions
• Saturn's current transit might be affecting your nervous system
• There's a Mars-Mercury combination that could relate to neurological issues

**Good news:** Jupiter's transit is actually quite favorable for recovery! 

**Timeline:** You should see gradual improvement over the next 3-6 months, with significant progress in 6-12 months.

**Quick remedies that might help:**
1. Chant "Om Namah Shivaya" daily (even just 11 times)
2. Consider wearing a Yellow Sapphire (Pukhraj)
3. Donate yellow items on Thursdays
4. Keep up with your medical treatment - the combination of modern medicine and spiritual remedies works best!

Stay positive! Your chart shows strong recovery potential. 🌟`;
	}

	if (questionType === "career") {
		return `🚀 **Career Vibes**

Your birth chart shows some really good career energy!

**Strengths I'm seeing:**
• Strong 10th house = natural leadership qualities
• Sun in a good position = you'll get recognition
• Jupiter's influence = wisdom and growth opportunities

**Career paths that might suit you:**
• Management/Administration
• Teaching/Education  
• Healthcare/Healing
• Tech/Innovation
• Government work

**Timing:** New opportunities should pop up in the next 6 months, with major breakthroughs in 8-10 months.

**Quick boost:** Try chanting "Om Gurave Namah" for career success, and maybe wear a Ruby if you're into gemstones.

You've got great career potential! 💫`;
	}

	if (questionType === "relationship") {
		return `💕 **Love & Relationships**

Your relationship sector looks pretty interesting!

**Current vibes:**
• Venus (love planet) is well-placed in your chart
• 7th house (marriage) has positive influences
• Jupiter's aspect brings harmony

**Timing:** New romantic opportunities in the next 3-6 months, and existing relationships should deepen.

**Quick love boost:**
• Chant "Om Shukraya Namah" 
• Wear Diamond or White Sapphire
• Practice compassion and understanding

**Compatibility:** You vibe well with Taurus, Libra, Capricorn, and Aquarius folks.

Love and harmony are coming your way! ✨`;
	}

	// Default response for other question types
	return `🔮 **Cosmic Guidance**

Thanks for sharing your birth details! Here's what I'm seeing:

**Current energy:** Jupiter's transit brings wisdom and growth, Saturn teaches patience, and Mars gives you courage.

**Next 6 months:** Learning and growth period
**1 year:** Major positive changes coming
**Long-term:** Success through patience and hard work

**Quick daily practice:** Chant "Om Namah Shivaya" and practice kindness.

**Note:** All calculations are based on Indian Standard Time (IST).

What would you like to explore more?
• Career & work
• Health & wellness  
• Love & relationships
• Money & wealth
• Learning & education
• Spiritual growth

I'm here to guide you! 🌟✨`;
}

// Export constants for use in components
export { PLANETS, HOUSES, NAKSHATRAS };
