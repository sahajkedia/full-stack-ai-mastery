import { ReadingType } from "@prisma/client";

export interface BirthChartData {
	id: string;
	name: string;
	birthDate: Date;
	birthTime: string;
	birthPlace: string;
	latitude: number;
	longitude: number;
	timezone: string;
	chartData: any;
	createdAt: Date;
	updatedAt: Date;
}

export interface ReadingData {
	id: string;
	type: ReadingType;
	title: string;
	content: string;
	aiGenerated: boolean;
	createdAt: Date;
	updatedAt: Date;
	birthChartId?: string;
}

export interface UserProfile {
	id: string;
	name?: string;
	email?: string;
	image?: string;
	birthCharts: BirthChartData[];
	readings: ReadingData[];
}

export interface AstrologyChart {
	planets: PlanetPosition[];
	houses: HousePosition[];
	aspects: Aspect[];
}

export interface PlanetPosition {
	planet: string;
	sign: string;
	degree: number;
	house: number;
	retrograde: boolean;
}

export interface HousePosition {
	house: number;
	sign: string;
	degree: number;
}

export interface Aspect {
	planet1: string;
	planet2: string;
	aspect: string;
	orb: number;
}

export interface BirthData {
	date: string;
	time: string;
	place: string;
	latitude: number;
	longitude: number;
	timezone: string;
}
