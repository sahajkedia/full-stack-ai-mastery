import { createHash } from "crypto";
import { getDatabase, COLLECTIONS } from "./mongodb";
import {
	BirthChartInput,
	StoredBirthChart,
	ChartCalculationParams,
	AstrologyApiResponse,
	ChartSummary,
} from "@/types/astrology";
import { ObjectId } from "mongodb";

export class ChartService {
	/**
	 * Create a hash from chart calculation parameters to identify duplicate requests
	 */
	static createInputHash(params: ChartCalculationParams): string {
		const hashInput = JSON.stringify({
			year: params.year,
			month: params.month,
			date: params.date,
			hours: params.hours,
			minutes: params.minutes,
			seconds: params.seconds,
			latitude: Math.round(params.latitude * 10000) / 10000, // Round to 4 decimal places
			longitude: Math.round(params.longitude * 10000) / 10000,
			timezone: params.timezone,
			observation_point: params.observation_point,
			ayanamsha: params.ayanamsha,
		});

		return createHash("sha256").update(hashInput).digest("hex");
	}

	/**
	 * Check if chart data exists in database for given parameters
	 */
	static async findExistingChart(
		params: ChartCalculationParams
	): Promise<StoredBirthChart | null> {
		try {
			const db = await getDatabase();
			const collection = db.collection<StoredBirthChart>(
				COLLECTIONS.BIRTH_CHARTS
			);

			const inputHash = this.createInputHash(params);
			const chart = await collection.findOne({ inputHash });

			if (chart) {
				// Update access tracking
				await collection.updateOne(
					{ _id: chart._id },
					{
						$inc: { accessCount: 1 },
						$set: { lastAccessedAt: new Date() },
					}
				);

				return chart;
			}

			return null;
		} catch (error) {
			console.error("Error finding existing chart:", error);
			return null;
		}
	}

	/**
	 * Save new chart data to database
	 */
	static async saveChart(
		input: BirthChartInput,
		chartData: AstrologyApiResponse
	): Promise<StoredBirthChart | null> {
		try {
			const db = await getDatabase();
			const collection = db.collection<StoredBirthChart>(
				COLLECTIONS.BIRTH_CHARTS
			);

			const params: ChartCalculationParams = {
				year: chartData.input.year,
				month: chartData.input.month,
				date: chartData.input.date,
				hours: chartData.input.hours,
				minutes: chartData.input.minutes,
				seconds: chartData.input.seconds,
				latitude: chartData.input.latitude,
				longitude: chartData.input.longitude,
				timezone: chartData.input.timezone,
				observation_point: chartData.input.config.observation_point,
				ayanamsha: chartData.input.config.ayanamsha,
			};

			const inputHash = this.createInputHash(params);
			const now = new Date();

			const chartDocument: Omit<StoredBirthChart, "_id"> = {
				input,
				chartData,
				inputHash,
				createdAt: now,
				updatedAt: now,
				accessCount: 1,
				lastAccessedAt: now,
			};

			const result = await collection.insertOne(
				chartDocument as StoredBirthChart
			);

			if (result.acknowledged) {
				return {
					_id: result.insertedId,
					...chartDocument,
				};
			}

			return null;
		} catch (error) {
			console.error("Error saving chart:", error);
			return null;
		}
	}

	/**
	 * Get chart by ID
	 */
	static async getChartById(id: string): Promise<StoredBirthChart | null> {
		try {
			const db = await getDatabase();
			const collection = db.collection<StoredBirthChart>(
				COLLECTIONS.BIRTH_CHARTS
			);

			const chart = await collection.findOne({ _id: new ObjectId(id) });

			if (chart) {
				// Update access tracking
				await collection.updateOne(
					{ _id: chart._id },
					{
						$inc: { accessCount: 1 },
						$set: { lastAccessedAt: new Date() },
					}
				);
			}

			return chart;
		} catch (error) {
			console.error("Error getting chart by ID:", error);
			return null;
		}
	}

	/**
	 * Get recent charts (for user history)
	 */
	static async getRecentCharts(limit: number = 10): Promise<ChartSummary[]> {
		try {
			const db = await getDatabase();
			const collection = db.collection<StoredBirthChart>(
				COLLECTIONS.BIRTH_CHARTS
			);

			const charts = await collection
				.find({})
				.sort({ createdAt: -1 })
				.limit(limit)
				.toArray();

			return charts.map((chart) => ({
				id: chart._id!.toString(),
				name: chart.input.name,
				dateOfBirth: chart.input.dateOfBirth.toISOString().split("T")[0],
				placeOfBirth: chart.input.placeOfBirth.name,
				createdAt: chart.createdAt.toISOString(),
				planets: chart.chartData.output[1] || {},
			}));
		} catch (error) {
			console.error("Error getting recent charts:", error);
			return [];
		}
	}

	/**
	 * Delete old charts to manage database size
	 */
	static async cleanupOldCharts(daysOld: number = 90): Promise<number> {
		try {
			const db = await getDatabase();
			const collection = db.collection<StoredBirthChart>(
				COLLECTIONS.BIRTH_CHARTS
			);

			const cutoffDate = new Date();
			cutoffDate.setDate(cutoffDate.getDate() - daysOld);

			const result = await collection.deleteMany({
				createdAt: { $lt: cutoffDate },
				accessCount: { $lt: 5 }, // Only delete rarely accessed charts
			});

			return result.deletedCount || 0;
		} catch (error) {
			console.error("Error cleaning up old charts:", error);
			return 0;
		}
	}

	/**
	 * Get chart statistics
	 */
	static async getChartStats(): Promise<{
		totalCharts: number;
		totalApiCallsSaved: number;
		mostAccessedChart: ChartSummary | null;
	}> {
		try {
			const db = await getDatabase();
			const collection = db.collection<StoredBirthChart>(
				COLLECTIONS.BIRTH_CHARTS
			);

			const totalCharts = await collection.countDocuments();

			const totalApiCallsSavedResult = await collection
				.aggregate([
					{
						$group: {
							_id: null,
							totalAccessCount: { $sum: "$accessCount" },
						},
					},
				])
				.toArray();

			const totalApiCallsSaved =
				totalApiCallsSavedResult[0]?.totalAccessCount - totalCharts || 0;

			const mostAccessedChartDoc = await collection.findOne(
				{},
				{ sort: { accessCount: -1 } }
			);

			let mostAccessedChart: ChartSummary | null = null;
			if (mostAccessedChartDoc) {
				mostAccessedChart = {
					id: mostAccessedChartDoc._id!.toString(),
					name: mostAccessedChartDoc.input.name,
					dateOfBirth: mostAccessedChartDoc.input.dateOfBirth
						.toISOString()
						.split("T")[0],
					placeOfBirth: mostAccessedChartDoc.input.placeOfBirth.name,
					createdAt: mostAccessedChartDoc.createdAt.toISOString(),
					planets: mostAccessedChartDoc.chartData.output[1] || {},
				};
			}

			return {
				totalCharts,
				totalApiCallsSaved,
				mostAccessedChart,
			};
		} catch (error) {
			console.error("Error getting chart stats:", error);
			return {
				totalCharts: 0,
				totalApiCallsSaved: 0,
				mostAccessedChart: null,
			};
		}
	}
}
