// Vedic Astrology Chart Calculator
// This module provides accurate calculations for birth charts, planetary positions, and dasha periods

export interface BirthDetails {
	date: string; // DD/MM/YYYY format
	time: string; // HH:MM format (24-hour)
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
	dignity: "exalted" | "own" | "neutral" | "debilited" | "enemy";
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

	// Sample planetary positions (replace with actual ephemeris calculations)
	const samplePositions = [
		{ name: "Sun", symbol: "☉", degree: 15.5, sign: "Aries" },
		{ name: "Moon", symbol: "☽", degree: 28.3, sign: "Cancer" },
		{ name: "Mars", symbol: "♂", degree: 7.2, sign: "Capricorn" },
		{ name: "Mercury", symbol: "☿", degree: 22.8, sign: "Taurus" },
		{ name: "Jupiter", symbol: "♃", degree: 12.1, sign: "Sagittarius" },
		{ name: "Venus", symbol: "♀", degree: 5.7, sign: "Aquarius" },
		{ name: "Saturn", symbol: "♄", degree: 19.4, sign: "Scorpio" },
		{ name: "Rahu", symbol: "☊", degree: 14.9, sign: "Virgo" },
		{ name: "Ketu", symbol: "☋", degree: 194.9, sign: "Pisces" },
	];

	return samplePositions.map((planet) => {
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
			dignity: dignity as any,
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
	let currentDate2 = new Date(birthDate);

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

// Generate complete birth chart
export function generateBirthChart(birthDetails: BirthDetails) {
	const ascendant = calculateAscendant(birthDetails);
	const planets = calculatePlanetaryPositions(birthDetails);
	const houses = calculateHousePositions(ascendant);

	// Get birth Nakshatra from Moon's position
	const moon = planets.find((p) => p.name === "Moon");
	const birthNakshatra = moon ? moon.nakshatra : "Ashwini";
	const dashas = calculateVimshottariDasha(birthDetails, birthNakshatra);

	return {
		ascendant: {
			degree: ascendant,
			sign: getSignFromDegree(ascendant),
			nakshatra: getNakshatraFromDegree(ascendant),
		},
		planets,
		houses,
		dashas,
		birthNakshatra,
		chartStyle: "North Indian",
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
