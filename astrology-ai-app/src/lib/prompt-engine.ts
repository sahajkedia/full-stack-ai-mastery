// Advanced Prompt Engineering for Vedic Astrology

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
}

// Advanced Yogas and Planetary Combinations
const ADVANCED_YOGAS = {
	"Gajakesari Yoga": {
		condition: "Jupiter in Kendra (1,4,7,10) from Moon",
		effects: ["Wisdom", "Leadership", "Spiritual growth", "Success in life"],
		remedies: ["Jupiter mantras", "Yellow sapphire", "Thursday fasting"],
	},
	"Kesari Yoga": {
		condition: "Jupiter in 1st house with strong Moon",
		effects: ["Intelligence", "Good fortune", "Respect in society"],
		remedies: ["Jupiter worship", "Yellow clothes", "Guru seva"],
	},
	"Panch Mahapurush Yoga": {
		condition:
			"Any of the 5 planets (Mercury, Venus, Mars, Jupiter, Saturn) in own/exaltation sign in Kendra",
		effects: [
			"Exceptional qualities",
			"Leadership",
			"Success in respective fields",
		],
		remedies: ["Planet-specific remedies", "Gemstones", "Mantras"],
	},
	"Raja Yoga": {
		condition: "Strong planets in Kendra and Trikona houses",
		effects: ["Royal qualities", "Leadership", "Authority", "Success"],
		remedies: ["Sun worship", "Ruby gemstone", "Surya namaskar"],
	},
	"Dharma Karmadhipati Yoga": {
		condition: "9th and 10th house lords in mutual aspect",
		effects: [
			"Dharma and karma alignment",
			"Spiritual success",
			"Career growth",
		],
		remedies: ["Jupiter remedies", "Saturn remedies", "Spiritual practices"],
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

// Build specialized prompts based on context
export function buildSpecializedPrompt(context: AstrologicalContext): string {
	let prompt = "";

	// Add birth details context
	if (context.birthDetails) {
		prompt += `
BIRTH DETAILS ANALYSIS:
Date: ${context.birthDetails.date}
Time: ${context.birthDetails.time}
Place: ${context.birthDetails.place}

Based on these birth details, provide a comprehensive analysis including:
1. Ascendant calculation and its significance
2. Planetary positions in houses and signs
3. Nakshatra analysis for each planet
4. Current dasha period and its effects
5. Planetary combinations (Yogas) present in the chart
`;
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

	return prompt;
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
CAREER ANALYSIS REQUIREMENTS:
- Analyze 10th house (Karma Bhava) and its lord in detail
- Examine Sun (career significator) placement and strength
- Consider Saturn (discipline) and its influence on career
- Look for career-related yogas (Raja Yoga, Dharma Karmadhipati)
- Provide specific career timing and opportunities
- Suggest career-specific remedies and gemstones
- Include current transit effects on career
`,
		relationship: `
RELATIONSHIP ANALYSIS REQUIREMENTS:
- Analyze 7th house (Kalatra Bhava) and its lord thoroughly
- Examine Venus (love significator) placement and aspects
- Consider Mars (passion) and its influence on relationships
- Look at 5th house for romance and 8th house for intimacy
- Analyze Rahu-Ketu axis for karmic relationships
- Provide relationship timing and compatibility analysis
- Suggest relationship-specific remedies and mantras
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
DETAIL LEVEL: BASIC
- Provide essential information only
- Focus on key planetary positions
- Give basic remedies and suggestions
- Keep explanations simple and clear
`,
		comprehensive: `
DETAIL LEVEL: COMPREHENSIVE
- Provide detailed analysis of all relevant houses
- Include planetary combinations and yogas
- Give specific timing and predictions
- Provide detailed remedies and gemstones
- Include practical guidance and solutions
`,
		expert: `
DETAIL LEVEL: EXPERT
- Provide expert-level analysis with technical details
- Include advanced yogas and combinations
- Give precise timing with degrees and minutes
- Provide advanced remedies and spiritual practices
- Include references to classical texts
- Analyze subtle planetary influences
`,
	};

	return levels[level as keyof typeof levels] || levels.comprehensive;
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

function getTransitAnalysisPrompt(transits: any): string {
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
