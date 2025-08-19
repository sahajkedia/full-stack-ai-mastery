import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatDegree(degree: number): string {
	return `${degree.toFixed(1)}°`;
}

export function getSignColor(sign: string): string {
	const signColors: Record<string, string> = {
		Aries: "text-red-400",
		Taurus: "text-green-400",
		Gemini: "text-yellow-400",
		Cancer: "text-blue-400",
		Leo: "text-orange-400",
		Virgo: "text-emerald-400",
		Libra: "text-pink-400",
		Scorpio: "text-purple-400",
		Sagittarius: "text-indigo-400",
		Capricorn: "text-gray-400",
		Aquarius: "text-cyan-400",
		Pisces: "text-violet-400",
	};
	return signColors[sign] || "text-gray-400";
}

export function getPlanetColor(planet: string): string {
	const planetColors: Record<string, string> = {
		Sun: "text-yellow-300",
		Moon: "text-blue-200",
		Mars: "text-red-400",
		Mercury: "text-green-300",
		Jupiter: "text-orange-300",
		Venus: "text-pink-300",
		Saturn: "text-purple-300",
		Rahu: "text-gray-300",
		Ketu: "text-gray-400",
	};
	return planetColors[planet] || "text-gray-300";
}

export function getHouseSignificance(house: number): string {
	const significances: Record<number, string> = {
		1: "Self, Personality, Appearance",
		2: "Wealth, Family, Speech",
		3: "Siblings, Courage, Skills",
		4: "Home, Mother, Peace",
		5: "Children, Education, Creativity",
		6: "Health, Enemies, Service",
		7: "Partnership, Marriage, Business",
		8: "Transformation, Longevity, Occult",
		9: "Fortune, Father, Spirituality",
		10: "Career, Status, Authority",
		11: "Gains, Friends, Desires",
		12: "Loss, Spirituality, Foreign",
	};
	return significances[house] || "";
}

export const cosmicGradients = {
	primary: "bg-gradient-to-r from-purple-500 via-violet-500 to-purple-600",
	secondary: "bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600",
	accent: "bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600",
	cosmic: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500",
	stellar: "bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600",
	nebula: "bg-gradient-to-r from-purple-400 via-pink-500 to-red-500",
};
