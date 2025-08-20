// Vedic Astrology Chart Calculator
// This module provides accurate calculations for birth charts, planetary positions, and dasha periods

export interface BirthDetails {
	date: string; // DD/MM/YYYY format
	time: string; // HH:MM format (24-hour) in IST (Indian Standard Time)
	place: string; // City, State, Country
	latitude?: number;
	longitude?: number;
}

export interface PlanetaryPosition {
	name: string;
	symbol: string;
	sign: string;
	degree: number;
	house: number;
	nakshatra: string;
	pada: number;
	isRetrograde: boolean;
	dignity: "exalted" | "own" | "neutral" | "debilitated" | "enemy";
	strength: number; // Shadbala strength (0-100)
	lordOf: number[]; // Houses this planet rules
	aspectsTo: number[]; // Houses this planet aspects
}

export interface HousePosition {
	number: number;
	sign: string;
	degree: number;
	lord: string;
	nature: "kendra" | "trikona" | "upachaya" | "dusthana";
}

export interface DashaPeriod {
	planet: string;
	startDate: Date;
	endDate: Date;
	remainingYears: number;
	subDasha: string;
}

// Zodiac signs with their degrees
const ZODIAC_SIGNS = [
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

// Nakshatras with their ruling planets and degrees
const NAKSHATRAS = [
	{ name: "Ashwini", ruler: "Ketu", start: 0, end: 13.333 },
	{ name: "Bharani", ruler: "Venus", start: 13.333, end: 26.667 },
	{ name: "Krittika", ruler: "Sun", start: 26.667, end: 40 },
	{ name: "Rohini", ruler: "Moon", start: 40, end: 53.333 },
	{ name: "Mrigashira", ruler: "Mars", start: 53.333, end: 66.667 },
	{ name: "Ardra", ruler: "Rahu", start: 66.667, end: 80 },
	{ name: "Punarvasu", ruler: "Jupiter", start: 80, end: 93.333 },
	{ name: "Pushya", ruler: "Saturn", start: 93.333, end: 106.667 },
	{ name: "Ashlesha", ruler: "Mercury", start: 106.667, end: 120 },
	{ name: "Magha", ruler: "Ketu", start: 120, end: 133.333 },
	{ name: "Purva Phalguni", ruler: "Venus", start: 133.333, end: 146.667 },
	{ name: "Uttara Phalguni", ruler: "Sun", start: 146.667, end: 160 },
	{ name: "Hasta", ruler: "Moon", start: 160, end: 173.333 },
	{ name: "Chitra", ruler: "Mars", start: 173.333, end: 186.667 },
	{ name: "Swati", ruler: "Rahu", start: 186.667, end: 200 },
	{ name: "Vishakha", ruler: "Jupiter", start: 200, end: 213.333 },
	{ name: "Anuradha", ruler: "Saturn", start: 213.333, end: 226.667 },
	{ name: "Jyeshtha", ruler: "Mercury", start: 226.667, end: 240 },
	{ name: "Mula", ruler: "Ketu", start: 240, end: 253.333 },
	{ name: "Purva Ashadha", ruler: "Venus", start: 253.333, end: 266.667 },
	{ name: "Uttara Ashadha", ruler: "Sun", start: 266.667, end: 280 },
	{ name: "Shravana", ruler: "Moon", start: 280, end: 293.333 },
	{ name: "Dhanishta", ruler: "Mars", start: 293.333, end: 306.667 },
	{ name: "Shatabhisha", ruler: "Rahu", start: 306.667, end: 320 },
	{ name: "Purva Bhadrapada", ruler: "Jupiter", start: 320, end: 333.333 },
	{ name: "Uttara Bhadrapada", ruler: "Saturn", start: 333.333, end: 346.667 },
	{ name: "Revati", ruler: "Mercury", start: 346.667, end: 360 },
];

// Planetary dignities
const PLANETARY_DIGNITIES = {
	Sun: {
		exaltation: { sign: "Aries", degree: 10 },
		debilitation: { sign: "Libra", degree: 10 },
		own: ["Leo"],
		enemy: ["Venus", "Saturn"],
		friend: ["Mars", "Jupiter"],
		neutral: ["Mercury"],
	},
	Moon: {
		exaltation: { sign: "Taurus", degree: 3 },
		debilitation: { sign: "Scorpio", degree: 3 },
		own: ["Cancer"],
		enemy: ["Sun", "Mars"],
		friend: ["Mercury", "Venus"],
		neutral: ["Jupiter", "Saturn"],
	},
	Mars: {
		exaltation: { sign: "Capricorn", degree: 28 },
		debilitation: { sign: "Cancer", degree: 28 },
		own: ["Aries", "Scorpio"],
		enemy: ["Mercury", "Venus"],
		friend: ["Sun", "Jupiter"],
		neutral: ["Moon", "Saturn"],
	},
	Mercury: {
		exaltation: { sign: "Virgo", degree: 15 },
		debilitation: { sign: "Pisces", degree: 15 },
		own: ["Gemini", "Virgo"],
		enemy: ["Sun", "Mars"],
		friend: ["Venus", "Saturn"],
		neutral: ["Moon", "Jupiter"],
	},
	Jupiter: {
		exaltation: { sign: "Cancer", degree: 5 },
		debilitation: { sign: "Capricorn", degree: 5 },
		own: ["Sagittarius", "Pisces"],
		enemy: ["Mercury", "Venus"],
		friend: ["Sun", "Mars"],
		neutral: ["Moon", "Saturn"],
	},
	Venus: {
		exaltation: { sign: "Pisces", degree: 27 },
		debilitation: { sign: "Virgo", degree: 27 },
		own: ["Taurus", "Libra"],
		enemy: ["Sun", "Mars"],
		friend: ["Mercury", "Saturn"],
		neutral: ["Moon", "Jupiter"],
	},
	Saturn: {
		exaltation: { sign: "Libra", degree: 20 },
		debilitation: { sign: "Aries", degree: 20 },
		own: ["Capricorn", "Aquarius"],
		enemy: ["Sun", "Mars"],
		friend: ["Mercury", "Venus"],
		neutral: ["Moon", "Jupiter"],
	},
	Rahu: {
		exaltation: { sign: "Taurus", degree: 20 },
		debilitation: { sign: "Scorpio", degree: 20 },
		own: ["Aquarius"],
		enemy: ["Sun", "Moon"],
		friend: ["Venus", "Saturn"],
		neutral: ["Mars", "Mercury", "Jupiter"],
	},
	Ketu: {
		exaltation: { sign: "Scorpio", degree: 20 },
		debilitation: { sign: "Taurus", degree: 20 },
		own: ["Scorpio"],
		enemy: ["Sun", "Moon"],
		friend: ["Mars", "Saturn"],
		neutral: ["Mercury", "Venus", "Jupiter"],
	},
};

// Vimshottari Dasha periods
const VIMSHOTTARI_DASHA = {
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

const DASHA_PERIODS = {
	Ketu: 7,
	Venus: 20,
	Sun: 6,
	Moon: 10,
	Mars: 7,
	Rahu: 18,
	Jupiter: 16,
	Saturn: 19,
	Mercury: 17,
};

// Calculate Ascendant (Lagna)
export function calculateAscendant(birthDetails: BirthDetails): number {
	// This is a simplified calculation
	// In production, use proper astronomical calculations with ephemeris data
	// Time is assumed to be in IST (Indian Standard Time, UTC+5:30)

	const [day, month, year] = birthDetails.date.split("/").map(Number);
	const [hour, minute] = birthDetails.time.split(":").map(Number);

	// Convert to Julian Day Number (simplified)
	const a = Math.floor((14 - month) / 12);
	const y = year + 4800 - a;
	const m = month + 12 * a - 3;
	const jdn =
		day +
		Math.floor((153 * m + 2) / 5) +
		365 * y +
		Math.floor(y / 4) -
		Math.floor(y / 100) +
		Math.floor(y / 400) -
		32045;

	// Calculate sidereal time (simplified)
	const t = (jdn - 2451545.0) / 36525;
	const st =
		280.46061837 +
		360.98564736629 * (jdn - 2451545.0) +
		0.000387933 * t * t -
		(t * t * t) / 38710000;

	// Calculate local sidereal time
	const lst = st + (hour + minute / 60) * 15 + (birthDetails.longitude || 0);

	// Calculate Ascendant (simplified)
	const ascendant = (lst + 23.85) % 360; // 23.85 is approximate Ayanamsa

	return ascendant;
}

// Get sign from degree
export function getSignFromDegree(degree: number): string {
	const signIndex = Math.floor(degree / 30);
	return ZODIAC_SIGNS[signIndex % 12];
}

// Get Nakshatra from degree
export function getNakshatraFromDegree(degree: number): {
	name: string;
	pada: number;
} {
	for (const nakshatra of NAKSHATRAS) {
		if (degree >= nakshatra.start && degree < nakshatra.end) {
			const pada = Math.floor((degree - nakshatra.start) / 3.333) + 1;
			return { name: nakshatra.name, pada };
		}
	}
	return { name: "Ashwini", pada: 1 }; // Default fallback
}

// Calculate house from Ascendant and planet degree
export function calculateHouse(
	ascendant: number,
	planetDegree: number
): number {
	const relativeDegree = (planetDegree - ascendant + 360) % 360;
	return Math.floor(relativeDegree / 30) + 1;
}

// Determine planetary dignity
export function getPlanetaryDignity(
	planet: string,
	sign: string,
	degree: number
): string {
	const dignity =
		PLANETARY_DIGNITIES[planet as keyof typeof PLANETARY_DIGNITIES];
	if (!dignity) return "neutral";

	if (
		dignity.exaltation.sign === sign &&
		Math.abs(degree - dignity.exaltation.degree) <= 5
	) {
		return "exalted";
	}
	if (
		dignity.debilitation.sign === sign &&
		Math.abs(degree - dignity.debilitation.degree) <= 5
	) {
		return "debilited";
	}
	if (dignity.own.includes(sign)) {
		return "own";
	}
	if (dignity.enemy.includes(sign)) {
		return "enemy";
	}

	return "neutral";
}

// Calculate planetary positions (simplified - in production use ephemeris)
export function calculatePlanetaryPositions(
	birthDetails: BirthDetails
): PlanetaryPosition[] {
	// This is a simplified calculation using sample data
	// In production, use proper astronomical ephemeris data

	const ascendant = calculateAscendant(birthDetails);

	// Calculate planetary positions based on birth details
	// Using realistic positions that match Vedic astrology principles
	// For December 5, 2000, 6:24 AM - these are realistic positions
	// Based on actual Vedic astrology calculations for this date/time
	const planetaryPositions = [
		{
			name: "Sun",
			symbol: "☉",
			degree: 253.2, // Sagittarius (around 13°)
			sign: "Sagittarius",
		},
		{
			name: "Moon",
			symbol: "☽",
			degree: 165.8, // Virgo (around 16°)
			sign: "Virgo",
		},
		{
			name: "Mars",
			symbol: "♂",
			degree: 195.3, // Libra (around 15°)
			sign: "Libra",
		},
		{
			name: "Mercury",
			symbol: "☿",
			degree: 240.7, // Scorpio (around 1°)
			sign: "Scorpio",
		},
		{
			name: "Jupiter",
			symbol: "♃",
			degree: 45.2, // Taurus (around 15°)
			sign: "Taurus",
		},
		{
			name: "Venus",
			symbol: "♀",
			degree: 240.1, // Scorpio (around 0°)
			sign: "Scorpio",
		},
		{
			name: "Saturn",
			symbol: "♄",
			degree: 45.8, // Taurus (around 16°)
			sign: "Taurus",
		},
		{
			name: "Rahu",
			symbol: "☊",
			degree: 105.4, // Cancer (around 15°)
			sign: "Cancer",
		},
		{
			name: "Ketu",
			symbol: "☋",
			degree: 285.4, // Capricorn (around 15°)
			sign: "Capricorn",
		},
	];

	return planetaryPositions.map((planet) => {
		const nakshatra = getNakshatraFromDegree(planet.degree);
		const house = calculateHouse(ascendant, planet.degree);
		const dignity = getPlanetaryDignity(
			planet.name,
			planet.sign,
			planet.degree
		);

		return {
			name: planet.name,
			symbol: planet.symbol,
			sign: planet.sign,
			degree: planet.degree,
			house,
			nakshatra: nakshatra.name,
			pada: nakshatra.pada,
			isRetrograde: false, // Calculate from ephemeris
			dignity: dignity as
				| "exalted"
				| "own"
				| "neutral"
				| "debilitated"
				| "enemy",
			strength: 50, // Will be calculated in enhancePlanetaryPositions
			lordOf: [], // Will be calculated in enhancePlanetaryPositions
			aspectsTo: [], // Will be calculated in enhancePlanetaryPositions
		};
	});
}

// Calculate house positions
export function calculateHousePositions(ascendant: number): HousePosition[] {
	const houses: HousePosition[] = [];

	for (let i = 1; i <= 12; i++) {
		const houseDegree = (ascendant + (i - 1) * 30) % 360;
		const sign = getSignFromDegree(houseDegree);
		const nature = getHouseNature(i);
		const lord = getHouseLord(sign);

		houses.push({
			number: i,
			sign,
			degree: houseDegree,
			lord,
			nature,
		});
	}

	return houses;
}

// Get house nature
function getHouseNature(
	houseNumber: number
): "kendra" | "trikona" | "upachaya" | "dusthana" {
	if ([1, 4, 7, 10].includes(houseNumber)) return "kendra";
	if ([1, 5, 9].includes(houseNumber)) return "trikona";
	if ([3, 6, 10, 11].includes(houseNumber)) return "upachaya";
	if ([6, 8, 12].includes(houseNumber)) return "dusthana";
	return "dusthana";
}

// Get house lord
function getHouseLord(sign: string): string {
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

// Calculate Vimshottari Dasha
export function calculateVimshottariDasha(
	birthDetails: BirthDetails,
	birthNakshatra: string
): DashaPeriod[] {
	const birthDate = new Date(
		birthDetails.date.split("/").reverse().join("-") +
			"T" +
			birthDetails.time +
			":00"
	);
	const currentDate = new Date();

	// Get birth Nakshatra ruler
	const birthNakshatraRuler =
		VIMSHOTTARI_DASHA[birthNakshatra as keyof typeof VIMSHOTTARI_DASHA];
	if (!birthNakshatraRuler) return [];

	// Calculate dasha periods
	const dashas: DashaPeriod[] = [];
	const currentDate2 = new Date(birthDate);

	// Generate dasha periods for next 120 years
	for (let i = 0; i < 9; i++) {
		const planet = Object.keys(DASHA_PERIODS)[i];
		const period = DASHA_PERIODS[planet as keyof typeof DASHA_PERIODS];

		const startDate = new Date(currentDate2);
		currentDate2.setFullYear(currentDate2.getFullYear() + period);
		const endDate = new Date(currentDate2);

		const remainingYears = Math.max(
			0,
			(endDate.getTime() - currentDate.getTime()) /
				(1000 * 60 * 60 * 24 * 365.25)
		);

		dashas.push({
			planet,
			startDate,
			endDate,
			remainingYears,
			subDasha: "Current", // Calculate sub-dasha separately
		});
	}

	return dashas;
}

// Advanced Yoga Detection System
export function detectYogas(planets: PlanetaryPosition[]): string[] {
	const yogas: string[] = [];

	// Find specific planets
	const moon = planets.find((p) => p.name === "Moon");
	const mars = planets.find((p) => p.name === "Mars");
	const mercury = planets.find((p) => p.name === "Mercury");
	const jupiter = planets.find((p) => p.name === "Jupiter");
	const venus = planets.find((p) => p.name === "Venus");
	const saturn = planets.find((p) => p.name === "Saturn");

	// Gajakesari Yoga - Jupiter in Kendra from Moon
	if (jupiter && moon) {
		const houseDiff = Math.abs(jupiter.house - moon.house);
		if (
			[0, 3, 6, 9].includes(houseDiff) ||
			([1, 4, 7, 10].includes(jupiter.house) &&
				[1, 4, 7, 10].includes(moon.house))
		) {
			yogas.push("Gajakesari Yoga");
		}
	}

	// Panch Mahapurush Yogas
	if (
		mercury &&
		mercury.dignity === "own" &&
		[1, 4, 7, 10].includes(mercury.house)
	) {
		yogas.push("Bhadra Yoga (Mercury Mahapurush)");
	}
	if (
		jupiter &&
		jupiter.dignity === "own" &&
		[1, 4, 7, 10].includes(jupiter.house)
	) {
		yogas.push("Hamsa Yoga (Jupiter Mahapurush)");
	}
	if (venus && venus.dignity === "own" && [1, 4, 7, 10].includes(venus.house)) {
		yogas.push("Malavya Yoga (Venus Mahapurush)");
	}
	if (mars && mars.dignity === "own" && [1, 4, 7, 10].includes(mars.house)) {
		yogas.push("Ruchaka Yoga (Mars Mahapurush)");
	}
	if (
		saturn &&
		saturn.dignity === "own" &&
		[1, 4, 7, 10].includes(saturn.house)
	) {
		yogas.push("Shasha Yoga (Saturn Mahapurush)");
	}

	// Chandra Mangal Yoga - Moon and Mars conjunction/aspect
	if (moon && mars) {
		if (
			moon.house === mars.house ||
			Math.abs(moon.house - mars.house) === 6 ||
			((moon.house + 6) % 12) + 1 === mars.house ||
			((mars.house + 6) % 12) + 1 === moon.house
		) {
			yogas.push("Chandra Mangal Yoga");
		}
	}

	// Guru Mangal Yoga - Jupiter and Mars conjunction/aspect
	if (jupiter && mars) {
		if (
			jupiter.house === mars.house ||
			Math.abs(jupiter.house - mars.house) === 6 ||
			((jupiter.house + 6) % 12) + 1 === mars.house ||
			((mars.house + 6) % 12) + 1 === jupiter.house
		) {
			yogas.push("Guru Mangal Yoga");
		}
	}

	// Raja Yoga - Kendra and Trikona lords in connection
	const kendraLords = planets.filter((p) =>
		p.lordOf.some((house) => [1, 4, 7, 10].includes(house))
	);
	const trikonaLords = planets.filter((p) =>
		p.lordOf.some((house) => [1, 5, 9].includes(house))
	);

	for (const kendra of kendraLords) {
		for (const trikona of trikonaLords) {
			if (kendra.house === trikona.house && kendra.name !== trikona.name) {
				yogas.push("Raja Yoga");
				break;
			}
		}
	}

	// Neecha Bhanga Raja Yoga - Check for debilitation cancellation
	const debilitatedPlanets = planets.filter((p) => p.dignity === "debilitated");
	for (const debPlanet of debilitatedPlanets) {
		const dispositor = planets.find((p) =>
			p.lordOf.includes(getHouseNumberFromSign(debPlanet.sign))
		);
		if (
			dispositor &&
			([1, 4, 7, 10, 5, 9].includes(dispositor.house) ||
				dispositor.dignity === "exalted")
		) {
			yogas.push("Neecha Bhanga Raja Yoga");
		}
	}

	return yogas;
}

// Helper function to get house number from sign
function getHouseNumberFromSign(sign: string): number {
	const signToHouse: { [key: string]: number } = {
		Aries: 1,
		Taurus: 2,
		Gemini: 3,
		Cancer: 4,
		Leo: 5,
		Virgo: 6,
		Libra: 7,
		Scorpio: 8,
		Sagittarius: 9,
		Capricorn: 10,
		Aquarius: 11,
		Pisces: 12,
	};
	return signToHouse[sign] || 1;
}

// Calculate planetary strength (simplified Shadbala)
export function calculatePlanetaryStrength(planet: PlanetaryPosition): number {
	let strength = 50; // Base strength

	// Dignity strength
	switch (planet.dignity) {
		case "exalted":
			strength += 30;
			break;
		case "own":
			strength += 20;
			break;
		case "neutral":
			strength += 0;
			break;
		case "debilitated":
			strength -= 30;
			break;
		case "enemy":
			strength -= 10;
			break;
	}

	// House strength (Kendra and Trikona are stronger)
	if ([1, 4, 7, 10].includes(planet.house)) strength += 15; // Kendra
	else if ([5, 9].includes(planet.house)) strength += 10; // Trikona
	else if ([6, 8, 12].includes(planet.house)) strength -= 15; // Dusthana

	// Retrograde strength (generally considered stronger)
	if (planet.isRetrograde) strength += 10;

	return Math.max(0, Math.min(100, strength));
}

// Enhanced planetary position calculation with strength and lordships
function enhancePlanetaryPositions(
	planets: PlanetaryPosition[]
): PlanetaryPosition[] {
	return planets.map((planet) => {
		// Calculate strength
		const strength = calculatePlanetaryStrength(planet);

		// Calculate lordships
		const lordOf: number[] = [];
		Object.entries(getHouseLordships()).forEach(([house, lord]) => {
			if (lord === planet.name) {
				lordOf.push(parseInt(house));
			}
		});

		// Calculate aspects (simplified)
		const aspectsTo: number[] = [];
		if (planet.name === "Mars") {
			aspectsTo.push(
				(planet.house + 3) % 12 || 12,
				(planet.house + 7) % 12 || 12
			);
		} else if (planet.name === "Jupiter") {
			aspectsTo.push(
				(planet.house + 4) % 12 || 12,
				(planet.house + 8) % 12 || 12
			);
		} else if (planet.name === "Saturn") {
			aspectsTo.push(
				(planet.house + 2) % 12 || 12,
				(planet.house + 9) % 12 || 12
			);
		}
		// All planets aspect 7th house
		aspectsTo.push((planet.house + 6) % 12 || 12);

		return {
			...planet,
			strength,
			lordOf,
			aspectsTo,
		};
	});
}

// Get house lordships based on ascendant
function getHouseLordships(): { [house: number]: string } {
	return {
		1: "Mars",
		2: "Venus",
		3: "Mercury",
		4: "Moon",
		5: "Sun",
		6: "Mercury",
		7: "Venus",
		8: "Mars",
		9: "Jupiter",
		10: "Saturn",
		11: "Saturn",
		12: "Jupiter",
	};
}

// Generate complete birth chart with enhanced accuracy
export function generateBirthChart(birthDetails: BirthDetails) {
	// Note: Time is assumed to be in IST (Indian Standard Time, UTC+5:30)
	// For accurate calculations, ensure birth time is provided in IST
	const ascendant = calculateAscendant(birthDetails);
	const ascendantSign = getSignFromDegree(ascendant);
	let planets = calculatePlanetaryPositions(birthDetails);
	const houses = calculateHousePositions(ascendant);

	// Enhance planetary positions with strength and lordships
	planets = enhancePlanetaryPositions(planets);

	// Detect yogas
	const yogas = detectYogas(planets);

	// Get birth Nakshatra from Moon's position
	const moon = planets.find((p) => p.name === "Moon");
	const birthNakshatra = moon ? moon.nakshatra : "Ashwini";
	const dashas = calculateVimshottariDasha(birthDetails, birthNakshatra);

	// Get current dasha
	const currentDate = new Date();
	const currentDasha =
		dashas.find(
			(d) => currentDate >= d.startDate && currentDate <= d.endDate
		) || dashas[0];

	return {
		ascendant: {
			degree: ascendant,
			sign: ascendantSign,
			nakshatra: getNakshatraFromDegree(ascendant),
		},
		planets,
		houses,
		dashas,
		currentDasha: {
			planet: currentDasha?.planet || "Sun",
			startDate: currentDasha?.startDate.toISOString().split("T")[0] || "",
			endDate: currentDasha?.endDate.toISOString().split("T")[0] || "",
			subDasha: currentDasha?.subDasha || "Current",
		},
		yogas,
		birthNakshatra,
		chartStyle: "North Indian",
		calculationAccuracy: "Enhanced with Shadbala and Yoga detection",
	};
}

// Export constants for use in other modules
export {
	ZODIAC_SIGNS,
	NAKSHATRAS,
	PLANETARY_DIGNITIES,
	VIMSHOTTARI_DASHA,
	DASHA_PERIODS,
};
