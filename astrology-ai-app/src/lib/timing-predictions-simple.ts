// Simplified Enhanced Timing Predictions Module
// This module provides precise timing predictions using advanced Vedic astrology techniques

export interface TimingPrediction {
	type: "dasha" | "transit" | "yoga_activation" | "planetary_period";
	planet: string;
	startDate: Date;
	endDate: Date;
	strength: "high" | "medium" | "low";
	description: string;
	specificEvents: string[];
	remedies: string[];
	confidence: number; // 0-100
}

export interface DashaBreakdown {
	mahadasha: {
		planet: string;
		startDate: Date;
		endDate: Date;
		remainingYears: number;
		strength: number;
		effects: string[];
	};
	antardasha: {
		planet: string;
		startDate: Date;
		endDate: Date;
		remainingMonths: number;
		strength: number;
		effects: string[];
	};
	pratyantardasha: {
		planet: string;
		startDate: Date;
		endDate: Date;
		remainingDays: number;
		strength: number;
		effects: string[];
	};
}

// Enhanced Vimshottari Dasha periods with precise timing
const ENHANCED_DASHA_PERIODS = {
	Sun: {
		years: 6,
		nature: "fire",
		significations: ["leadership", "authority", "government", "father", "ego"],
	},
	Moon: {
		years: 10,
		nature: "water",
		significations: ["mind", "emotions", "mother", "travel", "intuition"],
	},
	Mars: {
		years: 7,
		nature: "fire",
		significations: ["energy", "courage", "brothers", "property", "aggression"],
	},
	Mercury: {
		years: 17,
		nature: "earth",
		significations: [
			"communication",
			"business",
			"education",
			"nephews",
			"intelligence",
		],
	},
	Jupiter: {
		years: 16,
		nature: "ether",
		significations: ["wisdom", "children", "guru", "religion", "expansion"],
	},
	Venus: {
		years: 20,
		nature: "water",
		significations: ["love", "marriage", "luxury", "arts", "beauty"],
	},
	Saturn: {
		years: 19,
		nature: "air",
		significations: ["discipline", "hard_work", "karma", "service", "delays"],
	},
	Rahu: {
		years: 18,
		nature: "shadow",
		significations: [
			"illusion",
			"foreign",
			"technology",
			"sudden_changes",
			"mystery",
		],
	},
	Ketu: {
		years: 7,
		nature: "shadow",
		significations: [
			"detachment",
			"spiritual",
			"research",
			"hidden_knowledge",
			"karma",
		],
	},
};

// Calculate precise Dasha breakdown with current date
export function calculateCurrentDashaBreakdown(
	birthDate: Date,
	birthNakshatra: string,
	currentDate: Date = new Date()
): DashaBreakdown {
	const birthNakshatraRuler = getNakshatraRuler(birthNakshatra);
	const dashaSequence = getDashaSequence(birthNakshatraRuler);

	let runningDate = new Date(birthDate);
	let currentMahadasha = "";
	let currentAntardasha = "";
	let currentPratyantardasha = "";

	// Calculate Mahadasha
	for (const planet of dashaSequence) {
		const period =
			ENHANCED_DASHA_PERIODS[planet as keyof typeof ENHANCED_DASHA_PERIODS];
		const endDate = new Date(runningDate);
		endDate.setFullYear(endDate.getFullYear() + period.years);

		if (currentDate >= runningDate && currentDate < endDate) {
			currentMahadasha = planet;
			break;
		}
		runningDate = endDate;
	}

	// Calculate Antardasha (sub-period)
	const mahadashaStart = getMahadashaStart(
		birthDate,
		birthNakshatra,
		currentMahadasha
	);
	const antardashaSequence = getDashaSequence(currentMahadasha);

	runningDate = new Date(mahadashaStart);
	for (const planet of antardashaSequence) {
		const mahadashaPeriod =
			ENHANCED_DASHA_PERIODS[
				currentMahadasha as keyof typeof ENHANCED_DASHA_PERIODS
			];
		const antardashaYears =
			(ENHANCED_DASHA_PERIODS[planet as keyof typeof ENHANCED_DASHA_PERIODS]
				.years *
				mahadashaPeriod.years) /
			120;
		const endDate = new Date(runningDate);
		endDate.setFullYear(endDate.getFullYear() + antardashaYears);

		if (currentDate >= runningDate && currentDate < endDate) {
			currentAntardasha = planet;
			break;
		}
		runningDate = endDate;
	}

	// Calculate Pratyantardasha (sub-sub-period)
	const antardashaStart = getAntardashaStart(
		mahadashaStart,
		currentMahadasha,
		currentAntardasha
	);
	const pratyantardashaSequence = getDashaSequence(currentAntardasha);

	runningDate = new Date(antardashaStart);
	for (const planet of pratyantardashaSequence) {
		const antardashaPeriod =
			ENHANCED_DASHA_PERIODS[
				currentAntardasha as keyof typeof ENHANCED_DASHA_PERIODS
			];
		const mahadashaPeriod =
			ENHANCED_DASHA_PERIODS[
				currentMahadasha as keyof typeof ENHANCED_DASHA_PERIODS
			];
		const pratyantardashaDays =
			(ENHANCED_DASHA_PERIODS[planet as keyof typeof ENHANCED_DASHA_PERIODS]
				.years *
				antardashaPeriod.years *
				mahadashaPeriod.years *
				365.25) /
			(120 * 120);
		const endDate = new Date(runningDate);
		endDate.setDate(endDate.getDate() + pratyantardashaDays);

		if (currentDate >= runningDate && currentDate < endDate) {
			currentPratyantardasha = planet;
			break;
		}
		runningDate = endDate;
	}

	return {
		mahadasha: {
			planet: currentMahadasha,
			startDate: mahadashaStart,
			endDate: getMahadashaEnd(mahadashaStart, currentMahadasha),
			remainingYears: calculateRemainingYears(
				mahadashaStart,
				currentMahadasha,
				currentDate
			),
			strength: calculatePlanetaryStrength(currentMahadasha),
			effects: getDashaEffects(currentMahadasha, "mahadasha"),
		},
		antardasha: {
			planet: currentAntardasha,
			startDate: antardashaStart,
			endDate: getAntardashaEnd(
				antardashaStart,
				currentMahadasha,
				currentAntardasha
			),
			remainingMonths: calculateRemainingMonths(
				antardashaStart,
				currentMahadasha,
				currentAntardasha,
				currentDate
			),
			strength: calculatePlanetaryStrength(currentAntardasha),
			effects: getDashaEffects(currentAntardasha, "antardasha"),
		},
		pratyantardasha: {
			planet: currentPratyantardasha,
			startDate: getPratyantardashaStart(
				antardashaStart,
				currentMahadasha,
				currentAntardasha,
				currentPratyantardasha
			),
			endDate: getPratyantardashaEnd(
				antardashaStart,
				currentMahadasha,
				currentAntardasha,
				currentPratyantardasha
			),
			remainingDays: calculateRemainingDays(
				antardashaStart,
				currentMahadasha,
				currentAntardasha,
				currentPratyantardasha,
				currentDate
			),
			strength: calculatePlanetaryStrength(currentPratyantardasha),
			effects: getDashaEffects(currentPratyantardasha, "pratyantardasha"),
		},
	};
}

// Generate specific timing predictions
export function generateTimingPredictions(
	birthChart: {
		birthDate: string;
		birthNakshatra: string;
		ascendant: { sign: string; degree: number };
		planets: Array<{
			name: string;
			sign: string;
			house: number;
			degree: number;
			nakshatra: string;
		}>;
	},
	questionType: string,
	currentDate: Date = new Date()
): TimingPrediction[] {
	const predictions: TimingPrediction[] = [];

	// Get current Dasha breakdown
	const dashaBreakdown = calculateCurrentDashaBreakdown(
		new Date(birthChart.birthDate),
		birthChart.birthNakshatra,
		currentDate
	);

	// Generate predictions based on question type
	switch (questionType) {
		case "career":
			predictions.push(
				...generateCareerTimingPredictions(dashaBreakdown, birthChart)
			);
			break;
		case "relationship":
			predictions.push(
				...generateRelationshipTimingPredictions(dashaBreakdown, birthChart)
			);
			break;
		case "health":
			predictions.push(
				...generateHealthTimingPredictions(dashaBreakdown, birthChart)
			);
			break;
		case "finance":
			predictions.push(
				...generateFinanceTimingPredictions(dashaBreakdown, birthChart)
			);
			break;
		default:
			predictions.push(
				...generateGeneralTimingPredictions(dashaBreakdown, birthChart)
			);
	}

	return predictions.sort((a, b) => b.confidence - a.confidence);
}

// Generate career-specific timing predictions
function generateCareerTimingPredictions(
	dashaBreakdown: DashaBreakdown,
	birthChart: {
		birthDate: string;
		birthNakshatra: string;
		ascendant: { sign: string; degree: number };
		planets: Array<{
			name: string;
			sign: string;
			house: number;
			degree: number;
			nakshatra: string;
		}>;
	}
): TimingPrediction[] {
	const predictions: TimingPrediction[] = [];

	// Check current Dasha for career effects
	if (
		dashaBreakdown.mahadasha.planet === "Sun" ||
		dashaBreakdown.mahadasha.planet === "Jupiter"
	) {
		predictions.push({
			type: "dasha",
			planet: dashaBreakdown.mahadasha.planet,
			startDate: dashaBreakdown.mahadasha.startDate,
			endDate: dashaBreakdown.mahadasha.endDate,
			strength: "high",
			description: `${dashaBreakdown.mahadasha.planet} Mahadasha - Strong career period`,
			specificEvents: [
				"Career growth and advancement",
				"Authority and recognition",
				"Government connections",
				"Professional success",
			],
			remedies: [
				"Regular planet worship",
				"Charity and service",
				"Discipline and hard work",
			],
			confidence: 90,
		});
	}

	return predictions;
}

// Generate relationship-specific timing predictions
function generateRelationshipTimingPredictions(
	dashaBreakdown: DashaBreakdown,
	birthChart: {
		birthDate: string;
		birthNakshatra: string;
		ascendant: { sign: string; degree: number };
		planets: Array<{
			name: string;
			sign: string;
			house: number;
			degree: number;
			nakshatra: string;
		}>;
	}
): TimingPrediction[] {
	const predictions: TimingPrediction[] = [];

	// Check Venus Dasha for relationship timing
	if (dashaBreakdown.mahadasha.planet === "Venus") {
		predictions.push({
			type: "dasha",
			planet: "Venus",
			startDate: dashaBreakdown.mahadasha.startDate,
			endDate: dashaBreakdown.mahadasha.endDate,
			strength: "high",
			description: "Venus Mahadasha - Prime relationship period",
			specificEvents: [
				"Marriage timing",
				"Love relationships",
				"Partnership opportunities",
				"Artistic success",
			],
			remedies: [
				"Venus mantras",
				"Diamond gemstone",
				"Friday worship",
				"Lakshmi sadhana",
			],
			confidence: 95,
		});
	}

	return predictions;
}

// Generate health-specific timing predictions
function generateHealthTimingPredictions(
	dashaBreakdown: DashaBreakdown,
	birthChart: {
		birthDate: string;
		birthNakshatra: string;
		ascendant: { sign: string; degree: number };
		planets: Array<{
			name: string;
			sign: string;
			house: number;
			degree: number;
			nakshatra: string;
		}>;
	}
): TimingPrediction[] {
	const predictions: TimingPrediction[] = [];

	// Add health-related predictions based on current Dasha
	if (dashaBreakdown.mahadasha.planet === "Saturn") {
		predictions.push({
			type: "dasha",
			planet: "Saturn",
			startDate: dashaBreakdown.mahadasha.startDate,
			endDate: dashaBreakdown.mahadasha.endDate,
			strength: "medium",
			description: "Saturn Mahadasha - Health attention needed",
			specificEvents: [
				"Health challenges",
				"Medical checkups needed",
				"Lifestyle changes required",
				"Recovery period",
			],
			remedies: [
				"Regular exercise",
				"Healthy diet",
				"Saturn-specific remedies",
				"Medical consultation",
			],
			confidence: 75,
		});
	}

	return predictions;
}

// Generate finance-specific timing predictions
function generateFinanceTimingPredictions(
	dashaBreakdown: DashaBreakdown,
	birthChart: {
		birthDate: string;
		birthNakshatra: string;
		ascendant: { sign: string; degree: number };
		planets: Array<{
			name: string;
			sign: string;
			house: number;
			degree: number;
			nakshatra: string;
		}>;
	}
): TimingPrediction[] {
	const predictions: TimingPrediction[] = [];

	// Check Jupiter Dasha for wealth timing
	if (dashaBreakdown.mahadasha.planet === "Jupiter") {
		predictions.push({
			type: "dasha",
			planet: "Jupiter",
			startDate: dashaBreakdown.mahadasha.startDate,
			endDate: dashaBreakdown.mahadasha.endDate,
			strength: "high",
			description: "Jupiter Mahadasha - Wealth multiplication period",
			specificEvents: [
				"Income increase",
				"Investment success",
				"Property gains",
				"Business opportunities",
			],
			remedies: [
				"Wealth mantras",
				"Charity and donation",
				"Yellow sapphire",
				"Thursday fasting",
			],
			confidence: 85,
		});
	}

	return predictions;
}

// Generate general timing predictions
function generateGeneralTimingPredictions(
	dashaBreakdown: DashaBreakdown,
	birthChart: {
		birthDate: string;
		birthNakshatra: string;
		ascendant: { sign: string; degree: number };
		planets: Array<{
			name: string;
			sign: string;
			house: number;
			degree: number;
			nakshatra: string;
		}>;
	}
): TimingPrediction[] {
	const predictions: TimingPrediction[] = [];

	// Add current Dasha effects
	predictions.push({
		type: "dasha",
		planet: dashaBreakdown.mahadasha.planet,
		startDate: dashaBreakdown.mahadasha.startDate,
		endDate: dashaBreakdown.mahadasha.endDate,
		strength: dashaBreakdown.mahadasha.strength > 70 ? "high" : "medium",
		description: `${dashaBreakdown.mahadasha.planet} Mahadasha period`,
		specificEvents: getDashaEffects(
			dashaBreakdown.mahadasha.planet,
			"mahadasha"
		),
		remedies: getDashaRemedies(dashaBreakdown.mahadasha.planet),
		confidence: dashaBreakdown.mahadasha.strength,
	});

	return predictions;
}

// Helper functions
function getNakshatraRuler(nakshatra: string): string {
	const nakshatraRulers: { [key: string]: string } = {
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
	return nakshatraRulers[nakshatra] || "Sun";
}

function getDashaSequence(startPlanet: string): string[] {
	const sequence = [
		"Sun",
		"Moon",
		"Mars",
		"Rahu",
		"Jupiter",
		"Saturn",
		"Mercury",
		"Ketu",
		"Venus",
	];
	const startIndex = sequence.indexOf(startPlanet);
	return [...sequence.slice(startIndex), ...sequence.slice(0, startIndex)];
}

function getMahadashaStart(
	birthDate: Date,
	birthNakshatra: string,
	planet: string
): Date {
	const startDate = new Date(birthDate);
	const nakshatraRuler = getNakshatraRuler(birthNakshatra);
	const sequence = getDashaSequence(nakshatraRuler);
	const planetIndex = sequence.indexOf(planet);

	const runningDate = new Date(birthDate);
	for (let i = 0; i < planetIndex; i++) {
		const currentPlanet = sequence[i];
		const period =
			ENHANCED_DASHA_PERIODS[
				currentPlanet as keyof typeof ENHANCED_DASHA_PERIODS
			];
		runningDate.setFullYear(runningDate.getFullYear() + period.years);
	}

	return runningDate;
}

function getMahadashaEnd(startDate: Date, planet: string): Date {
	const period =
		ENHANCED_DASHA_PERIODS[planet as keyof typeof ENHANCED_DASHA_PERIODS];
	const endDate = new Date(startDate);
	endDate.setFullYear(endDate.getFullYear() + period.years);
	return endDate;
}

function getAntardashaStart(
	mahadashaStart: Date,
	mahadashaPlanet: string,
	antardashaPlanet: string
): Date {
	const sequence = getDashaSequence(mahadashaPlanet);
	const planetIndex = sequence.indexOf(antardashaPlanet);

	const runningDate = new Date(mahadashaStart);
	for (let i = 0; i < planetIndex; i++) {
		const currentPlanet = sequence[i];
		const mahadashaPeriod =
			ENHANCED_DASHA_PERIODS[
				mahadashaPlanet as keyof typeof ENHANCED_DASHA_PERIODS
			];
		const antardashaYears =
			(ENHANCED_DASHA_PERIODS[
				currentPlanet as keyof typeof ENHANCED_DASHA_PERIODS
			].years *
				mahadashaPeriod.years) /
			120;
		runningDate.setFullYear(runningDate.getFullYear() + antardashaYears);
	}

	return runningDate;
}

function getAntardashaEnd(
	startDate: Date,
	mahadashaPlanet: string,
	antardashaPlanet: string
): Date {
	const mahadashaPeriod =
		ENHANCED_DASHA_PERIODS[
			mahadashaPlanet as keyof typeof ENHANCED_DASHA_PERIODS
		];
	const antardashaYears =
		(ENHANCED_DASHA_PERIODS[
			antardashaPlanet as keyof typeof ENHANCED_DASHA_PERIODS
		].years *
			mahadashaPeriod.years) /
		120;
	const endDate = new Date(startDate);
	endDate.setFullYear(endDate.getFullYear() + antardashaYears);
	return endDate;
}

function getPratyantardashaStart(
	antardashaStart: Date,
	mahadashaPlanet: string,
	antardashaPlanet: string,
	pratyantardashaPlanet: string
): Date {
	const sequence = getDashaSequence(antardashaPlanet);
	const planetIndex = sequence.indexOf(pratyantardashaPlanet);

	const runningDate = new Date(antardashaStart);
	for (let i = 0; i < planetIndex; i++) {
		const currentPlanet = sequence[i];
		const antardashaPeriod =
			ENHANCED_DASHA_PERIODS[
				antardashaPlanet as keyof typeof ENHANCED_DASHA_PERIODS
			];
		const mahadashaPeriod =
			ENHANCED_DASHA_PERIODS[
				mahadashaPlanet as keyof typeof ENHANCED_DASHA_PERIODS
			];
		const pratyantardashaDays =
			(ENHANCED_DASHA_PERIODS[
				currentPlanet as keyof typeof ENHANCED_DASHA_PERIODS
			].years *
				antardashaPeriod.years *
				mahadashaPeriod.years *
				365.25) /
			(120 * 120);
		runningDate.setDate(runningDate.getDate() + pratyantardashaDays);
	}

	return runningDate;
}

function getPratyantardashaEnd(
	antardashaStart: Date,
	mahadashaPlanet: string,
	antardashaPlanet: string,
	pratyantardashaPlanet: string
): Date {
	const antardashaPeriod =
		ENHANCED_DASHA_PERIODS[
			antardashaPlanet as keyof typeof ENHANCED_DASHA_PERIODS
		];
	const mahadashaPeriod =
		ENHANCED_DASHA_PERIODS[
			mahadashaPlanet as keyof typeof ENHANCED_DASHA_PERIODS
		];
	const pratyantardashaDays =
		(ENHANCED_DASHA_PERIODS[
			pratyantardashaPlanet as keyof typeof ENHANCED_DASHA_PERIODS
		].years *
			antardashaPeriod.years *
			mahadashaPeriod.years *
			365.25) /
		(120 * 120);
	const endDate = new Date(antardashaStart);
	endDate.setDate(endDate.getDate() + pratyantardashaDays);
	return endDate;
}

function calculateRemainingYears(
	startDate: Date,
	planet: string,
	currentDate: Date
): number {
	const endDate = getMahadashaEnd(startDate, planet);
	const remainingMs = endDate.getTime() - currentDate.getTime();
	return Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24 * 365.25)));
}

function calculateRemainingMonths(
	startDate: Date,
	mahadashaPlanet: string,
	antardashaPlanet: string,
	currentDate: Date
): number {
	const endDate = getAntardashaEnd(
		startDate,
		mahadashaPlanet,
		antardashaPlanet
	);
	const remainingMs = endDate.getTime() - currentDate.getTime();
	return Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24 * 30.44)));
}

function calculateRemainingDays(
	startDate: Date,
	mahadashaPlanet: string,
	antardashaPlanet: string,
	pratyantardashaPlanet: string,
	currentDate: Date
): number {
	const endDate = getPratyantardashaEnd(
		startDate,
		mahadashaPlanet,
		antardashaPlanet,
		pratyantardashaPlanet
	);
	const remainingMs = endDate.getTime() - currentDate.getTime();
	return Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)));
}

function calculatePlanetaryStrength(planet: string): number {
	const baseStrength = 50;
	const planetStrengths: { [key: string]: number } = {
		Sun: 70,
		Moon: 65,
		Mars: 75,
		Mercury: 60,
		Jupiter: 80,
		Venus: 70,
		Saturn: 65,
		Rahu: 55,
		Ketu: 55,
	};
	return planetStrengths[planet] || baseStrength;
}

function getDashaEffects(planet: string, level: string): string[] {
	const effects: { [key: string]: string[] } = {
		Sun: [
			"Leadership opportunities",
			"Government connections",
			"Father's blessings",
			"Career growth",
		],
		Moon: [
			"Mental peace",
			"Mother's blessings",
			"Travel opportunities",
			"Emotional stability",
		],
		Mars: [
			"Energy boost",
			"Property gains",
			"Courage increase",
			"Brother's support",
		],
		Mercury: [
			"Communication skills",
			"Business success",
			"Education opportunities",
			"Intelligence boost",
		],
		Jupiter: [
			"Wisdom increase",
			"Children's success",
			"Guru blessings",
			"Spiritual growth",
		],
		Venus: [
			"Love relationships",
			"Marriage prospects",
			"Artistic success",
			"Luxury and comfort",
		],
		Saturn: [
			"Hard work success",
			"Discipline increase",
			"Karmic resolution",
			"Service opportunities",
		],
		Rahu: [
			"Foreign connections",
			"Technology success",
			"Sudden changes",
			"Mystery and occult",
		],
		Ketu: [
			"Spiritual growth",
			"Research success",
			"Hidden knowledge",
			"Detachment and wisdom",
		],
	};
	return effects[planet] || ["General effects"];
}

function getDashaRemedies(planet: string): string[] {
	const remedies: { [key: string]: string[] } = {
		Sun: [
			"Surya namaskar",
			"Ruby gemstone",
			"Sunday fasting",
			"Father's service",
		],
		Moon: [
			"Chandra mantra",
			"Pearl gemstone",
			"Monday fasting",
			"Mother's service",
		],
		Mars: ["Mangal mantra", "Red coral", "Tuesday fasting", "Hanuman worship"],
		Mercury: [
			"Budh mantra",
			"Emerald gemstone",
			"Wednesday fasting",
			"Vishnu worship",
		],
		Jupiter: [
			"Guru mantra",
			"Yellow sapphire",
			"Thursday fasting",
			"Charity and donation",
		],
		Venus: [
			"Shukra mantra",
			"Diamond gemstone",
			"Friday fasting",
			"Lakshmi worship",
		],
		Saturn: [
			"Shani mantra",
			"Blue sapphire",
			"Saturday fasting",
			"Service to elderly",
		],
		Rahu: [
			"Rahu mantra",
			"Hessonite garnet",
			"Saturday fasting",
			"Rudra worship",
		],
		Ketu: ["Ketu mantra", "Cat's eye", "Tuesday fasting", "Ganesha worship"],
	};
	return remedies[planet] || ["General remedies"];
}
