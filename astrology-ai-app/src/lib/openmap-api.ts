import { Place, LocationSearchResult, Coordinates } from "@/types/location";

const OPENMAP_BASE_URL = "https://nominatim.openstreetmap.org";

export class OpenMapAPI {
	private static readonly SEARCH_ENDPOINT = "/search";
	private static readonly REVERSE_ENDPOINT = "/reverse";

	/**
	 * Search for places by query string
	 */
	static async searchPlaces(
		query: string,
		limit: number = 10
	): Promise<Place[]> {
		if (!query || query.trim().length < 2) {
			return [];
		}

		try {
			const params = new URLSearchParams({
				q: query.trim(),
				format: "json",
				addressdetails: "1",
				limit: limit.toString(),
				dedupe: "1",
				"accept-language": "en",
			});

			const response = await fetch(
				`${OPENMAP_BASE_URL}${this.SEARCH_ENDPOINT}?${params}`,
				{
					headers: {
						"User-Agent": "AstrologyApp/1.0 (contact@astrologyapp.com)",
					},
				}
			);

			if (!response.ok) {
				throw new Error(
					`OpenMap API error: ${response.status} ${response.statusText}`
				);
			}

			const data: Place[] = await response.json();
			return data || [];
		} catch (error) {
			console.error("Error searching places:", error);
			return [];
		}
	}

	/**
	 * Reverse geocoding - get place information from coordinates
	 */
	static async reverseGeocode(
		latitude: number,
		longitude: number
	): Promise<Place | null> {
		try {
			const params = new URLSearchParams({
				lat: latitude.toString(),
				lon: longitude.toString(),
				format: "json",
				addressdetails: "1",
				"accept-language": "en",
			});

			const response = await fetch(
				`${OPENMAP_BASE_URL}${this.REVERSE_ENDPOINT}?${params}`,
				{
					headers: {
						"User-Agent": "AstrologyApp/1.0 (contact@astrologyapp.com)",
					},
				}
			);

			if (!response.ok) {
				throw new Error(
					`OpenMap API error: ${response.status} ${response.statusText}`
				);
			}

			const data: Place = await response.json();
			return data;
		} catch (error) {
			console.error("Error reverse geocoding:", error);
			return null;
		}
	}

	/**
	 * Get current user location using browser geolocation
	 */
	static async getCurrentLocation(): Promise<Coordinates | null> {
		return new Promise((resolve) => {
			if (!navigator.geolocation) {
				console.error("Geolocation is not supported by this browser");
				resolve(null);
				return;
			}

			navigator.geolocation.getCurrentPosition(
				(position) => {
					resolve({
						latitude: position.coords.latitude,
						longitude: position.coords.longitude,
					});
				},
				(error) => {
					console.error("Error getting current location:", error);
					resolve(null);
				},
				{
					enableHighAccuracy: true,
					timeout: 10000,
					maximumAge: 300000, // 5 minutes
				}
			);
		});
	}

	/**
	 * Get current location and reverse geocode to get place information
	 */
	static async getCurrentPlace(): Promise<Place | null> {
		try {
			const coordinates = await this.getCurrentLocation();
			if (!coordinates) {
				return null;
			}

			return await this.reverseGeocode(
				coordinates.latitude,
				coordinates.longitude
			);
		} catch (error) {
			console.error("Error getting current place:", error);
			return null;
		}
	}

	/**
	 * Format place display name for better readability
	 */
	static formatPlaceDisplayName(place: Place): string {
		const { address } = place;
		if (!address) {
			return place.display_name;
		}

		const parts = [];

		// Add city/town/village
		if (address.city) parts.push(address.city);
		else if (address.suburb) parts.push(address.suburb);

		// Add state/province
		if (address.state) parts.push(address.state);

		// Add country
		if (address.country) parts.push(address.country);

		return parts.length > 0 ? parts.join(", ") : place.display_name;
	}

	/**
	 * Get timezone offset for coordinates (approximate)
	 */
	static getTimezoneOffset(longitude: number): number {
		// Rough approximation: 15 degrees longitude = 1 hour
		// This is a simple approximation, for production use a proper timezone API
		return Math.round(longitude / 15);
	}
}
