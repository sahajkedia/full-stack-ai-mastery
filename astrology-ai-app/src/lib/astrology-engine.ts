import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { type UIMessage } from "ai";

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
	const datePattern = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/;
	const timePattern = /(\d{1,2}):(\d{2})/;
	const placePattern = /([A-Za-z\s]+),\s*([A-Za-z\s]+),\s*([A-Za-z\s]+)/;

	const dateMatch = userInput.match(datePattern);
	const timeMatch = userInput.match(timePattern);
	const placeMatch = userInput.match(placePattern);

	if (dateMatch && timeMatch && placeMatch) {
		return {
			date: `${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}`,
			time: `${timeMatch[1]}:${timeMatch[2]}`,
			place: placeMatch[0],
		};
	}

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
			userInput = JSON.stringify(latestMessage);
		}

		// Determine question type for specialized analysis
		const questionType = determineQuestionType(userInput);

		// Check if we have birth details
		const birthDetails = extractBirthDetails(userInput);
		const hasBirthDetails = birthDetails !== null;

		// If no API key is available, use fallback responses
		if (!process.env.OPENAI_API_KEY) {
			return generateFallbackResponse(
				userInput,
				questionType,
				hasBirthDetails,
				birthDetails
			);
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

		return text;
	} catch (error) {
		console.error("Astrology engine error:", error);
		return generateFallbackResponse("", "general", false, null);
	}
}

function generateFallbackResponse(
	userInput: string,
	questionType: string,
	hasBirthDetails: boolean,
	birthDetails: { date: string; time: string; place: string } | null
) {
	const input = userInput.toLowerCase();

	// If no birth details provided, request them
	if (!hasBirthDetails) {
		return `Namaste! 🙏 I'm here to provide you with accurate Vedic astrology insights. 

To give you the most precise analysis, I need your complete birth details:

📅 **Date of Birth** (DD/MM/YYYY format)
⏰ **Time of Birth** (24-hour format, e.g., 14:30 for 2:30 PM)
📍 **Place of Birth** (City, State, Country)

For example: "15/03/1990, 14:30, Mumbai, Maharashtra, India"

Once you provide these details, I can:
• Calculate your precise birth chart (Kundli)
• Analyze planetary positions and their influences
• Provide specific predictions for your life areas
• Suggest personalized remedies and solutions

Please share your birth details so I can begin your cosmic analysis! 🔮✨`;
	}

	// If birth details are provided, provide specialized responses
	if (questionType === "health") {
		return `🔮 **Health Analysis Based on Your Birth Chart**

Based on your birth details, I can see several planetary influences affecting your health:

**Current Health Challenges:**
• The 6th house (diseases) shows some challenging planetary positions
• Saturn's transit may be affecting your nervous system
• Mars-Mercury combination could indicate neurological issues

**Timeline for Improvement:**
• **Next 3-6 months**: Gradual improvement in bladder function
• **6-12 months**: Significant recovery in bowel control
• **Jupiter's transit** (around 6 months from now) will bring healing energy

**Recommended Remedies:**
1. **Mantra**: Chant "Om Namah Shivaya" 108 times daily
2. **Gemstone**: Wear Yellow Sapphire (Pukhraj) in gold
3. **Ritual**: Perform Rudrabhishek on Mondays
4. **Lifestyle**: Practice yoga, especially pelvic floor exercises
5. **Charity**: Donate yellow items on Thursdays

**Medical Integration:**
Continue your medical treatment alongside these spiritual remedies. The combination of modern medicine and Vedic wisdom will accelerate your recovery.

**Positive Outlook:**
Your chart shows strong recovery potential. The current challenges are temporary and will improve significantly within the next year. Stay positive and maintain faith in both medical and spiritual healing! 🌟`;
	}

	if (questionType === "career") {
		return `🔮 **Career Analysis Based on Your Birth Chart**

Your birth chart reveals excellent career potential:

**Career Strengths:**
• Strong 10th house (Karma Bhava) indicates leadership qualities
• Sun in favorable position suggests authority and recognition
• Jupiter's influence brings wisdom and expansion

**Recommended Career Paths:**
• Management and Administration
• Teaching and Education
• Healthcare and Healing
• Technology and Innovation
• Government or Public Service

**Timing for Career Growth:**
• **Next 6 months**: New opportunities will emerge
• **1-2 years**: Significant career advancement
• **Jupiter's transit**: Major breakthrough in 8-10 months

**Career Remedies:**
1. **Mantra**: "Om Gurave Namah" for career success
2. **Gemstone**: Wear Ruby (Manik) for authority
3. **Ritual**: Perform Surya Namaskar daily
4. **Actions**: Take initiative and show leadership

Your career path is blessed with success and recognition! 🚀`;
	}

	if (questionType === "relationship") {
		return `🔮 **Relationship Analysis Based on Your Birth Chart**

Your relationship sector shows interesting planetary combinations:

**Current Relationship Status:**
• Venus (love significator) is well-placed
• 7th house (marriage) shows positive influences
• Jupiter's aspect brings harmony and growth

**Timing for Relationships:**
• **Next 3-6 months**: New romantic opportunities
• **Venus transit**: Enhanced love and harmony
• **Jupiter's influence**: Deepening of existing relationships

**Relationship Remedies:**
1. **Mantra**: "Om Shukraya Namah" for love
2. **Gemstone**: Wear Diamond or White Sapphire
3. **Ritual**: Perform Lakshmi Puja on Fridays
4. **Actions**: Practice compassion and understanding

**Compatibility:**
Your chart shows compatibility with people born under:
• Taurus, Libra, Capricorn, Aquarius
• Nakshatras: Rohini, Uttara Phalguni, Uttara Ashadha

Love and harmony are coming your way! 💕`;
	}

	// Default response for other question types
	return `🔮 **Vedic Astrology Guidance**

Thank you for sharing your birth details! Your cosmic blueprint reveals:

**Current Planetary Influences:**
• Jupiter's transit brings wisdom and growth
• Saturn's influence teaches patience and discipline
• Mars provides energy and courage

**General Predictions:**
• **Next 6 months**: Period of learning and growth
• **1 year**: Major positive changes in life
• **Long-term**: Success through patience and hard work

**Universal Remedies:**
1. **Daily Practice**: Chant "Om Namah Shivaya"
2. **Gemstone**: Wear Yellow Sapphire for overall prosperity
3. **Ritual**: Perform regular prayers and meditation
4. **Actions**: Practice kindness and charity

**Specific Guidance:**
What aspect of your life would you like me to analyze in detail?
• Career and Profession
• Health and Wellness
• Relationships and Love
• Finance and Wealth
• Education and Learning
• Spiritual Growth

I'm here to guide you through your cosmic journey! 🌟✨`;
}

// Export constants for use in components
export { PLANETS, HOUSES, NAKSHATRAS };
