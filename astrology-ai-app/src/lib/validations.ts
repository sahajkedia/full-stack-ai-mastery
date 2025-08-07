import { z } from "zod";

export const birthDataSchema = z.object({
	name: z.string().min(1, "Name is required").max(100, "Name too long"),
	birthDate: z.string().min(1, "Birth date is required"),
	birthTime: z
		.string()
		.regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
	birthPlace: z
		.string()
		.min(1, "Birth place is required")
		.max(200, "Place name too long"),
	latitude: z.number().min(-90).max(90),
	longitude: z.number().min(-180).max(180),
	timezone: z.string().min(1, "Timezone is required"),
});

export const readingRequestSchema = z.object({
	birthChartId: z.string().optional(),
	type: z.enum([
		"NATAL_CHART",
		"COMPATIBILITY",
		"TRANSIT",
		"HOROSCOPE",
		"PERSONAL_INSIGHT",
	]),
	prompt: z
		.string()
		.min(10, "Prompt must be at least 10 characters")
		.max(1000, "Prompt too long"),
});

export const userProfileSchema = z.object({
	name: z.string().min(1, "Name is required").max(100, "Name too long"),
	email: z.string().email("Invalid email address"),
});

export type BirthDataInput = z.infer<typeof birthDataSchema>;
export type ReadingRequestInput = z.infer<typeof readingRequestSchema>;
export type UserProfileInput = z.infer<typeof userProfileSchema>;
