import { BirthChartInput, DashaApiResponse } from "@/types/astrology";

const ASTROLOGY_API_BASE_URL = "https://json.freeastrologyapi.com";
const ASTROLOGY_API_KEY = "KgTnXKOIkQaPfz0X2bIg2aeO8feo8QDM7zXeKG5Y";

export class DashaService {
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
	 * Calculate dasha information using FreeAstrologyAPI
	 */
	static async calculateDasha(
		input: BirthChartInput,
		eventDate?: Date
	): Promise<DashaApiResponse | null> {
		try {
			// Use current date if no event date provided
			const currentDate = eventDate || new Date();

			// Determine timezone if not provided
			const timezone =
				input.placeOfBirth.timezone ||
				this.getTimezoneFromCoordinates(
					input.placeOfBirth.latitude,
					input.placeOfBirth.longitude
				);

			// Prepare API request body
			const requestBody = {
				year: input.dateOfBirth.getFullYear(),
				month: input.dateOfBirth.getMonth() + 1, // JavaScript months are 0-indexed
				date: input.dateOfBirth.getDate(),
				hours: input.timeOfBirth.hours,
				minutes: input.timeOfBirth.minutes,
				seconds: input.timeOfBirth.seconds,
				latitude: input.placeOfBirth.latitude,
				longitude: input.placeOfBirth.longitude,
				timezone: timezone,
				config: {
					observation_point: "geocentric",
					ayanamsha: "sayana",
				},
				event_data: {
					year: currentDate.getFullYear(),
					month: currentDate.getMonth() + 1,
					date: currentDate.getDate(),
					hours: currentDate.getHours(),
					minutes: currentDate.getMinutes(),
					seconds: currentDate.getSeconds(),
				},
			};

			console.log("Fetching dasha data from FreeAstrologyAPI");
			console.log("Birth details for dasha calculation:", {
				date: input.dateOfBirth,
				time: input.timeOfBirth,
				place: input.placeOfBirth,
				eventDate: currentDate,
			});

			// Make API request to correct vimsottari dasha endpoint
			const response = await fetch(
				`${ASTROLOGY_API_BASE_URL}/vimsottari/dasa-information`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"x-api-key": ASTROLOGY_API_KEY,
					},
					body: JSON.stringify(requestBody),
				}
			);

			if (!response.ok) {
				throw new Error(
					`Dasha API error: ${response.status} ${response.statusText}`
				);
			}

			const rawResponse = await response.json();
			console.log("Raw API response:", rawResponse);

			// Parse the output string which contains the actual dasha data
			const outputData = JSON.parse(rawResponse.output);
			console.log("Parsed output data:", outputData);

			// Transform the data to match our expected format
			const dashaData: DashaApiResponse = {
				statusCode: rawResponse.statusCode,
				input: {
					year: requestBody.year,
					month: requestBody.month,
					date: requestBody.date,
					hours: requestBody.hours,
					minutes: requestBody.minutes,
					seconds: requestBody.seconds,
					latitude: requestBody.latitude,
					longitude: requestBody.longitude,
					timezone: requestBody.timezone,
					config: requestBody.config,
					event_data: requestBody.event_data,
				},
				output: {
					mahadasha: {
						planet: outputData.maha_dasa.Lord,
						startDate: outputData.maha_dasa.start_time,
						endDate: outputData.maha_dasa.end_time,
						duration: 0, // Will be calculated
						remainingYears: 0,
						remainingMonths: 0,
						remainingDays: 0,
					},
					antardasha: {
						planet: outputData.antar_dasa.Lord,
						startDate: outputData.antar_dasa.start_time,
						endDate: outputData.antar_dasa.end_time,
						duration: 0,
						remainingYears: 0,
						remainingMonths: 0,
						remainingDays: 0,
					},
					pratyantardasha: {
						planet: outputData.pratyantar_dasa.Lord,
						startDate: outputData.pratyantar_dasa.start_time,
						endDate: outputData.pratyantar_dasa.end_time,
						duration: 0,
						remainingYears: 0,
						remainingMonths: 0,
						remainingDays: 0,
					},
					sookshmadasha: {
						planet: outputData.sookshma_antar_dasa.Lord,
						startDate: outputData.sookshma_antar_dasa.start_time,
						endDate: outputData.sookshma_antar_dasa.end_time,
						duration: 0,
						remainingYears: 0,
						remainingMonths: 0,
						remainingDays: 0,
					},
					pranadasha: {
						planet: outputData.praana_antar_dasa.Lord,
						startDate: outputData.praana_antar_dasa.start_time,
						endDate: outputData.praana_antar_dasa.end_time,
						duration: 0,
						remainingYears: 0,
						remainingMonths: 0,
						remainingDays: 0,
					},
				},
			};

			console.log(
				"Successfully fetched and transformed dasha data:",
				dashaData
			);

			return dashaData;
		} catch (error) {
			console.error("Error calculating dasha:", error);

			// If API fails, try to calculate basic dasha information locally
			console.log("Attempting local dasha calculation as fallback...");
			return this.calculateLocalDasha(input, eventDate);
		}
	}

	/**
	 * Calculate dasha information locally as fallback
	 */
	private static calculateLocalDasha(
		input: BirthChartInput,
		eventDate?: Date
	): DashaApiResponse | null {
		try {
			const currentDate = eventDate || new Date();
			const birthDate = input.dateOfBirth;

			// Calculate age in years
			const ageInYears = currentDate.getFullYear() - birthDate.getFullYear();
			const monthDiff = currentDate.getMonth() - birthDate.getMonth();
			const dayDiff = currentDate.getDate() - birthDate.getDate();

			// Adjust for partial years
			const exactAge = ageInYears + (monthDiff * 30 + dayDiff) / 365.25;

			console.log("Local dasha calculation - Birth date:", birthDate);
			console.log("Local dasha calculation - Current date:", currentDate);
			console.log("Local dasha calculation - Exact age:", exactAge);

			// Vimsottari Dasha sequence and durations
			const dashaSequence = [
				{ planet: "Ketu", duration: 7 },
				{ planet: "Venus", duration: 20 },
				{ planet: "Sun", duration: 6 },
				{ planet: "Moon", duration: 10 },
				{ planet: "Mars", duration: 7 },
				{ planet: "Rahu", duration: 18 },
				{ planet: "Jupiter", duration: 16 },
				{ planet: "Saturn", duration: 19 },
				{ planet: "Mercury", duration: 17 },
			];

			// Total dasha cycle duration (120 years)
			const totalCycleDuration = 120;

			// Find current mahadasha
			let cumulativeYears = 0;
			let currentMahadasha = dashaSequence[0];
			let mahadashaStartAge = 0;

			for (const dasha of dashaSequence) {
				console.log(
					`Checking ${dasha.planet}: cumulative ${cumulativeYears}, duration ${dasha.duration}, age ${exactAge}`
				);
				if (exactAge < cumulativeYears + dasha.duration) {
					currentMahadasha = dasha;
					mahadashaStartAge = cumulativeYears;
					console.log(`Found current mahadasha: ${currentMahadasha.planet}`);
					break;
				}
				cumulativeYears += dasha.duration;
			}

			// Calculate antardasha (sub-period within mahadasha)
			const mahadashaProgress = exactAge - mahadashaStartAge;
			const antardashaProgress =
				(mahadashaProgress / currentMahadasha.duration) * totalCycleDuration;

			let antardashaCumulative = 0;
			let currentAntardasha = dashaSequence[0];

			for (const dasha of dashaSequence) {
				if (antardashaProgress < antardashaCumulative + dasha.duration) {
					currentAntardasha = dasha;
					break;
				}
				antardashaCumulative += dasha.duration;
			}

			// Create mock response structure
			const mockResponse: DashaApiResponse = {
				statusCode: 200,
				input: {
					year: input.dateOfBirth.getFullYear(),
					month: input.dateOfBirth.getMonth() + 1,
					date: input.dateOfBirth.getDate(),
					hours: input.timeOfBirth.hours,
					minutes: input.timeOfBirth.minutes,
					seconds: input.timeOfBirth.seconds,
					latitude: input.placeOfBirth.latitude,
					longitude: input.placeOfBirth.longitude,
					timezone: input.placeOfBirth.timezone || 5.5,
					config: { observation_point: "geocentric", ayanamsha: "sayana" },
					event_data: {
						year: currentDate.getFullYear(),
						month: currentDate.getMonth() + 1,
						date: currentDate.getDate(),
						hours: currentDate.getHours(),
						minutes: currentDate.getMinutes(),
						seconds: currentDate.getSeconds(),
					},
				},
				output: {
					mahadasha: {
						planet: currentMahadasha.planet,
						startDate: new Date(
							birthDate.getTime() +
								mahadashaStartAge * 365.25 * 24 * 60 * 60 * 1000
						).toISOString(),
						endDate: new Date(
							birthDate.getTime() +
								(mahadashaStartAge + currentMahadasha.duration) *
									365.25 *
									24 *
									60 *
									60 *
									1000
						).toISOString(),
						duration: currentMahadasha.duration,
						remainingYears: Math.max(
							0,
							currentMahadasha.duration - mahadashaProgress
						),
						remainingMonths: 0,
						remainingDays: 0,
					},
					antardasha: {
						planet: currentAntardasha.planet,
						startDate: new Date(
							birthDate.getTime() +
								(mahadashaStartAge + antardashaCumulative) *
									365.25 *
									24 *
									60 *
									60 *
									1000
						).toISOString(),
						endDate: new Date(
							birthDate.getTime() +
								(mahadashaStartAge +
									antardashaCumulative +
									currentAntardasha.duration) *
									365.25 *
									24 *
									60 *
									60 *
									1000
						).toISOString(),
						duration: currentAntardasha.duration,
						remainingYears: 0,
						remainingMonths: 0,
						remainingDays: 0,
					},
					pratyantardasha: {
						planet: currentAntardasha.planet,
						startDate: new Date().toISOString(),
						endDate: new Date(
							Date.now() + 30 * 24 * 60 * 60 * 1000
						).toISOString(),
						duration: 0,
						remainingYears: 0,
						remainingMonths: 0,
						remainingDays: 0,
					},
					sookshmadasha: {
						planet: currentAntardasha.planet,
						startDate: new Date().toISOString(),
						endDate: new Date(
							Date.now() + 7 * 24 * 60 * 60 * 1000
						).toISOString(),
						duration: 0,
						remainingYears: 0,
						remainingMonths: 0,
						remainingDays: 0,
					},
					pranadasha: {
						planet: currentAntardasha.planet,
						startDate: new Date().toISOString(),
						endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
						duration: 0,
						remainingYears: 0,
						remainingMonths: 0,
						remainingDays: 0,
					},
				},
			};

			console.log("Local dasha calculation completed:", mockResponse);
			return mockResponse;
		} catch (error) {
			console.error("Error in local dasha calculation:", error);
			return null;
		}
	}

	/**
	 * Format dasha data for display
	 */
	static formatDashaForDisplay(dashaData: DashaApiResponse) {
		const { mahadasha, antardasha, pratyantardasha } = dashaData.output;

		// Calculate remaining time for each period
		const calculateRemainingTime = (startDate: string, endDate: string) => {
			const start = new Date(startDate);
			const end = new Date(endDate);
			const now = new Date();

			if (now >= end) {
				return "0y 0m 0d";
			}

			const totalMs = end.getTime() - now.getTime();
			const totalDays = Math.floor(totalMs / (1000 * 60 * 60 * 24));
			const years = Math.floor(totalDays / 365.25);
			const months = Math.floor((totalDays % 365.25) / 30.44);
			const days = Math.floor(totalDays % 30.44);

			return `${years}y ${months}m ${days}d`;
		};

		return {
			currentMahadasha: {
				planet: mahadasha.planet,
				startDate: mahadasha.startDate,
				endDate: mahadasha.endDate,
				remaining: calculateRemainingTime(
					mahadasha.startDate,
					mahadasha.endDate
				),
			},
			currentAntardasha: {
				planet: antardasha.planet,
				startDate: antardasha.startDate,
				endDate: antardasha.endDate,
				remaining: calculateRemainingTime(
					antardasha.startDate,
					antardasha.endDate
				),
			},
			currentPratyantardasha: {
				planet: pratyantardasha.planet,
				startDate: pratyantardasha.startDate,
				endDate: pratyantardasha.endDate,
				remaining: calculateRemainingTime(
					pratyantardasha.startDate,
					pratyantardasha.endDate
				),
			},
			calculatedAt: new Date().toISOString(),
		};
	}

	/**
	 * Get dasha period description for a planet
	 */
	static getDashaDescription(planet: string): string {
		const descriptions: { [key: string]: string } = {
			Sun: "Leadership, authority, recognition, and vitality. A period of self-expression and personal power.",
			Moon: "Emotions, intuition, family, and public life. A time of emotional growth and nurturing.",
			Mars: "Energy, courage, conflicts, and ambition. A period of action and determination.",
			Mercury:
				"Communication, learning, business, and travel. A time of intellectual growth and networking.",
			Jupiter:
				"Wisdom, expansion, spirituality, and good fortune. A period of growth and abundance.",
			Venus:
				"Love, beauty, luxury, and relationships. A time of harmony and artistic expression.",
			Saturn:
				"Discipline, hard work, limitations, and wisdom. A period of learning through challenges.",
			Rahu: "Desires, ambitions, and unconventional paths. A time of transformation and material pursuits.",
			Ketu: "Spirituality, detachment, and past life karma. A period of spiritual growth and letting go.",
		};

		return (
			descriptions[planet] ||
			"A period of planetary influence affecting various aspects of life."
		);
	}

	/**
	 * Validate dasha data
	 */
	static validateDashaData(dashaData: DashaApiResponse): {
		isValid: boolean;
		errors: string[];
	} {
		const errors: string[] = [];

		if (!dashaData.output) {
			errors.push("Dasha output data is missing");
			return { isValid: false, errors };
		}

		const { mahadasha, antardasha } = dashaData.output;

		if (!mahadasha || !mahadasha.planet) {
			errors.push("Mahadasha data is missing or invalid");
		}

		if (!antardasha || !antardasha.planet) {
			errors.push("Antardasha data is missing or invalid");
		}

		return {
			isValid: errors.length === 0,
			errors,
		};
	}
}
