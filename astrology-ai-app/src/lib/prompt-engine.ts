// Advanced Prompt Engineering for Vedic Astrology with Enhanced Accuracy

export interface AstrologicalContext {
	birthDetails?: {
		date: string;
		time: string;
		place: string;
		latitude?: number;
		longitude?: number;
	};
	question: string;
	previousMessages: string[];
	currentDate: string; // Added current date for accurate timing predictions
	userPreferences: {
		detailLevel: "basic" | "comprehensive" | "expert";
		focusAreas: string[];
		remedyPreference: "all" | "mantras" | "gemstones" | "rituals";
	};
	currentTransits?: {
		date: string;
		planets: Array<{
			name: string;
			sign: string;
			degree: number;
			isRetrograde: boolean;
		}>;
	};
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
	};
}

// Advanced Yogas and Planetary Combinations - Enhanced for Precision
const ADVANCED_YOGAS = {
	"Gajakesari Yoga": {
		condition: "Jupiter in Kendra (1,4,7,10) from Moon",
		strength: "Strong when both Jupiter and Moon are unafflicted",
		effects: [
			"Wisdom",
			"Leadership",
			"Spiritual growth",
			"Success in life",
			"Political success",
		],
		timing: "Results manifest during Jupiter or Moon periods",
		remedies: [
			"Jupiter mantras",
			"Yellow sapphire",
			"Thursday fasting",
			"Guru seva",
		],
		validation: "Check Jupiter and Moon strength, aspects, and house positions",
	},
	"Bhadra Yoga": {
		condition: "Mercury in own sign (Gemini/Virgo) in Kendra from Ascendant",
		strength: "Stronger when Mercury is in Virgo and unafflicted",
		effects: [
			"Intelligence",
			"Communication skills",
			"Business acumen",
			"Literary talents",
		],
		timing: "Peak results in Mercury Mahadasha/Antardasha",
		remedies: [
			"Mercury mantras",
			"Emerald",
			"Wednesday worship",
			"Vishnu sadhana",
		],
		validation: "Mercury must be in exact own sign and Kendra position",
	},
	"Hamsa Yoga": {
		condition:
			"Jupiter in own sign (Sagittarius/Pisces) in Kendra from Ascendant",
		strength: "Most powerful when Jupiter is in Sagittarius in 1st house",
		effects: [
			"Spiritual wisdom",
			"Teaching abilities",
			"Religious leadership",
			"Prosperity",
		],
		timing: "Life-changing results in Jupiter periods",
		remedies: [
			"Guru mantras",
			"Yellow sapphire",
			"Brihaspati worship",
			"Charity",
		],
		validation: "Jupiter placement in exact own sign and angular house",
	},
	"Malavya Yoga": {
		condition: "Venus in own sign (Taurus/Libra) in Kendra from Ascendant",
		strength: "Stronger in Taurus, weaker if afflicted by malefics",
		effects: [
			"Artistic talents",
			"Luxury",
			"Beauty",
			"Marital happiness",
			"Wealth",
		],
		timing: "Prominent results in Venus Mahadasha",
		remedies: ["Venus mantras", "Diamond", "Friday worship", "Lakshmi sadhana"],
		validation: "Venus in exact own sign in angular position",
	},
	"Ruchaka Yoga": {
		condition: "Mars in own sign (Aries/Scorpio) in Kendra from Ascendant",
		strength: "Most powerful in Aries in 1st house",
		effects: [
			"Courage",
			"Leadership",
			"Military success",
			"Athletic abilities",
			"Land ownership",
		],
		timing: "Peak effects in Mars Mahadasha/Antardasha",
		remedies: [
			"Mars mantras",
			"Red coral",
			"Tuesday worship",
			"Hanuman worship",
		],
		validation: "Mars in exact own sign in Kendra house",
	},
	"Shasha Yoga": {
		condition:
			"Saturn in own sign (Capricorn/Aquarius) in Kendra from Ascendant",
		strength: "More effective in Capricorn, requires unafflicted Saturn",
		effects: [
			"Administrative skills",
			"Longevity",
			"Discipline",
			"Success through hard work",
		],
		timing: "Major results in Saturn Mahadasha, especially after age 36",
		remedies: [
			"Saturn mantras",
			"Blue sapphire",
			"Saturday worship",
			"Service to elderly",
		],
		validation: "Saturn in exact own sign in angular house",
	},
	"Neecha Bhanga Raja Yoga": {
		condition: "Debilitated planet's dispositor in Kendra/Trikona or exalted",
		strength: "Varies based on the specific cancellation conditions",
		effects: [
			"Rise from adversity",
			"Unexpected success",
			"Reversal of fortune",
		],
		timing: "Activates during the debilitated planet's period",
		remedies: ["Planet-specific remedies", "Charity", "Spiritual practices"],
		validation: "Multiple conditions must be checked for true cancellation",
	},
	"Viparita Raja Yoga": {
		condition:
			"Lords of 6th, 8th, 12th houses in mutual exchange or conjunction",
		strength: "Stronger when all three dusthana lords are involved",
		effects: [
			"Success through obstacles",
			"Unconventional achievements",
			"Hidden talents",
		],
		timing: "Results during dusthana lord periods",
		remedies: [
			"Rudra mantras",
			"Tantric practices",
			"Obstacle removal rituals",
		],
		validation: "Exact exchange or conjunction of dusthana lords required",
	},
	"Chandra Mangal Yoga": {
		condition: "Moon and Mars in conjunction or mutual aspect",
		strength: "Stronger in benefic signs, weaker if afflicted",
		effects: [
			"Wealth accumulation",
			"Property gains",
			"Mother's blessings",
			"Emotional strength",
		],
		timing: "Prominent in Moon or Mars periods",
		remedies: ["Chandra-Mangal mantras", "Pearl and coral", "Mother's service"],
		validation: "Check exact degrees and house positions",
	},
	"Guru Mangal Yoga": {
		condition: "Jupiter and Mars in conjunction or mutual aspect",
		strength: "Most powerful in fire signs or own signs",
		effects: [
			"Technical expertise",
			"Engineering skills",
			"Leadership",
			"Spiritual warrior",
		],
		timing: "Peak results in Jupiter-Mars periods",
		remedies: [
			"Guru-Mangal mantras",
			"Yellow sapphire and coral",
			"Dharmic actions",
		],
		validation: "Conjunction within 10 degrees or exact mutual aspect",
	},
	"Dhana Yoga": {
		condition: "2nd and 11th house lords in mutual connection",
		strength: "Stronger when involving benefic planets",
		effects: [
			"Wealth accumulation",
			"Financial stability",
			"Multiple income sources",
		],
		timing: "Wealth periods during 2nd/11th lord dashas",
		remedies: ["Lakshmi mantras", "Wealth-related gemstones", "Charity"],
		validation: "Check connection through conjunction, aspect, or exchange",
	},
	"Raj Sambandha Yoga": {
		condition: "1st, 5th, 9th house lords in mutual connection",
		strength: "Most powerful when all three are strong",
		effects: [
			"Royal connections",
			"Government favor",
			"Leadership positions",
			"Fame",
		],
		timing: "Major results in trikona lord periods",
		remedies: ["Sun worship", "Ruby", "Authority-related mantras"],
		validation: "Connection through conjunction, aspect, or house exchange",
	},
};

// Nakshatra-specific interpretations
const NAKSHATRA_INTERPRETATIONS = {
	Ashwini: {
		deity: "Ashwini Kumaras",
		element: "Fire",
		qualities: ["Quick action", "Healing", "New beginnings"],
		career: ["Medicine", "Healing", "Transportation"],
		remedies: ["Ashwini Kumaras mantra", "Red color", "Fast action"],
	},
	Rohini: {
		deity: "Brahma",
		element: "Earth",
		qualities: ["Growth", "Fertility", "Material success"],
		career: ["Agriculture", "Business", "Creative arts"],
		remedies: ["Brahma mantra", "Green color", "Nature worship"],
	},
	Pushya: {
		deity: "Brihaspati",
		element: "Fire",
		qualities: ["Nourishment", "Wisdom", "Spiritual growth"],
		career: ["Teaching", "Spiritual guidance", "Counseling"],
		remedies: ["Guru mantra", "Yellow color", "Thursday worship"],
	},
	Magha: {
		deity: "Pitris (Ancestors)",
		element: "Fire",
		qualities: ["Royal qualities", "Ancestral blessings", "Leadership"],
		career: ["Leadership", "Government", "Royal positions"],
		remedies: ["Pitri tarpan", "Red color", "Ancestor worship"],
	},
	"Uttara Phalguni": {
		deity: "Aryaman",
		element: "Fire",
		qualities: ["Partnership", "Marriage", "Social success"],
		career: ["Partnerships", "Marriage counseling", "Social work"],
		remedies: ["Aryaman mantra", "Pink color", "Social harmony"],
	},
};

// House-specific detailed significations
const HOUSE_SIGNIFICATIONS = {
	1: {
		primary: "Self and Personality",
		secondary: ["Physical appearance", "Health", "Vitality", "Character"],
		planets: ["Sun", "Mars"],
		remedies: ["Sun worship", "Ruby", "Surya namaskar"],
		colors: ["Red", "Orange"],
		directions: ["East"],
	},
	2: {
		primary: "Wealth and Family",
		secondary: ["Speech", "Food", "Eyes", "Face", "Family"],
		planets: ["Jupiter", "Venus"],
		remedies: ["Jupiter worship", "Yellow sapphire", "Thursday fasting"],
		colors: ["Yellow", "White"],
		directions: ["South"],
	},
	4: {
		primary: "Mother and Home",
		secondary: ["Vehicles", "Happiness", "Education", "Land", "Property"],
		planets: ["Moon", "Venus"],
		remedies: ["Moon worship", "Pearl", "Monday fasting"],
		colors: ["White", "Silver"],
		directions: ["North"],
	},
	7: {
		primary: "Spouse and Partnership",
		secondary: [
			"Marriage",
			"Business partnerships",
			"Foreign lands",
			"Sexual life",
		],
		planets: ["Venus", "Mars"],
		remedies: ["Venus worship", "Diamond", "Friday fasting"],
		colors: ["Pink", "White"],
		directions: ["West"],
	},
	10: {
		primary: "Career and Profession",
		secondary: ["Authority", "Government", "Honor", "Status", "Karma"],
		planets: ["Sun", "Saturn"],
		remedies: ["Sun worship", "Blue sapphire", "Discipline"],
		colors: ["Blue", "Black"],
		directions: ["South"],
	},
};

// Dasha period interpretations
const DASHA_INTERPRETATIONS = {
	Sun: {
		duration: 6,
		qualities: ["Leadership", "Authority", "Government", "Father"],
		positive: ["Career growth", "Authority", "Recognition"],
		challenging: ["Ego issues", "Health problems", "Father's health"],
		remedies: ["Surya namaskar", "Ruby", "Sunday fasting"],
	},
	Moon: {
		duration: 10,
		qualities: ["Mind", "Emotions", "Mother", "Travel"],
		positive: ["Mental peace", "Emotional stability", "Mother's blessings"],
		challenging: ["Mental stress", "Emotional instability", "Mother's health"],
		remedies: ["Chandra mantra", "Pearl", "Monday fasting"],
	},
	Mars: {
		duration: 7,
		qualities: ["Energy", "Courage", "Brothers", "Property"],
		positive: ["Energy boost", "Courage", "Property gains"],
		challenging: ["Accidents", "Anger", "Property disputes"],
		remedies: ["Mangal mantra", "Red coral", "Tuesday fasting"],
	},
	Mercury: {
		duration: 17,
		qualities: ["Communication", "Business", "Education", "Nephews"],
		positive: ["Communication skills", "Business success", "Education"],
		challenging: [
			"Communication issues",
			"Business problems",
			"Nervous disorders",
		],
		remedies: ["Budh mantra", "Emerald", "Wednesday fasting"],
	},
	Jupiter: {
		duration: 16,
		qualities: ["Wisdom", "Children", "Guru", "Religion"],
		positive: ["Wisdom", "Children's success", "Spiritual growth"],
		challenging: [
			"Lack of wisdom",
			"Children's problems",
			"Religious conflicts",
		],
		remedies: ["Guru mantra", "Yellow sapphire", "Thursday fasting"],
	},
	Venus: {
		duration: 20,
		qualities: ["Love", "Marriage", "Luxury", "Arts"],
		positive: ["Love life", "Marriage", "Luxury", "Artistic success"],
		challenging: ["Love problems", "Marriage issues", "Luxury addiction"],
		remedies: ["Shukra mantra", "Diamond", "Friday fasting"],
	},
	Saturn: {
		duration: 19,
		qualities: ["Discipline", "Hard work", "Karma", "Service"],
		positive: ["Discipline", "Hard work success", "Karmic resolution"],
		challenging: ["Depression", "Delays", "Health issues"],
		remedies: ["Shani mantra", "Blue sapphire", "Saturday fasting"],
	},
};

// Build specialized prompts based on context with enhanced accuracy
export function buildSpecializedPrompt(context: AstrologicalContext): string {
	let prompt = "";

	// Add current date context first - CRITICAL for timing
	prompt += getCurrentDateContext(context.currentDate);
	prompt += getConversationalStylePrompt();
	prompt += getAccuracyValidationPrompt();

	// Add birth details context with chart data
	if (context.birthDetails) {
		prompt += `
BIRTH DETAILS ANALYSIS:
Date: ${context.birthDetails.date}
Time: ${context.birthDetails.time}
Place: ${context.birthDetails.place}

CRITICAL ACCURACY REQUIREMENTS:
1. Use EXACT birth time for precise calculations
2. Consider time zone and daylight saving adjustments
3. Calculate Ayanamsa for accurate planetary positions
4. Verify all planetary degrees and Nakshatra positions
5. Cross-check house cusps and planetary aspects

Based on these birth details, provide a comprehensive analysis including:
1. Precise Ascendant calculation with degrees and minutes
2. Exact planetary positions in houses, signs, and Nakshatras
3. Detailed Nakshatra analysis with pada positions
4. Current Vimshottari Dasha period with exact dates
5. Comprehensive Yoga analysis with strength assessment
6. Planetary strength analysis (Shadbala, Ashtakavarga)
7. Transit analysis and their timing effects
`;
	}

	// Add chart data analysis if available
	if (context.chartData) {
		prompt += buildChartAnalysisPrompt(context.chartData);
	}

	// Add question-specific analysis
	const questionType = determineQuestionType(context.question);
	prompt += getQuestionSpecificPrompt(questionType);

	// Add detail level specification
	prompt += getDetailLevelPrompt(context.userPreferences.detailLevel);

	// Add remedy preferences
	prompt += getRemedyPrompt(context.userPreferences.remedyPreference);

	// Add transit analysis if available
	if (context.currentTransits) {
		prompt += getTransitAnalysisPrompt(context.currentTransits);
	}

	// Add timing precision requirements
	prompt += getTimingPrecisionPrompt();

	return prompt;
}

function getAccuracyValidationPrompt(): string {
	return `
ACCURACY VALIDATION REQUIREMENTS:
- Always verify planetary positions against multiple sources
- Check for calculation errors in house positions
- Validate Nakshatra and pada positions
- Confirm Dasha calculations with birth time precision
- Cross-reference yoga conditions with actual chart positions
- Ensure all predictions are based on verified chart data
- Mention confidence levels for predictions
- Acknowledge limitations when birth time is approximate

PREDICTION QUALITY STANDARDS:
- Provide specific timeframes with confidence intervals
- Explain the astrological reasoning behind each prediction
- Distinguish between strong, moderate, and weak indications
- Avoid overly dramatic or fear-inducing language
- Balance positive and challenging aspects
- Offer constructive guidance for difficult periods
`;
}

function buildChartAnalysisPrompt(chartData: {
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
}): string {
	return `
CALCULATED CHART DATA ANALYSIS:
Ascendant: ${chartData.ascendant.sign} at ${chartData.ascendant.degree.toFixed(
		2
	)}°

PLANETARY POSITIONS:
${chartData.planets
	.map(
		(planet) =>
			`${planet.name}: ${planet.sign} (House ${
				planet.house
			}) at ${planet.degree.toFixed(2)}° in ${planet.nakshatra}${
				planet.isRetrograde ? " (R)" : ""
			}`
	)
	.join("\n")}

CURRENT DASHA PERIOD:
${chartData.currentDasha.planet} Mahadasha (${
		chartData.currentDasha.startDate
	} - ${chartData.currentDasha.endDate})
Current Sub-period: ${chartData.currentDasha.subDasha}

DETECTED YOGAS:
${chartData.yogas.join(", ")}

ANALYSIS REQUIREMENTS:
1. Validate all planetary positions and aspects
2. Analyze the strength and dignity of each planet
3. Examine house lordships and their implications
4. Assess the quality and strength of detected yogas
5. Provide precise timing based on current dasha periods
6. Consider planetary transits and their activation points
`;
}

function getCurrentDateContext(currentDate: string): string {
	const date = new Date(currentDate);
	const month = date.toLocaleString("default", { month: "long" });
	const year = date.getFullYear();
	const day = date.getDate();

	return `
CURRENT DATE CONTEXT - CRITICAL FOR TIMING:

TODAY'S DATE: ${day} ${month} ${year}
CURRENT MONTH: ${month} ${year}
CURRENT SEASON: ${getCurrentSeason(date)}

TIMING REFERENCE POINTS:
- "Next 3 months" means: ${getNextMonths(date, 3)}
- "This year" means: ${year}
- "Next year" means: ${year + 1}
- "Coming months" refers to: ${getNextMonths(date, 6)}

USE THIS DATE FOR ALL TIMING PREDICTIONS!
    `;
}

function getCurrentSeason(date: Date): string {
	const month = date.getMonth() + 1; // JavaScript months are 0-indexed
	if (month >= 3 && month <= 5) return "Spring";
	if (month >= 6 && month <= 8) return "Summer/Monsoon";
	if (month >= 9 && month <= 11) return "Post-Monsoon/Autumn";
	return "Winter";
}

function getNextMonths(date: Date, count: number): string {
	const months = [];
	for (let i = 1; i <= count; i++) {
		const nextMonth = new Date(date.getFullYear(), date.getMonth() + i, 1);
		months.push(
			nextMonth.toLocaleString("default", { month: "long", year: "numeric" })
		);
	}
	return months.join(", ");
}

function getTimingPrecisionPrompt(): string {
	return `
TIMING PRECISION REQUIREMENTS:
- Use Vimshottari Dasha system for major life events
- Consider Antardasha and Pratyantardasha for specific timing
- Factor in current planetary transits
- Analyze activation of natal yogas by transits
- Provide date ranges rather than exact dates when appropriate
- Mention the astrological factors behind timing predictions
- Consider the native's current age and life stage
- Account for the maturation periods of different planets

CONFIDENCE LEVELS:
- High confidence: Strong planetary indications with multiple confirmations
- Medium confidence: Clear indications with some supporting factors
- Low confidence: Weak or conflicting indications
- Always mention the basis for your confidence level
`;
}

function getConversationalStylePrompt(): string {
	return `
RESPONSE STYLE - LIKE REAL ASTROLOGERS:

CRITICAL: Your responses should be SHORT, DIRECT, and CONVERSATIONAL like the examples below:
- "Do you have joints pain?"
- "Career opportunity coming in next 3 months"  
- "24th oct. -7th dec ...bahut bahut bahut acha job milta hua najar aa raha hai"
- "You should avoid love relationship right now"
- "Wait" / "Let me check" / "Okay"

RESPONSE RULES:
1. Keep responses SHORT (1-3 sentences max per message)
2. Make DIRECT predictions without long explanations
3. Use SPECIFIC dates/timeframes like "Oct-Nov", "next 3 months", "24th oct-7th dec"
4. Ask simple questions: "IT field me job hai?", "Koi partner hai?", "Do you have health issues?"
5. Use conversational fillers: "Wait", "Let me check", "Okay", "Checking your chart"
6. Mix Hindi/English naturally: "bahut acha", "yoga hai", "time hai"
7. Give immediate observations: "I see...", "Your chart shows...", "Got it"
8. NO long explanations or educational content
9. Focus on WHAT will happen, not WHY it happens
10. Break complex predictions into multiple short messages
11. Use direct statements: "You should avoid...", "Career opportunity coming..."
12. Ask for clarification: "Which field are you in?", "Any partner right now?"
13. Give timing predictions: "3 months", "October-November", specific date ranges
14. Make health observations: "Do you have back pain?", "Joint pain?"
15. Use reassuring language: "Don't worry", "Good news", "Future seems alright"

EXAMPLES OF GOOD RESPONSES:
✅ "Your chart shows government job yoga"
✅ "October-November time very good for career"
✅ "Do you have health issues right now?"
✅ "Wait, let me check your dasha period"
✅ "Avoid starting new relationships till December"
✅ "24th oct-7th dec bahut bahut acha job milega"
✅ "IT field me ho? New opportunity coming"
✅ "Mercury mahadasha chal rahi hai"
✅ "Got it. Future seems alright"
✅ "High authoritative post will suit you"
✅ "Travel chances are also there"
✅ "Which field are you in?"
✅ "Scorpio ascendant and Aquarius moon sign"
✅ "Saturn's sadesati running"
✅ "Marriage yoga started from June"

CONVERSATION FLOW EXAMPLES:
✅ Start: "Wait" / "Let me check" / "Checking your chart"
✅ Observation: "Your chart shows..." / "I see..." / "Got it"
✅ Question: "Do you have...?" / "Which field...?" / "Any partner?"
✅ Prediction: "Next 3 months..." / "October-November..." / "Coming soon"
✅ Advice: "You should..." / "Avoid..." / "Try..."

AVOID:
❌ Long explanations about planetary positions
❌ Educational content about astrology
❌ Multiple paragraphs
❌ Technical jargon without context
❌ Overly formal language
❌ Bullet points and formatting
❌ Multiple predictions in one message
  `;
}

function determineQuestionType(question: string): string {
	const q = question.toLowerCase();

	if (q.includes("career") || q.includes("job") || q.includes("profession"))
		return "career";
	if (
		q.includes("marriage") ||
		q.includes("relationship") ||
		q.includes("love")
	)
		return "relationship";
	if (q.includes("health") || q.includes("medical") || q.includes("disease"))
		return "health";
	if (q.includes("finance") || q.includes("money") || q.includes("wealth"))
		return "finance";
	if (q.includes("education") || q.includes("study") || q.includes("learning"))
		return "education";
	if (q.includes("spiritual") || q.includes("dharma") || q.includes("moksha"))
		return "spiritual";
	if (q.includes("travel") || q.includes("journey") || q.includes("foreign"))
		return "travel";

	return "general";
}

function getQuestionSpecificPrompt(questionType: string): string {
	const prompts = {
		career: `
CAREER GUIDANCE APPROACH:
- Begin with an encouraging note about their potential
- Relate planetary positions to real-world career challenges
- Share stories of similar career journeys when appropriate
- Focus on practical, actionable advice
- Emphasize their unique strengths and talents
- Suggest timing for important career moves in relatable terms
`,
		relationship: `
RELATIONSHIP GUIDANCE APPROACH:
- Show empathy for relationship challenges
- Explain planetary influences on emotions and connections
- Share wisdom about love and partnership
- Suggest ways to nurture relationships
- Discuss timing for important relationship decisions
- Remind them that astrology shows tendencies, not destiny
`,
		health: `
HEALTH ANALYSIS REQUIREMENTS:
- Analyze 6th house (diseases) and its lord comprehensively
- Examine Moon (mind) and its placement for mental health
- Consider Mars (energy) and Saturn (chronic conditions)
- Look at 8th house for serious health issues
- Analyze health-related yogas and combinations
- Provide health timing and precautionary measures
- Suggest health-specific remedies and lifestyle changes
`,
		finance: `
FINANCE ANALYSIS REQUIREMENTS:
- Analyze 2nd house (wealth) and 11th house (income) thoroughly
- Examine Jupiter (wealth significator) placement and strength
- Consider Venus (luxury) and its influence on spending
- Look for wealth-related yogas (Lakshmi Yoga, Dhana Yoga)
- Provide financial timing and investment opportunities
- Suggest wealth-specific remedies and gemstones
- Include current transit effects on finances
`,
		education: `
EDUCATION ANALYSIS REQUIREMENTS:
- Analyze 4th house (education) and 5th house (intelligence) in detail
- Examine Mercury (learning) and Jupiter (wisdom) placements
- Consider current dasha period for educational timing
- Look for education-related yogas and combinations
- Provide education timing and learning opportunities
- Suggest education-specific remedies and mantras
- Include guidance on study methods and subjects
`,
		spiritual: `
SPIRITUAL ANALYSIS REQUIREMENTS:
- Analyze 9th house (dharma) and 12th house (moksha) thoroughly
- Examine Jupiter (spiritual wisdom) and Ketu (detachment)
- Consider Saturn (discipline) for spiritual practices
- Look for spiritual yogas (Brahma Yoga, Moksha Yoga)
- Provide spiritual timing and practice recommendations
- Suggest spiritual-specific remedies and sadhana
- Include guidance on meditation and spiritual growth
`,
		general: `
GENERAL LIFE ANALYSIS REQUIREMENTS:
- Provide comprehensive birth chart overview
- Analyze all major houses and their lords
- Examine current dasha period and its effects
- Look for major yogas and combinations
- Provide general life timing and opportunities
- Suggest overall remedies and gemstones
- Include guidance for personal development
`,
	};

	return prompts[questionType as keyof typeof prompts] || prompts.general;
}

function getDetailLevelPrompt(level: string): string {
	const levels = {
		basic: `
DETAIL LEVEL: BASIC (CONVERSATIONAL STYLE)
- Keep responses very short (1-2 sentences)
- Make direct predictions only
- Ask simple questions
- Use timing like "next 3 months", "Oct-Nov"
- No explanations, just predictions
`,
		comprehensive: `
DETAIL LEVEL: COMPREHENSIVE (CONVERSATIONAL STYLE)
- Still keep responses short but can give 2-3 predictions
- Include specific timing and key observations
- Ask follow-up questions naturally
- Mention key yogas/periods briefly
- Focus on practical guidance in simple terms
`,
		expert: `
DETAIL LEVEL: EXPERT (CONVERSATIONAL STYLE)  
- Can mention technical terms but keep responses short
- Give precise timing and multiple predictions
- Reference specific planetary positions briefly
- Still maintain conversational, direct style
- Break complex analysis into multiple short messages
`,
	};

	return levels[level as keyof typeof levels] || levels.basic;
}

function getRemedyPrompt(preference: string): string {
	const remedies = {
		all: `
REMEDY PREFERENCES: ALL TYPES
- Provide mantras for specific planets
- Suggest appropriate gemstones
- Include ritual remedies (Puja, Homa)
- Recommend lifestyle changes
- Suggest charitable acts (Daan)
- Include spiritual practices
`,
		mantras: `
REMEDY PREFERENCES: MANTRAS
- Focus on specific planetary mantras
- Include pronunciation and timing
- Provide mantra benefits and effects
- Suggest meditation practices
`,
		gemstones: `
REMEDY PREFERENCES: GEMSTONES
- Recommend specific gemstones for planets
- Include wearing instructions and timing
- Provide gemstone benefits and effects
- Suggest alternative stones if needed
`,
		rituals: `
REMEDY PREFERENCES: RITUALS
- Suggest specific pujas and homas
- Include ritual procedures and timing
- Provide ritual benefits and effects
- Recommend temple visits and pilgrimages
`,
	};

	return remedies[preference as keyof typeof remedies] || remedies.all;
}

function getTransitAnalysisPrompt(transits: {
	date: string;
	planets?: Array<{
		name: string;
		sign: string;
		degree: number;
		isRetrograde: boolean;
	}>;
}): string {
	return `
CURRENT TRANSIT ANALYSIS:
Date: ${transits.date}

Please analyze the effects of current planetary transits:
- Transit effects on different houses
- Beneficial and challenging periods
- Specific timing for important decisions
- Transit-based remedies and precautions
- How transits interact with natal chart
`;
}

// Export constants for use in other modules
export {
	ADVANCED_YOGAS,
	NAKSHATRA_INTERPRETATIONS,
	HOUSE_SIGNIFICATIONS,
	DASHA_INTERPRETATIONS,
};
