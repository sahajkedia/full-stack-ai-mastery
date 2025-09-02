import { ObjectId } from "mongodb";

// Astrology API response types
export interface PlanetData {
	name: string;
	fullDegree: number;
	normDegree: number;
	isRetro: string;
	current_sign: number;
	house_number?: number;
}

export interface AyanamsaData {
	name: string;
	value: number;
}

export interface AstrologyApiResponse {
	statusCode: number;
	input: {
		year: number;
		month: number;
		date: number;
		hours: number;
		minutes: number;
		seconds: number;
		latitude: number;
		longitude: number;
		timezone: number;
		config: {
			observation_point: string;
			ayanamsha: string;
		};
	};
	output: [
		{ [key: string]: PlanetData | AyanamsaData | any },
		{ [planetName: string]: PlanetData }
	];
}

// Birth chart data for storage
export interface BirthChartInput {
	name: string;
	gender: "male" | "female";
	dateOfBirth: Date;
	timeOfBirth: {
		hours: number;
		minutes: number;
		seconds: number;
	};
	placeOfBirth: {
		name: string;
		latitude: number;
		longitude: number;
		timezone: number;
	};
}

export interface StoredBirthChart {
	_id?: ObjectId;
	// Input data
	input: BirthChartInput;
	// Astrology API response data
	chartData: AstrologyApiResponse;
	// Metadata
	createdAt: Date;
	updatedAt: Date;
	// Hash for quick lookup to avoid duplicate API calls
	inputHash: string;
	// Usage tracking
	accessCount: number;
	lastAccessedAt: Date;
}

// Chart calculation parameters for hashing
export interface ChartCalculationParams {
	year: number;
	month: number;
	date: number;
	hours: number;
	minutes: number;
	seconds: number;
	latitude: number;
	longitude: number;
	timezone: number;
	observation_point: string;
	ayanamsha: string;
}

// Simplified chart data for frontend
export interface ChartSummary {
	id: string;
	name: string;
	dateOfBirth: string;
	placeOfBirth: string;
	createdAt: string;
	planets: { [planetName: string]: PlanetData };
}
