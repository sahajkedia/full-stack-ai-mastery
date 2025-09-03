// Test file for enhanced timing predictions
import {
	generateTimingPredictions,
	calculateCurrentDashaBreakdown,
} from "./timing-predictions";

// Test data
const testBirthChart = {
	birthDate: "15/12/1990",
	birthNakshatra: "Rohini",
	ascendant: { sign: "Scorpio", degree: 15.5 },
	planets: [
		{
			name: "Sun",
			sign: "Sagittarius",
			house: 9,
			degree: 20.5,
			nakshatra: "Purva Ashadha",
		},
		{
			name: "Moon",
			sign: "Taurus",
			house: 4,
			degree: 8.2,
			nakshatra: "Rohini",
		},
		{
			name: "Mars",
			sign: "Capricorn",
			house: 11,
			degree: 12.8,
			nakshatra: "Uttara Ashadha",
		},
		{
			name: "Mercury",
			sign: "Sagittarius",
			house: 9,
			degree: 25.1,
			nakshatra: "Purva Ashadha",
		},
		{
			name: "Jupiter",
			sign: "Cancer",
			house: 5,
			degree: 18.7,
			nakshatra: "Pushya",
		},
		{
			name: "Venus",
			sign: "Capricorn",
			house: 11,
			degree: 5.3,
			nakshatra: "Uttara Ashadha",
		},
		{
			name: "Saturn",
			sign: "Capricorn",
			house: 11,
			degree: 22.9,
			nakshatra: "Dhanishta",
		},
		{
			name: "Rahu",
			sign: "Gemini",
			house: 3,
			degree: 14.6,
			nakshatra: "Ardra",
		},
		{
			name: "Ketu",
			sign: "Sagittarius",
			house: 9,
			degree: 14.6,
			nakshatra: "Purva Ashadha",
		},
	],
};

// Test timing predictions
export function testTimingPredictions() {
	console.log("Testing Enhanced Timing Predictions...\n");

	// Test Dasha breakdown
	try {
		const dashaBreakdown = calculateCurrentDashaBreakdown(
			new Date("1990-12-15"),
			"Rohini",
			new Date()
		);

		console.log("✅ Dasha Breakdown Test:");
		console.log(`Mahadasha: ${dashaBreakdown.mahadasha.planet}`);
		console.log(`Antardasha: ${dashaBreakdown.antardasha.planet}`);
		console.log(`Pratyantardasha: ${dashaBreakdown.pratyantardasha.planet}`);
		console.log(`Remaining years: ${dashaBreakdown.mahadasha.remainingYears}`);
		console.log(
			`Remaining months: ${dashaBreakdown.antardasha.remainingMonths}`
		);
		console.log(
			`Remaining days: ${dashaBreakdown.pratyantardasha.remainingDays}\n`
		);
	} catch (error) {
		console.error("❌ Dasha Breakdown Test Failed:", error);
	}

	// Test career timing predictions
	try {
		const careerPredictions = generateTimingPredictions(
			testBirthChart,
			"career",
			new Date()
		);

		console.log("✅ Career Timing Predictions Test:");
		console.log(`Found ${careerPredictions.length} predictions`);
		careerPredictions.forEach((pred, index) => {
			console.log(`\nPrediction ${index + 1}:`);
			console.log(`- Type: ${pred.type}`);
			console.log(`- Planet: ${pred.planet}`);
			console.log(`- Description: ${pred.description}`);
			console.log(`- Confidence: ${pred.confidence}%`);
			console.log(
				`- Timing: ${pred.startDate.toLocaleDateString()} to ${pred.endDate.toLocaleDateString()}`
			);
		});
	} catch (error) {
		console.error("❌ Career Timing Predictions Test Failed:", error);
	}

	// Test relationship timing predictions
	try {
		const relationshipPredictions = generateTimingPredictions(
			testBirthChart,
			"relationship",
			new Date()
		);

		console.log("\n✅ Relationship Timing Predictions Test:");
		console.log(`Found ${relationshipPredictions.length} predictions`);
		relationshipPredictions.forEach((pred, index) => {
			console.log(`\nPrediction ${index + 1}:`);
			console.log(`- Type: ${pred.type}`);
			console.log(`- Planet: ${pred.planet}`);
			console.log(`- Description: ${pred.description}`);
			console.log(`- Confidence: ${pred.confidence}%`);
			console.log(
				`- Timing: ${pred.startDate.toLocaleDateString()} to ${pred.endDate.toLocaleDateString()}`
			);
		});
	} catch (error) {
		console.error("❌ Relationship Timing Predictions Test Failed:", error);
	}

	console.log("\n🎯 Enhanced Timing Predictions Test Complete!");
}

// Run test if this file is executed directly
testTimingPredictions();
