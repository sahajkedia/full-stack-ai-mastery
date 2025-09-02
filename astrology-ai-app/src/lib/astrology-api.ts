import { ChartService } from "./chart-service";
import {
	BirthChartInput,
	AstrologyApiResponse,
	ChartCalculationParams,
} from "@/types/astrology";

const ASTROLOGY_API_BASE_URL = "https://json.freeastrologyapi.com";
const ASTROLOGY_API_KEY = "KgTnXKOIkQaPfz0X2bIg2aeO8feo8QDM7zXeKG5Y";

export class AstrologyAPI {
	/**
	 * Get timezone offset for coordinates (rough approximation)
	 * For production, use a proper timezone API
	 */
	private static getTimezoneFromCoordinates(
		latitude: number,
		longitude: number
	): number {
		// Simple approximation based on longitude
		// 15 degrees longitude ≈ 1 hour
		const offset = Math.round(longitude / 15);

		// Clamp to reasonable timezone range (-12 to +14)
		return Math.max(-12, Math.min(14, offset));
	}

	/**
	 * Calculate birth chart with caching
	 */
	static async calculateBirthChart(
		input: BirthChartInput
	): Promise<AstrologyApiResponse | null> {
		try {
			// Determine timezone if not provided
			const timezone =
				input.placeOfBirth.timezone ||
				this.getTimezoneFromCoordinates(
					input.placeOfBirth.latitude,
					input.placeOfBirth.longitude
				);

			const params: ChartCalculationParams = {
				year: input.dateOfBirth.getFullYear(),
				month: input.dateOfBirth.getMonth() + 1, // JavaScript months are 0-indexed
				date: input.dateOfBirth.getDate(),
				hours: input.timeOfBirth.hours,
				minutes: input.timeOfBirth.minutes,
				seconds: input.timeOfBirth.seconds,
				latitude: input.placeOfBirth.latitude,
				longitude: input.placeOfBirth.longitude,
				timezone: timezone,
				observation_point: "topocentric",
				ayanamsha: "lahiri",
			};

			// Check if we have cached data
			const existingChart = await ChartService.findExistingChart(params);
			if (existingChart) {
				console.log("Using cached chart data");
				return existingChart.chartData;
			}

			console.log("Fetching new chart data from API");

			// Prepare API request
			const requestBody = {
				year: params.year,
				month: params.month,
				date: params.date,
				hours: params.hours,
				minutes: params.minutes,
				seconds: params.seconds,
				latitude: params.latitude,
				longitude: params.longitude,
				timezone: params.timezone,
				config: {
					observation_point: params.observation_point,
					ayanamsha: params.ayanamsha,
				},
			};

			// Make API request
			const response = await fetch(`${ASTROLOGY_API_BASE_URL}/planets`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-api-key": ASTROLOGY_API_KEY,
				},
				body: JSON.stringify(requestBody),
			});

			if (!response.ok) {
				throw new Error(
					`Astrology API error: ${response.status} ${response.statusText}`
				);
			}

			const chartData: AstrologyApiResponse = await response.json();

			// Save to database for future use
			await ChartService.saveChart(input, chartData);

			return chartData;
		} catch (error) {
			console.error("Error calculating birth chart:", error);
			return null;
		}
	}

	/**
	 * Get chart by ID from database
	 */
	static async getStoredChart(id: string) {
		return await ChartService.getChartById(id);
	}

	/**
	 * Get recent charts
	 */
	static async getRecentCharts(limit?: number) {
		return await ChartService.getRecentCharts(limit);
	}

	/**
	 * Get API usage statistics
	 */
	static async getApiStats() {
		return await ChartService.getChartStats();
	}

	/**
	 * Format birth chart data for display
	 */
	static formatChartForDisplay(chartData: AstrologyApiResponse) {
		const planets = chartData.output[1];
		const ayanamsa = chartData.output[0]["13"] as {
			name: string;
			value: number;
		};

		return {
			planets,
			ayanamsa: ayanamsa.value,
			input: chartData.input,
			calculatedAt: new Date().toISOString(),
		};
	}

	/**
	 * Validate birth details before API call
	 */
	static validateBirthDetails(input: BirthChartInput): {
		isValid: boolean;
		errors: string[];
	} {
		const errors: string[] = [];

		// Validate name
		if (!input.name || input.name.trim().length === 0) {
			errors.push("Name is required");
		}

		// Validate date
		const now = new Date();
		const birthDate = input.dateOfBirth;

		if (birthDate > now) {
			errors.push("Birth date cannot be in the future");
		}

		if (birthDate.getFullYear() < 1900) {
			errors.push("Birth year must be after 1900");
		}

		// Validate time
		const { hours, minutes, seconds } = input.timeOfBirth;

		if (hours < 0 || hours > 23) {
			errors.push("Hours must be between 0 and 23");
		}

		if (minutes < 0 || minutes > 59) {
			errors.push("Minutes must be between 0 and 59");
		}

		if (seconds < 0 || seconds > 59) {
			errors.push("Seconds must be between 0 and 59");
		}

		// Validate coordinates
		const { latitude, longitude } = input.placeOfBirth;

		if (latitude < -90 || latitude > 90) {
			errors.push("Latitude must be between -90 and 90");
		}

		if (longitude < -180 || longitude > 180) {
			errors.push("Longitude must be between -180 and 180");
		}

		// Validate place name
		if (
			!input.placeOfBirth.name ||
			input.placeOfBirth.name.trim().length === 0
		) {
			errors.push("Place of birth is required");
		}

		return {
			isValid: errors.length === 0,
			errors,
		};
	}
}
