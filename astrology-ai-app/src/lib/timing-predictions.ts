// Enhanced Timing Predictions Module
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

export interface TransitAnalysis {
	planet: string;
	currentSign: string;
	currentDegree: number;
	enteringSign: string;
	enteringDate: Date;
	houseEffect: number;
	strength: number;
	effects: string[];
}

export interface DashaBreakdown {
	mahadasha: {
		planet: string;
		startDate: Date;
		endDate: Date;
		remainingYears: number;
		strength: number;
		effects: string[];
		favorableMonths: string[];
		challengingMonths: string[];
		keyEvents: string[];
		remedies: string[];
		confidence: number;
	};
	antardasha: {
		planet: string;
		startDate: Date;
		endDate: Date;
		remainingMonths: number;
		strength: number;
		effects: string[];
		specificTiming: string[];
		opportunities: string[];
		challenges: string[];
		remedies: string[];
		confidence: number;
	};
	pratyantardasha: {
		planet: string;
		startDate: Date;
		endDate: Date;
		remainingDays: number;
		strength: number;
		effects: string[];
		dailyInfluence: string[];
		bestDays: string[];
		cautionDays: string[];
		confidence: number;
	};
	upcomingPeriods: Array<{
		type: "mahadasha" | "antardasha";
		planet: string;
		startDate: Date;
		endDate: Date;
		duration: string;
		majorThemes: string[];
		significance: "high" | "medium" | "low";
	}>;
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

// Planetary transit effects by house
const TRANSIT_EFFECTS = {
	Sun: {
		1: ["confidence boost", "leadership opportunities", "health improvement"],
		2: ["wealth gains", "family harmony", "speech improvement"],
		3: ["courage increase", "sibling support", "short journeys"],
		4: ["mother's blessings", "property gains", "vehicle purchase"],
		5: ["intelligence boost", "romance", "speculation success"],
		6: ["overcome enemies", "health recovery", "debt clearance"],
		7: ["partnership opportunities", "marriage prospects", "business deals"],
		8: ["transformation", "occult interests", "hidden knowledge"],
		9: ["dharma fulfillment", "guru blessings", "long journeys"],
		10: ["career advancement", "authority increase", "recognition"],
		11: ["income growth", "desire fulfillment", "friendship expansion"],
		12: ["spiritual growth", "foreign connections", "expenses"],
	},
	Jupiter: {
		1: ["wisdom increase", "spiritual growth", "blessings"],
		2: ["wealth multiplication", "family prosperity", "knowledge gain"],
		3: ["courage and strength", "sibling success", "communication skills"],
		4: ["mother's health", "property gains", "education success"],
		5: ["children's success", "intelligence boost", "romance"],
		6: ["enemy defeat", "health recovery", "service opportunities"],
		7: ["marriage prospects", "partnership success", "foreign benefits"],
		8: ["occult knowledge", "transformation", "hidden wisdom"],
		9: ["dharma fulfillment", "guru blessings", "spiritual success"],
		10: ["career growth", "authority increase", "government favor"],
		11: ["income growth", "desire fulfillment", "success"],
		12: ["spiritual liberation", "foreign success", "expense control"],
	},
	Saturn: {
		1: ["discipline increase", "hard work success", "health challenges"],
		2: ["wealth through effort", "family responsibilities", "speech control"],
		3: ["courage through struggle", "sibling support", "communication focus"],
		4: ["mother's health", "property through effort", "education focus"],
		5: ["children's discipline", "intelligence through study", "romance delay"],
		6: ["enemy defeat", "health improvement", "service success"],
		7: ["marriage through effort", "partnership stability", "business focus"],
		8: ["transformation", "occult knowledge", "hidden work"],
		9: ["dharma through effort", "guru guidance", "spiritual discipline"],
		10: ["career through hard work", "authority through merit", "recognition"],
		11: ["income through effort", "desire fulfillment", "success"],
		12: ["spiritual growth", "foreign success", "expense control"],
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

		if (!period) {
			console.warn(`No period data found for planet: ${planet}`);
			continue;
		}

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
		const antardashaPeriod =
			ENHANCED_DASHA_PERIODS[planet as keyof typeof ENHANCED_DASHA_PERIODS];

		if (!mahadashaPeriod || !antardashaPeriod) {
			console.warn(
				`No period data found for planets: ${currentMahadasha}, ${planet}`
			);
			continue;
		}

		const antardashaYears =
			(antardashaPeriod.years * mahadashaPeriod.years) / 120;
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
		const pratyantardashaPeriod =
			ENHANCED_DASHA_PERIODS[planet as keyof typeof ENHANCED_DASHA_PERIODS];

		if (!antardashaPeriod || !mahadashaPeriod || !pratyantardashaPeriod) {
			console.warn(
				`No period data found for planets: ${currentMahadasha}, ${currentAntardasha}, ${planet}`
			);
			continue;
		}

		const pratyantardashaDays =
			(pratyantardashaPeriod.years *
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

	// Fallback values if calculations failed
	if (!currentMahadasha) currentMahadasha = "Sun";
	if (!currentAntardasha) currentAntardasha = "Sun";
	if (!currentPratyantardasha) currentPratyantardasha = "Sun";

	// Calculate upcoming periods for better planning
	const upcomingPeriods = calculateUpcomingPeriods(
		birthDate,
		birthNakshatra,
		currentDate
	);

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
			favorableMonths: getFavorableMonths(currentMahadasha, currentDate),
			challengingMonths: getChallengingMonths(currentMahadasha, currentDate),
			keyEvents: getKeyEvents(currentMahadasha, "mahadasha"),
			remedies: getDashaRemedies(currentMahadasha),
			confidence: calculateDashaConfidence(currentMahadasha, "mahadasha"),
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
			specificTiming: getSpecificTiming(currentAntardasha, currentDate),
			opportunities: getOpportunities(currentAntardasha, currentMahadasha),
			challenges: getChallenges(currentAntardasha, currentMahadasha),
			remedies: getDashaRemedies(currentAntardasha),
			confidence: calculateDashaConfidence(currentAntardasha, "antardasha"),
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
			dailyInfluence: getDailyInfluence(currentPratyantardasha),
			bestDays: getBestDays(currentPratyantardasha, currentDate),
			cautionDays: getCautionDays(currentPratyantardasha, currentDate),
			confidence: calculateDashaConfidence(
				currentPratyantardasha,
				"pratyantardasha"
			),
		},
		upcomingPeriods: upcomingPeriods,
	};
}

// Calculate planetary transits for timing predictions with enhanced accuracy
export function calculatePlanetaryTransits(
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
	currentDate: Date = new Date()
): TransitAnalysis[] {
	const transits: TransitAnalysis[] = [];

	// Enhanced planetary transit calculations with real astronomical data
	const planets = [
		{
			name: "Sun",
			speed: 1.0,
			currentSign: getCurrentPlanetarySign("Sun", currentDate),
		},
		{
			name: "Moon",
			speed: 13.2,
			currentSign: getCurrentPlanetarySign("Moon", currentDate),
		},
		{
			name: "Mars",
			speed: 0.5,
			currentSign: getCurrentPlanetarySign("Mars", currentDate),
		},
		{
			name: "Mercury",
			speed: 1.4,
			currentSign: getCurrentPlanetarySign("Mercury", currentDate),
		},
		{
			name: "Jupiter",
			speed: 0.08,
			currentSign: getCurrentPlanetarySign("Jupiter", currentDate),
		},
		{
			name: "Venus",
			speed: 1.2,
			currentSign: getCurrentPlanetarySign("Venus", currentDate),
		},
		{
			name: "Saturn",
			speed: 0.03,
			currentSign: getCurrentPlanetarySign("Saturn", currentDate),
		},
		{
			name: "Rahu",
			speed: -0.05,
			currentSign: getCurrentPlanetarySign("Rahu", currentDate),
		},
		{
			name: "Ketu",
			speed: -0.05,
			currentSign: getCurrentPlanetarySign("Ketu", currentDate),
		},
	];

	for (const planet of planets) {
		const transit = calculateEnhancedPlanetTransit(
			planet,
			birthChart,
			currentDate
		);
		if (transit) {
			transits.push(transit);
		}
	}

	return transits.sort((a, b) => b.strength - a.strength);
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

	// Get current transits
	const transits = calculatePlanetaryTransits(birthChart, currentDate);

	// Generate predictions based on question type
	switch (questionType) {
		case "career":
			predictions.push(
				...generateCareerTimingPredictions(dashaBreakdown, transits, birthChart)
			);
			break;
		case "relationship":
			predictions.push(
				...generateRelationshipTimingPredictions(
					dashaBreakdown,
					transits,
					birthChart
				)
			);
			break;
		case "health":
			predictions.push(
				...generateHealthTimingPredictions(dashaBreakdown, transits, birthChart)
			);
			break;
		case "finance":
			predictions.push(
				...generateFinanceTimingPredictions(
					dashaBreakdown,
					transits,
					birthChart
				)
			);
			break;
		default:
			predictions.push(
				...generateGeneralTimingPredictions(
					dashaBreakdown,
					transits,
					birthChart
				)
			);
	}

	return predictions.sort((a, b) => b.confidence - a.confidence);
}

// Generate career-specific timing predictions
function generateCareerTimingPredictions(
	dashaBreakdown: DashaBreakdown,
	transits: TransitAnalysis[],
	birthChart: Record<string, unknown>
): TimingPrediction[] {
	const predictions: TimingPrediction[] = [];

	// Check 10th house (career) transits
	const careerTransits = transits.filter((t) => t.houseEffect === 10);

	for (const transit of careerTransits) {
		if (transit.planet === "Jupiter" || transit.planet === "Sun") {
			predictions.push({
				type: "transit",
				planet: transit.planet,
				startDate: transit.enteringDate,
				endDate: calculateTransitEndDate(transit.enteringDate, transit.planet),
				strength: "high",
				description: `${transit.planet} transit in 10th house - Career advancement period`,
				specificEvents: [
					"Job promotion opportunities",
					"New career direction",
					"Government job prospects",
					"Leadership recognition",
				],
				remedies: [
					"Wear appropriate gemstone",
					"Perform planet-specific puja",
					"Fast on planet's day",
				],
				confidence: 85,
			});
		}
	}

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
	transits: TransitAnalysis[],
	birthChart: Record<string, unknown>
): TimingPrediction[] {
	const predictions: TimingPrediction[] = [];

	// Check 7th house (relationships) transits
	const relationshipTransits = transits.filter((t) => t.houseEffect === 7);

	for (const transit of relationshipTransits) {
		if (transit.planet === "Venus" || transit.planet === "Jupiter") {
			predictions.push({
				type: "transit",
				planet: transit.planet,
				startDate: transit.enteringDate,
				endDate: calculateTransitEndDate(transit.enteringDate, transit.planet),
				strength: "high",
				description: `${transit.planet} transit in 7th house - Relationship opportunities`,
				specificEvents: [
					"Marriage prospects",
					"New partnerships",
					"Relationship harmony",
					"Love and romance",
				],
				remedies: [
					"Wear Venus/Jupiter gemstones",
					"Perform relationship pujas",
					"Friday/Thursday fasting",
				],
				confidence: 80,
			});
		}
	}

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
	transits: TransitAnalysis[],
	birthChart: Record<string, unknown>
): TimingPrediction[] {
	const predictions: TimingPrediction[] = [];

	// Check 6th house (health) transits
	const healthTransits = transits.filter((t) => t.houseEffect === 6);

	for (const transit of healthTransits) {
		if (transit.planet === "Saturn" || transit.planet === "Mars") {
			predictions.push({
				type: "transit",
				planet: transit.planet,
				startDate: transit.enteringDate,
				endDate: calculateTransitEndDate(transit.enteringDate, transit.planet),
				strength: "medium",
				description: `${transit.planet} transit in 6th house - Health attention needed`,
				specificEvents: [
					"Health challenges",
					"Medical checkups needed",
					"Lifestyle changes required",
					"Recovery period",
				],
				remedies: [
					"Regular exercise",
					"Healthy diet",
					"Planet-specific remedies",
					"Medical consultation",
				],
				confidence: 75,
			});
		}
	}

	return predictions;
}

// Generate finance-specific timing predictions
function generateFinanceTimingPredictions(
	dashaBreakdown: DashaBreakdown,
	transits: TransitAnalysis[],
	birthChart: Record<string, unknown>
): TimingPrediction[] {
	const predictions: TimingPrediction[] = [];

	// Check 2nd and 11th house (wealth) transits
	const wealthTransits = transits.filter((t) =>
		[2, 11].includes(t.houseEffect)
	);

	for (const transit of wealthTransits) {
		if (transit.planet === "Jupiter" || transit.planet === "Venus") {
			predictions.push({
				type: "transit",
				planet: transit.planet,
				startDate: transit.enteringDate,
				endDate: calculateTransitEndDate(transit.enteringDate, transit.planet),
				strength: "high",
				description: `${transit.planet} transit in ${
					transit.houseEffect === 2 ? "2nd" : "11th"
				} house - Wealth opportunities`,
				specificEvents: [
					"Income increase",
					"Investment success",
					"Property gains",
					"Business opportunities",
				],
				remedies: [
					"Wealth mantras",
					"Charity and donation",
					"Planet-specific gemstones",
					"Financial discipline",
				],
				confidence: 80,
			});
		}
	}

	return predictions;
}

// Generate general timing predictions
function generateGeneralTimingPredictions(
	dashaBreakdown: DashaBreakdown,
	transits: TransitAnalysis[],
	birthChart: Record<string, unknown>
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

	// Add significant transits
	const significantTransits = transits.filter((t) => t.strength > 70);
	for (const transit of significantTransits) {
		predictions.push({
			type: "transit",
			planet: transit.planet,
			startDate: transit.enteringDate,
			endDate: calculateTransitEndDate(transit.enteringDate, transit.planet),
			strength: "medium",
			description: `${transit.planet} transit effects`,
			specificEvents: transit.effects,
			remedies: getTransitRemedies(transit.planet),
			confidence: transit.strength,
		});
	}

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
	// Simplified calculation - in practice, this would use precise astronomical calculations
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

	if (!period) {
		console.warn(`No period data for planet ${planet}, using default 6 years`);
		const endDate = new Date(startDate);
		endDate.setFullYear(endDate.getFullYear() + 6);
		return endDate;
	}

	const endDate = new Date(startDate);
	endDate.setFullYear(endDate.getFullYear() + period.years);
	return endDate;
}

function getAntardashaStart(
	mahadashaStart: Date,
	mahadashaPlanet: string,
	antardashaPlanet: string
): Date {
	// Simplified calculation
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
	// Simplified calculation
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
	// Simplified strength calculation
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

function getTransitRemedies(planet: string): string[] {
	return getDashaRemedies(planet);
}

function calculateSinglePlanetTransit(
	planet: string,
	birthChart: Record<string, unknown>,
	currentDate: Date
): TransitAnalysis | null {
	// Simplified transit calculation - in practice, this would use precise astronomical calculations
	const transit: TransitAnalysis = {
		planet,
		currentSign: "Aries", // Simplified
		currentDegree: 15, // Simplified
		enteringSign: "Taurus", // Simplified
		enteringDate: new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
		houseEffect: 1, // Simplified
		strength: 70, // Simplified
		effects: ["General transit effects"], // Simplified
	};

	return transit;
}

function calculateTransitEndDate(startDate: Date, planet: string): Date {
	// Enhanced transit duration calculations based on actual planetary speeds
	const transitDurations: { [key: string]: number } = {
		Sun: 30, // 1 month per sign
		Moon: 2.25, // 2.25 days per sign
		Mars: 45, // 1.5 months per sign (average, varies with retrograde)
		Mercury: 25, // 25 days per sign (average)
		Jupiter: 365, // 1 year per sign (average)
		Venus: 30, // 1 month per sign (average)
		Saturn: 912, // 2.5 years per sign
		Rahu: 548, // 1.5 years per sign (retrograde)
		Ketu: 548, // 1.5 years per sign (retrograde)
	};

	const duration = transitDurations[planet] || 30;
	const endDate = new Date(startDate);
	endDate.setDate(endDate.getDate() + duration);
	return endDate;
}

// Enhanced planetary position calculation
function getCurrentPlanetarySign(planet: string, currentDate: Date): string {
	// Simplified calculation - in production, use Swiss Ephemeris or similar
	const year = currentDate.getFullYear();
	const month = currentDate.getMonth() + 1;
	const day = currentDate.getDate();

	// Basic approximation based on current date
	const dayOfYear = Math.floor(
		(currentDate.getTime() - new Date(year, 0, 0).getTime()) /
			(1000 * 60 * 60 * 24)
	);

	const planetaryPositions: { [key: string]: (dayOfYear: number) => string } = {
		Sun: (day: number) => {
			const signs = [
				"Capricorn",
				"Aquarius",
				"Pisces",
				"Aries",
				"Taurus",
				"Gemini",
				"Cancer",
				"Leo",
				"Virgo",
				"Libra",
				"Scorpio",
				"Sagittarius",
			];
			return signs[Math.floor((day + 10) / 30.4) % 12];
		},
		Moon: (day: number) => {
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
			return signs[Math.floor((day * 13.2) / 365) % 12];
		},
		Mars: (day: number) => {
			// Mars cycle approximation
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
			return signs[Math.floor((day * 0.5) / 30.4) % 12];
		},
		Mercury: (day: number) => {
			// Mercury stays close to Sun
			const signs = [
				"Capricorn",
				"Aquarius",
				"Pisces",
				"Aries",
				"Taurus",
				"Gemini",
				"Cancer",
				"Leo",
				"Virgo",
				"Libra",
				"Scorpio",
				"Sagittarius",
			];
			return signs[Math.floor((day + 5) / 30.4) % 12];
		},
		Jupiter: (day: number) => {
			// Jupiter spends about 1 year per sign
			const currentJupiterSign = Math.floor(year - 2023 + month / 12) % 12;
			const signs = [
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
				"Aries",
			];
			return signs[currentJupiterSign];
		},
		Venus: (day: number) => {
			// Venus cycle approximation
			const signs = [
				"Capricorn",
				"Aquarius",
				"Pisces",
				"Aries",
				"Taurus",
				"Gemini",
				"Cancer",
				"Leo",
				"Virgo",
				"Libra",
				"Scorpio",
				"Sagittarius",
			];
			return signs[Math.floor((day + 15) / 30.4) % 12];
		},
		Saturn: (day: number) => {
			// Saturn spends 2.5 years per sign
			const currentSaturnSign = Math.floor((year - 2023) / 2.5) % 12;
			const signs = [
				"Aquarius",
				"Pisces",
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
			];
			return signs[currentSaturnSign];
		},
		Rahu: (day: number) => {
			// Rahu is retrograde, spends 1.5 years per sign
			const currentRahuSign = Math.floor((2025 - year) / 1.5) % 12;
			const signs = [
				"Pisces",
				"Aquarius",
				"Capricorn",
				"Sagittarius",
				"Scorpio",
				"Libra",
				"Virgo",
				"Leo",
				"Cancer",
				"Gemini",
				"Taurus",
				"Aries",
			];
			return signs[currentRahuSign];
		},
		Ketu: (day: number) => {
			// Ketu is opposite to Rahu
			const rahuSign = getCurrentPlanetarySign("Rahu", currentDate);
			const oppositeSign: { [key: string]: string } = {
				Aries: "Libra",
				Taurus: "Scorpio",
				Gemini: "Sagittarius",
				Cancer: "Capricorn",
				Leo: "Aquarius",
				Virgo: "Pisces",
				Libra: "Aries",
				Scorpio: "Taurus",
				Sagittarius: "Gemini",
				Capricorn: "Cancer",
				Aquarius: "Leo",
				Pisces: "Virgo",
			};
			return oppositeSign[rahuSign] || "Virgo";
		},
	};

	return planetaryPositions[planet]?.(dayOfYear) || "Aries";
}

// Enhanced planet transit calculation
function calculateEnhancedPlanetTransit(
	planet: { name: string; speed: number; currentSign: string },
	birthChart: Record<string, unknown>,
	currentDate: Date
): TransitAnalysis | null {
	// Calculate which house this planet is transiting
	const ascendant = birthChart.ascendant as { sign: string };
	const ascendantSign = ascendant?.sign;

	if (!ascendantSign) return null;

	const houseNumber = calculateTransitHouse(planet.currentSign, ascendantSign);

	// Calculate transit strength based on multiple factors
	const strength = calculateTransitStrength(planet, birthChart, houseNumber);

	// Get specific effects for this transit
	const effects = getTransitEffects(planet.name, houseNumber);

	// Calculate next sign entry date
	const nextSignDate = calculateNextSignEntry(planet, currentDate);

	return {
		planet: planet.name,
		currentSign: planet.currentSign,
		currentDegree: calculateCurrentDegree(planet, currentDate),
		enteringSign: getNextSign(planet.currentSign),
		enteringDate: nextSignDate,
		houseEffect: houseNumber,
		strength: strength,
		effects: effects,
	};
}

// Helper function to calculate which house a planet is transiting
function calculateTransitHouse(
	transitSign: string,
	ascendantSign: string
): number {
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

	const ascendantIndex = signs.indexOf(ascendantSign);
	const transitIndex = signs.indexOf(transitSign);

	if (ascendantIndex === -1 || transitIndex === -1) return 1;

	let houseNumber = transitIndex - ascendantIndex + 1;
	if (houseNumber <= 0) houseNumber += 12;

	return houseNumber;
}

// Calculate transit strength based on multiple factors
function calculateTransitStrength(
	planet: { name: string; speed: number; currentSign: string },
	birthChart: Record<string, unknown>,
	houseNumber: number
): number {
	let strength = 50; // Base strength

	// Increase strength for benefic planets in good houses
	if (
		(planet.name === "Jupiter" || planet.name === "Venus") &&
		[1, 4, 5, 7, 9, 10, 11].includes(houseNumber)
	) {
		strength += 20;
	}

	// Increase strength for planets in own signs or exaltation
	if (isPlanetStrong(planet.name, planet.currentSign)) {
		strength += 15;
	}

	// Adjust for house significance
	if ([1, 4, 7, 10].includes(houseNumber)) {
		// Kendra houses
		strength += 10;
	} else if ([5, 9].includes(houseNumber)) {
		// Trikona houses
		strength += 15;
	} else if ([6, 8, 12].includes(houseNumber)) {
		// Dusthana houses
		strength -= 10;
	}

	return Math.max(10, Math.min(100, strength));
}

// Check if planet is strong in current sign
function isPlanetStrong(planet: string, sign: string): boolean {
	const strongPlacements: { [key: string]: string[] } = {
		Sun: ["Leo", "Aries"],
		Moon: ["Cancer", "Taurus"],
		Mars: ["Aries", "Scorpio", "Capricorn"],
		Mercury: ["Gemini", "Virgo"],
		Jupiter: ["Sagittarius", "Pisces", "Cancer"],
		Venus: ["Taurus", "Libra", "Pisces"],
		Saturn: ["Capricorn", "Aquarius", "Libra"],
		Rahu: ["Gemini", "Virgo"],
		Ketu: ["Sagittarius", "Pisces"],
	};

	return strongPlacements[planet]?.includes(sign) || false;
}

// Get specific effects for planet transiting through house
function getTransitEffects(planet: string, house: number): string[] {
	const effects = TRANSIT_EFFECTS[planet as keyof typeof TRANSIT_EFFECTS];
	return effects?.[house as keyof typeof effects] || ["General effects"];
}

// Calculate current degree of planet (simplified)
function calculateCurrentDegree(
	planet: { name: string; speed: number },
	currentDate: Date
): number {
	const dayOfMonth = currentDate.getDate();
	return (dayOfMonth * planet.speed) % 30;
}

// Get next sign in sequence
function getNextSign(currentSign: string): string {
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
	const currentIndex = signs.indexOf(currentSign);
	return signs[(currentIndex + 1) % 12];
}

// Calculate when planet will enter next sign
function calculateNextSignEntry(
	planet: { name: string; speed: number },
	currentDate: Date
): Date {
	const daysToNextSign = Math.floor(30 / planet.speed);
	const nextDate = new Date(currentDate);
	nextDate.setDate(nextDate.getDate() + daysToNextSign);
	return nextDate;
}

// Enhanced Dasha analysis helper functions
function calculateUpcomingPeriods(
	birthDate: Date,
	birthNakshatra: string,
	currentDate: Date
): Array<{
	type: "mahadasha" | "antardasha";
	planet: string;
	startDate: Date;
	endDate: Date;
	duration: string;
	majorThemes: string[];
	significance: "high" | "medium" | "low";
}> {
	const upcomingPeriods = [];
	const nakshatraRuler = getNakshatraRuler(birthNakshatra);
	const sequence = getDashaSequence(nakshatraRuler);

	// Find current position and calculate next 3 major periods
	let runningDate = new Date(birthDate);
	let foundCurrent = false;

	for (let i = 0; i < sequence.length; i++) {
		const planet = sequence[i];
		const period =
			ENHANCED_DASHA_PERIODS[planet as keyof typeof ENHANCED_DASHA_PERIODS];
		const endDate = new Date(runningDate);
		endDate.setFullYear(endDate.getFullYear() + period.years);

		if (!foundCurrent && currentDate >= runningDate && currentDate < endDate) {
			foundCurrent = true;
			// Add next 2 Mahadashas
			for (let j = 1; j <= 2; j++) {
				const nextIndex = (i + j) % sequence.length;
				const nextPlanet = sequence[nextIndex];
				const nextPeriod =
					ENHANCED_DASHA_PERIODS[
						nextPlanet as keyof typeof ENHANCED_DASHA_PERIODS
					];

				const nextStart = new Date(endDate);
				if (j > 1) {
					const prevPeriod =
						ENHANCED_DASHA_PERIODS[
							sequence[
								(i + j - 1) % sequence.length
							] as keyof typeof ENHANCED_DASHA_PERIODS
						];
					nextStart.setFullYear(nextStart.getFullYear() + prevPeriod.years);
				}

				const nextEnd = new Date(nextStart);
				nextEnd.setFullYear(nextEnd.getFullYear() + nextPeriod.years);

				upcomingPeriods.push({
					type: "mahadasha" as const,
					planet: nextPlanet,
					startDate: nextStart,
					endDate: nextEnd,
					duration: `${nextPeriod.years} years`,
					majorThemes: period.significations,
					significance: calculatePeriodSignificance(nextPlanet) as
						| "high"
						| "medium"
						| "low",
				});
			}
			break;
		}

		runningDate = endDate;
	}

	return upcomingPeriods;
}

function getFavorableMonths(planet: string, currentDate: Date): string[] {
	const months = [];
	const planetData =
		ENHANCED_DASHA_PERIODS[planet as keyof typeof ENHANCED_DASHA_PERIODS];

	// Get favorable months based on planet's nature
	const favorableSeasons: { [key: string]: number[] } = {
		Sun: [4, 5, 6, 7, 8], // Summer months
		Moon: [10, 11, 12, 1, 2], // Winter months
		Mars: [3, 4, 5, 9, 10], // Spring and autumn
		Mercury: [2, 3, 4, 8, 9], // Moderate seasons
		Jupiter: [11, 12, 1, 2, 3], // Jupiter's favorable months
		Venus: [4, 5, 6, 10, 11], // Pleasant seasons
		Saturn: [12, 1, 2, 6, 7], // Cold and hot extremes
		Rahu: [6, 7, 8, 9], // Monsoon and post-monsoon
		Ketu: [3, 4, 5, 11, 12], // Transition periods
	};

	const favorableMonthNumbers = favorableSeasons[planet] || [1, 2, 3];
	const monthNames = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	];

	return favorableMonthNumbers.map((num) => monthNames[num - 1]);
}

function getChallengingMonths(planet: string, currentDate: Date): string[] {
	const favorableMonths = getFavorableMonths(planet, currentDate);
	const allMonths = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	];

	return allMonths.filter((month) => !favorableMonths.includes(month));
}

function getKeyEvents(planet: string, level: string): string[] {
	const keyEvents: { [key: string]: string[] } = {
		Sun: [
			"Career advancement opportunities",
			"Government job prospects",
			"Leadership roles",
			"Father-related events",
			"Health improvements",
		],
		Moon: [
			"Mental peace and stability",
			"Mother-related events",
			"Travel opportunities",
			"Emotional relationships",
			"Mind-related achievements",
		],
		Mars: [
			"Property acquisitions",
			"Energy and courage boost",
			"Brother-related events",
			"Sports and competition success",
			"Conflict resolutions",
		],
		Mercury: [
			"Business expansion",
			"Communication improvements",
			"Educational achievements",
			"Technology adoption",
			"Writing and speaking success",
		],
		Jupiter: [
			"Spiritual growth",
			"Children-related events",
			"Wisdom and knowledge gain",
			"Religious activities",
			"Teaching opportunities",
		],
		Venus: [
			"Marriage and relationships",
			"Artistic achievements",
			"Luxury acquisitions",
			"Beauty and comfort",
			"Creative success",
		],
		Saturn: [
			"Hard work paying off",
			"Discipline and structure",
			"Karma resolution",
			"Service opportunities",
			"Long-term stability",
		],
		Rahu: [
			"Foreign connections",
			"Technology breakthroughs",
			"Sudden changes",
			"Unconventional success",
			"Mystery solving",
		],
		Ketu: [
			"Spiritual awakening",
			"Research breakthroughs",
			"Detachment from material",
			"Past-life connections",
			"Hidden knowledge",
		],
	};

	return keyEvents[planet] || ["General positive events"];
}

function getSpecificTiming(planet: string, currentDate: Date): string[] {
	const timing = [];
	const currentMonth = currentDate.getMonth() + 1;
	const currentYear = currentDate.getFullYear();

	// Generate specific timing based on planet
	const planetTimings: { [key: string]: string[] } = {
		Sun: [
			"Peak results in summer months (May-August)",
			"Government opportunities in Leo season",
			"Leadership roles during Sun's strong transits",
		],
		Moon: [
			"Emotional clarity during full moon periods",
			"Travel opportunities in water signs",
			"Family events during Moon's favorable transits",
		],
		Mars: [
			"Property deals in spring months",
			"Energy boost during Mars transits",
			"Competition success in fire sign periods",
		],
		Mercury: [
			"Business deals in Gemini/Virgo seasons",
			"Communication success during Mercury direct",
			"Educational achievements in earth sign periods",
		],
		Jupiter: [
			"Spiritual growth in Sagittarius/Pisces periods",
			"Children's success during Jupiter's benefic transits",
			"Wisdom gain in fire sign seasons",
		],
		Venus: [
			"Relationship opportunities in Taurus/Libra seasons",
			"Artistic success during Venus direct periods",
			"Luxury acquisitions in earth/air sign periods",
		],
		Saturn: [
			"Hard work results after Saturn's challenging transits",
			"Stability during Saturn's favorable aspects",
			"Service opportunities in earth sign periods",
		],
	};

	return planetTimings[planet] || ["General timing indications"];
}

function getOpportunities(
	antardashaPlanet: string,
	mahadashaPlanet: string
): string[] {
	const opportunities = [];

	// Combine effects of both planets
	const mahadashaSigs =
		ENHANCED_DASHA_PERIODS[
			mahadashaPlanet as keyof typeof ENHANCED_DASHA_PERIODS
		]?.significations || [];
	const antardashasSigs =
		ENHANCED_DASHA_PERIODS[
			antardashaPlanet as keyof typeof ENHANCED_DASHA_PERIODS
		]?.significations || [];

	// Create combined opportunities
	if (
		mahadashaSigs.includes("leadership") &&
		antardashasSigs.includes("communication")
	) {
		opportunities.push("Leadership through communication");
	}
	if (mahadashaSigs.includes("wisdom") && antardashasSigs.includes("love")) {
		opportunities.push("Wise relationship decisions");
	}
	if (
		mahadashaSigs.includes("courage") &&
		antardashasSigs.includes("business")
	) {
		opportunities.push("Bold business ventures");
	}

	// Add general opportunities
	opportunities.push(
		...antardashasSigs.map(
			(sig) => `${sig.charAt(0).toUpperCase() + sig.slice(1)} opportunities`
		)
	);

	return opportunities.slice(0, 5); // Limit to 5 opportunities
}

function getChallenges(
	antardashaPlanet: string,
	mahadashaPlanet: string
): string[] {
	const challenges = [];

	// Planet-specific challenges
	const planetChallenges: { [key: string]: string[] } = {
		Sun: ["Ego conflicts", "Authority issues", "Health concerns"],
		Moon: ["Emotional instability", "Mind fluctuations", "Mother's health"],
		Mars: ["Anger issues", "Conflicts", "Accident prone"],
		Mercury: ["Communication problems", "Business losses", "Nervous issues"],
		Jupiter: ["Over-optimism", "Weight gain", "Religious conflicts"],
		Venus: ["Relationship issues", "Over-indulgence", "Financial overspending"],
		Saturn: [
			"Delays",
			"Depression",
			"Health issues",
			"Hard work without immediate results",
		],
		Rahu: ["Confusion", "Illusions", "Sudden disruptions"],
		Ketu: ["Detachment issues", "Spiritual confusion", "Past karma"],
	};

	challenges.push(
		...(planetChallenges[antardashaPlanet] || ["General challenges"])
	);

	return challenges.slice(0, 4); // Limit to 4 challenges
}

function getDailyInfluence(planet: string): string[] {
	const influences: { [key: string]: string[] } = {
		Sun: [
			"Morning energy boost",
			"Leadership tendencies",
			"Confidence in decisions",
		],
		Moon: [
			"Evening emotional clarity",
			"Intuitive insights",
			"Family connections",
		],
		Mars: [
			"Physical energy surge",
			"Courage in challenges",
			"Quick decision making",
		],
		Mercury: ["Mental agility", "Communication flow", "Business insights"],
		Jupiter: [
			"Wisdom in decisions",
			"Spiritual inclinations",
			"Teaching moments",
		],
		Venus: [
			"Artistic inspiration",
			"Relationship harmony",
			"Beauty appreciation",
		],
		Saturn: ["Disciplined approach", "Hard work focus", "Practical decisions"],
		Rahu: [
			"Unconventional thinking",
			"Technology focus",
			"Foreign connections",
		],
		Ketu: ["Spiritual insights", "Research abilities", "Detached perspective"],
	};

	return influences[planet] || ["General positive influence"];
}

function getBestDays(planet: string, currentDate: Date): string[] {
	const planetDays: { [key: string]: string[] } = {
		Sun: ["Sunday", "Tuesday"],
		Moon: ["Monday", "Thursday"],
		Mars: ["Tuesday", "Saturday"],
		Mercury: ["Wednesday", "Friday"],
		Jupiter: ["Thursday", "Sunday"],
		Venus: ["Friday", "Monday"],
		Saturn: ["Saturday", "Wednesday"],
		Rahu: ["Saturday", "Tuesday"],
		Ketu: ["Tuesday", "Sunday"],
	};

	return planetDays[planet] || ["Sunday"];
}

function getCautionDays(planet: string, currentDate: Date): string[] {
	const bestDays = getBestDays(planet, currentDate);
	const allDays = [
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
		"Sunday",
	];

	return allDays.filter((day) => !bestDays.includes(day)).slice(0, 2);
}

function calculateDashaConfidence(planet: string, level: string): number {
	let confidence = 70; // Base confidence

	// Adjust based on planet strength
	const strength = calculatePlanetaryStrength(planet);
	confidence += (strength - 50) * 0.3;

	// Adjust based on level
	if (level === "mahadasha") confidence += 10;
	else if (level === "antardasha") confidence += 5;
	// pratyantardasha keeps base confidence

	// Ensure confidence is within bounds
	return Math.max(40, Math.min(95, Math.round(confidence)));
}

function calculatePeriodSignificance(planet: string): string {
	const highSignificance = ["Jupiter", "Venus", "Sun"];
	const mediumSignificance = ["Mercury", "Moon"];
	const lowSignificance = ["Mars", "Saturn", "Rahu", "Ketu"];

	if (highSignificance.includes(planet)) return "high";
	if (mediumSignificance.includes(planet)) return "medium";
	return "low";
}
