import { BirthChartInput } from "@/types/astrology";

const ASTROLOGY_API_BASE_URL = "https://json.freeastrologyapi.com";
const ASTROLOGY_API_KEY = "KgTnXKOIkQaPfz0X2bIg2aeO8feo8QDM7zXeKG5Y";

export interface PanchangData {
	date: string;
	tithi: string;
	nakshatra: string;
	yoga: string;
	karana: string;
	sunrise: string;
	sunset: string;
	abhijitMuhurat: { start: string; end: string };
	amritKaal: { start: string; end: string };
	brahmaMuhurat: { start: string; end: string };
	rahuKalam: { start: string; end: string };
	yamagandam: { start: string; end: string };
	gulikaKalam: { start: string; end: string };
	goodTimes: Array<{ start: string; end: string; type: string }>;
	badTimes: Array<{ start: string; end: string; type: string }>;
}

export class PanchangService {
	/**
	 * Get comprehensive Panchang data for a specific date and location
	 */
	static async getPanchangData(
		date: Date,
		latitude: number,
		longitude: number,
		timezone: number
	): Promise<PanchangData | null> {
		try {
			const requestBody = {
				year: date.getFullYear(),
				month: date.getMonth() + 1,
				date: date.getDate(),
				hours: 12, // Use noon for Panchang calculations
				minutes: 0,
				seconds: 0,
				latitude: latitude,
				longitude: longitude,
				timezone: timezone,
				config: {
					observation_point: "topocentric",
					ayanamsha: "lahiri",
				},
			};

			// Fetch comprehensive Panchang data
			const panchangResponse = await fetch(
				`${ASTROLOGY_API_BASE_URL}/panchang`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"x-api-key": ASTROLOGY_API_KEY,
					},
					body: JSON.stringify(requestBody),
				}
			);

			if (!panchangResponse.ok) {
				throw new Error(`Panchang API error: ${panchangResponse.status}`);
			}

			const panchangData = await panchangResponse.json();

			// Fetch auspicious times
			const auspiciousTimes = await this.getAuspiciousTimes(requestBody);
			const inauspiciousTimes = await this.getInauspiciousTimes(requestBody);

			return {
				date: date.toISOString().split("T")[0],
				tithi: panchangData.output?.tithi || "Unknown",
				nakshatra: panchangData.output?.nakshatra || "Unknown",
				yoga: panchangData.output?.yoga || "Unknown",
				karana: panchangData.output?.karana || "Unknown",
				sunrise: panchangData.output?.sunrise || "Unknown",
				sunset: panchangData.output?.sunset || "Unknown",
				abhijitMuhurat: auspiciousTimes.abhijit || {
					start: "Unknown",
					end: "Unknown",
				},
				amritKaal: auspiciousTimes.amrit || {
					start: "Unknown",
					end: "Unknown",
				},
				brahmaMuhurat: auspiciousTimes.brahma || {
					start: "Unknown",
					end: "Unknown",
				},
				rahuKalam: inauspiciousTimes.rahu || {
					start: "Unknown",
					end: "Unknown",
				},
				yamagandam: inauspiciousTimes.yama || {
					start: "Unknown",
					end: "Unknown",
				},
				gulikaKalam: inauspiciousTimes.gulika || {
					start: "Unknown",
					end: "Unknown",
				},
				goodTimes: auspiciousTimes.all || [],
				badTimes: inauspiciousTimes.all || [],
			};
		} catch (error) {
			console.error("Error fetching Panchang data:", error);
			return null;
		}
	}

	/**
	 * Get auspicious times for a specific date and location
	 */
	private static async getAuspiciousTimes(requestBody: any): Promise<any> {
		try {
			const endpoints = ["abhijit-muhurat", "amrit-kaal", "brahma-muhurat"];

			const results: any = {};

			for (const endpoint of endpoints) {
				try {
					const response = await fetch(
						`${ASTROLOGY_API_BASE_URL}/${endpoint}`,
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
								"x-api-key": ASTROLOGY_API_KEY,
							},
							body: JSON.stringify(requestBody),
						}
					);

					if (response.ok) {
						const data = await response.json();
						results[endpoint.split("-")[0]] = {
							start: data.output?.start_time || "Unknown",
							end: data.output?.end_time || "Unknown",
						};
					}
				} catch (error) {
					console.error(`Error fetching ${endpoint}:`, error);
				}
			}

			// Get combined good times
			try {
				const response = await fetch(
					`${ASTROLOGY_API_BASE_URL}/good-bad-times`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							"x-api-key": ASTROLOGY_API_KEY,
						},
						body: JSON.stringify(requestBody),
					}
				);

				if (response.ok) {
					const data = await response.json();
					results.all = data.output?.good_times || [];
				}
			} catch (error) {
				console.error("Error fetching good times:", error);
			}

			return results;
		} catch (error) {
			console.error("Error fetching auspicious times:", error);
			return {};
		}
	}

	/**
	 * Get inauspicious times for a specific date and location
	 */
	private static async getInauspiciousTimes(requestBody: any): Promise<any> {
		try {
			const endpoints = ["rahu-kalam", "yama-gandam", "gulika-kalam"];

			const results: any = {};

			for (const endpoint of endpoints) {
				try {
					const response = await fetch(
						`${ASTROLOGY_API_BASE_URL}/${endpoint}`,
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
								"x-api-key": ASTROLOGY_API_KEY,
							},
							body: JSON.stringify(requestBody),
						}
					);

					if (response.ok) {
						const data = await response.json();
						results[endpoint.split("-")[0]] = {
							start: data.output?.start_time || "Unknown",
							end: data.output?.end_time || "Unknown",
						};
					}
				} catch (error) {
					console.error(`Error fetching ${endpoint}:`, error);
				}
			}

			// Get combined bad times
			try {
				const response = await fetch(
					`${ASTROLOGY_API_BASE_URL}/good-bad-times`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							"x-api-key": ASTROLOGY_API_KEY,
						},
						body: JSON.stringify(requestBody),
					}
				);

				if (response.ok) {
					const data = await response.json();
					results.all = data.output?.bad_times || [];
				}
			} catch (error) {
				console.error("Error fetching bad times:", error);
			}

			return results;
		} catch (error) {
			console.error("Error fetching inauspicious times:", error);
			return {};
		}
	}

	/**
	 * Get timing recommendations for specific activities
	 */
	static getTimingRecommendations(
		panchangData: PanchangData,
		activity: string
	): {
		bestTimes: string[];
		avoidTimes: string[];
		confidence: number;
	} {
		const recommendations = {
			bestTimes: [] as string[],
			avoidTimes: [] as string[],
			confidence: 70,
		};

		// Add auspicious times
		if (panchangData.abhijitMuhurat.start !== "Unknown") {
			recommendations.bestTimes.push(
				`Abhijit Muhurat: ${panchangData.abhijitMuhurat.start} - ${panchangData.abhijitMuhurat.end}`
			);
		}

		if (panchangData.amritKaal.start !== "Unknown") {
			recommendations.bestTimes.push(
				`Amrit Kaal: ${panchangData.amritKaal.start} - ${panchangData.amritKaal.end}`
			);
		}

		if (panchangData.brahmaMuhurat.start !== "Unknown") {
			recommendations.bestTimes.push(
				`Brahma Muhurat: ${panchangData.brahmaMuhurat.start} - ${panchangData.brahmaMuhurat.end}`
			);
		}

		// Add inauspicious times to avoid
		if (panchangData.rahuKalam.start !== "Unknown") {
			recommendations.avoidTimes.push(
				`Rahu Kalam: ${panchangData.rahuKalam.start} - ${panchangData.rahuKalam.end}`
			);
		}

		if (panchangData.yamagandam.start !== "Unknown") {
			recommendations.avoidTimes.push(
				`Yamagandam: ${panchangData.yamagandam.start} - ${panchangData.yamagandam.end}`
			);
		}

		if (panchangData.gulikaKalam.start !== "Unknown") {
			recommendations.avoidTimes.push(
				`Gulika Kalam: ${panchangData.gulikaKalam.start} - ${panchangData.gulikaKalam.end}`
			);
		}

		// Activity-specific recommendations
		switch (activity.toLowerCase()) {
			case "marriage":
			case "wedding":
				recommendations.confidence = 85;
				recommendations.bestTimes.push("Venus hours (Friday)");
				recommendations.avoidTimes.push("Mars hours (Tuesday)");
				break;

			case "business":
			case "startup":
				recommendations.confidence = 80;
				recommendations.bestTimes.push("Mercury hours (Wednesday)");
				recommendations.avoidTimes.push("Saturn hours (Saturday)");
				break;

			case "health":
			case "surgery":
				recommendations.confidence = 75;
				recommendations.bestTimes.push("Sun hours (Sunday)");
				recommendations.avoidTimes.push("Mars hours (Tuesday)");
				break;

			case "education":
			case "study":
				recommendations.confidence = 80;
				recommendations.bestTimes.push("Jupiter hours (Thursday)");
				recommendations.avoidTimes.push("Rahu hours");
				break;

			default:
				recommendations.confidence = 70;
		}

		return recommendations;
	}

	/**
	 * Validate Panchang data
	 */
	static validatePanchangData(panchangData: PanchangData): {
		isValid: boolean;
		errors: string[];
	} {
		const errors: string[] = [];

		if (!panchangData.date) {
			errors.push("Date is missing");
		}

		if (!panchangData.tithi || panchangData.tithi === "Unknown") {
			errors.push("Tithi information is missing");
		}

		if (!panchangData.nakshatra || panchangData.nakshatra === "Unknown") {
			errors.push("Nakshatra information is missing");
		}

		return {
			isValid: errors.length === 0,
			errors,
		};
	}
}
