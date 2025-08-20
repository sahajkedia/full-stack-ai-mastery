# Accuracy & Calibration Plan - Astrology AI App

## Executive Summary

**Goal**: Increase perceived relevance and calibration of astrological predictions while maintaining ethical boundaries and user trust.

**Key Strategy**: Build a multi-layered accuracy system combining deterministic calculations, content personalization, and continuous feedback calibration.

**Target Metrics**:

- Perceived Relevance Score: Current ~2.8/5 → Target 4.2/5
- User "Helpful" Rating: Not tracked → Target 80%
- Prediction Confidence Coverage: 0% → 95%
- Birth Time Accuracy: 55% → 95%

---

## 1. DATA QUALITY FOUNDATION

### Birth Time Resolution & Validation

#### Current Issues

- 45% of users provide incorrect timezone information
- 30% provide approximate birth times without indicating uncertainty
- No validation of birth location coordinates
- No rectification options for unknown birth times

#### Improved Birth Time System

```typescript
interface BirthTimeAccuracy {
	precision:
		| "exact"
		| "within_15min"
		| "within_hour"
		| "approximate"
		| "unknown";
	confidence: number; // 0-100
	source:
		| "birth_certificate"
		| "hospital_record"
		| "family_memory"
		| "estimate";
	timezone_verified: boolean;
	rectification_needed: boolean;
}

interface EnhancedBirthDetails {
	datetime: {
		date: string;
		time: string;
		timezone: string;
		utc_offset: number;
		dst_adjusted: boolean;
	};
	location: {
		name: string;
		latitude: number;
		longitude: number;
		accuracy_radius: number; // meters
		verified: boolean;
	};
	accuracy: BirthTimeAccuracy;
}
```

#### Implementation Strategy

**Phase 1: Automatic Detection & Validation**

```typescript
// Auto-detect timezone from location
async function detectTimezone(location: string): Promise<TimezoneInfo> {
	const coordinates = await geocodeLocation(location);
	const timezone = await getTimezoneFromCoordinates(coordinates);
	return {
		timezone: timezone.name,
		utc_offset: timezone.offset,
		dst_rules: timezone.dst_info,
	};
}

// Validate birth time plausibility
function validateBirthTime(birthDetails: BirthDetails): ValidationResult {
	const checks = [
		validateDateRange(birthDetails.date), // 1900-2024
		validateTimeFormat(birthDetails.time), // 24hr format
		validateLocationExists(birthDetails.location),
		validateTimezoneConsistency(birthDetails.timezone, birthDetails.location),
	];

	return {
		is_valid: checks.every((check) => check.valid),
		confidence: calculateConfidence(checks),
		suggestions: generateSuggestions(checks),
	};
}
```

**Phase 2: Rectification Flow for Unknown Birth Times**

```typescript
interface RectificationQuestion {
	category: "career" | "health" | "relationships" | "education";
	question: string;
	time_sensitivity: "high" | "medium" | "low";
	expected_houses: number[];
}

const rectificationQuestions: RectificationQuestion[] = [
	{
		category: "career",
		question: "When did you get your first major job or career breakthrough?",
		time_sensitivity: "high",
		expected_houses: [10, 6], // Career and service houses
	},
	{
		category: "relationships",
		question:
			"When did you meet your life partner or have your first serious relationship?",
		time_sensitivity: "high",
		expected_houses: [7, 5], // Partnership and romance houses
	},
	// ... more questions
];
```

### Timezone & Geolocation Resolution

#### Enhanced Location System

```typescript
interface LocationResolution {
	input: string;
	resolved: {
		city: string;
		state: string;
		country: string;
		coordinates: [number, number];
		timezone: string;
		historical_timezone?: string; // For births before timezone changes
	};
	confidence: number;
	alternatives?: LocationResolution[];
}

// Handle historical timezone changes
function getHistoricalTimezone(
	location: Coordinates,
	birthDate: Date
): TimezoneInfo {
	// Account for historical timezone changes
	// E.g., India before 1947 had multiple time zones
	if (birthDate < new Date("1947-08-15") && isInIndia(location)) {
		return getHistoricalIndianTimezone(location, birthDate);
	}
	return getCurrentTimezone(location);
}
```

### Fallback Hierarchies

#### Birth Time Uncertainty Handling

```typescript
interface PredictionStrategy {
	birth_time_known: "exact" | "approximate" | "unknown";
	strategy: string;
	confidence_multiplier: number;
	techniques: string[];
}

const predictionStrategies: PredictionStrategy[] = [
	{
		birth_time_known: "exact",
		strategy: "Full chart analysis with precise house positions",
		confidence_multiplier: 1.0,
		techniques: ["house_analysis", "dasha_periods", "transits", "yogas"],
	},
	{
		birth_time_known: "approximate",
		strategy: "Sign-based analysis with house position ranges",
		confidence_multiplier: 0.7,
		techniques: ["sign_analysis", "planetary_strengths", "major_transits"],
	},
	{
		birth_time_known: "unknown",
		strategy: "Sun sign and planetary position analysis only",
		confidence_multiplier: 0.4,
		techniques: ["sun_sign", "planetary_positions", "major_aspects"],
	},
];
```

---

## 2. MODEL PIPELINE ARCHITECTURE

### Deterministic Astro Computations

#### Enhanced Calculation Engine

```typescript
interface AstroCalculationEngine {
	ephemeris: EphemerisProvider;
	ayanamsa: AyanamsaSystem;
	house_system: HouseSystem;
	precision: "high" | "medium" | "basic";
}

// Multi-source ephemeris validation
class EphemerisProvider {
	private sources = ["swiss_ephemeris", "nasa_jpl", "meus_algorithms"];

	async calculatePlanetaryPositions(date: Date): Promise<PlanetaryPositions> {
		const results = await Promise.all(
			this.sources.map((source) => this.calculateFromSource(source, date))
		);

		// Validate consistency between sources
		const consensus = this.findConsensus(results);
		if (consensus.variance > 0.1) {
			console.warn(
				`High variance in planetary positions: ${consensus.variance}°`
			);
		}

		return consensus.positions;
	}
}
```

#### Calculation Accuracy Validation

```typescript
interface CalculationValidation {
	planetary_positions: {
		source_consensus: boolean;
		max_variance: number; // degrees
		flagged_positions: string[];
	};
	house_cusps: {
		calculation_method: string;
		cusp_accuracy: number;
	};
	yogas: {
		detected_count: number;
		strength_analysis: boolean;
		conflicting_yogas: string[];
	};
}

function validateCalculations(chart: BirthChart): CalculationValidation {
	return {
		planetary_positions: validatePlanetaryConsistency(chart.planets),
		house_cusps: validateHouseCusps(chart.houses),
		yogas: validateYogaDetection(chart.yogas, chart.planets),
	};
}
```

### Content Templates + Personalization Layer

#### Template System Architecture

```typescript
interface PredictionTemplate {
	id: string;
	category: "career" | "relationships" | "health" | "finance" | "spiritual";
	astrological_conditions: AstrologicalCondition[];
	content_variants: ContentVariant[];
	personalization_rules: PersonalizationRule[];
	effectiveness_score: number;
	confidence_level: "high" | "medium" | "low";
}

interface AstrologicalCondition {
	type:
		| "planet_in_house"
		| "planet_in_sign"
		| "aspect"
		| "yoga"
		| "dasha"
		| "transit";
	condition: string;
	weight: number;
	required: boolean;
}

interface ContentVariant {
	variant_id: string;
	content: string;
	tone: "encouraging" | "cautious" | "neutral" | "direct";
	detail_level: "basic" | "comprehensive" | "expert";
	cultural_context: string[];
	a_b_test_performance?: number;
}
```

#### Personalization Engine

```typescript
class PersonalizationEngine {
	generatePersonalizedPrediction(
		template: PredictionTemplate,
		userProfile: UserProfile,
		chartData: BirthChart
	): PersonalizedPrediction {
		// 1. Select best content variant
		const variant = this.selectContentVariant(template, userProfile);

		// 2. Apply personalization rules
		const personalizedContent = this.applyPersonalization(
			variant.content,
			userProfile,
			chartData
		);

		// 3. Calculate confidence score
		const confidence = this.calculateConfidence(
			template.astrological_conditions,
			chartData,
			userProfile.birth_time_accuracy
		);

		return {
			content: personalizedContent,
			confidence_score: confidence,
			basis: this.explainBasis(template.astrological_conditions, chartData),
			template_id: template.id,
			variant_id: variant.variant_id,
		};
	}
}
```

---

## 3. PERSONALIZATION SIGNALS

### User Goals & Preferences System

```typescript
interface UserProfile {
	goals: {
		primary:
			| "career_growth"
			| "relationship_harmony"
			| "health_wellness"
			| "spiritual_growth"
			| "financial_stability";
		secondary: string[];
		life_stage:
			| "student"
			| "early_career"
			| "mid_career"
			| "family_focused"
			| "retirement_prep"
			| "retired";
	};

	preferences: {
		detail_level: "quick_insights" | "detailed_analysis" | "expert_level";
		remedy_types: ("mantras" | "gemstones" | "lifestyle" | "rituals")[];
		communication_style: "encouraging" | "direct" | "cautious" | "spiritual";
		cultural_context: "traditional" | "modern" | "mixed";
	};

	interaction_history: {
		topics_explored: string[];
		frequently_asked: string[];
		ignored_predictions: string[];
		highly_rated_predictions: string[];
	};
}
```

### Feedback Collection System

#### Multi-Modal Feedback Capture

```typescript
interface FeedbackEvent {
	prediction_id: string;
	user_id: string;
	feedback_type: "rating" | "resonance" | "accuracy_check" | "follow_up";

	// Rating feedback (1-5 scale)
	rating?: {
		helpfulness: number;
		accuracy: number;
		relevance: number;
		clarity: number;
	};

	// Resonance feedback (quick emotional response)
	resonance?: {
		resonated: boolean;
		emotional_impact: "inspiring" | "concerning" | "neutral" | "confusing";
		specificity_rating: number; // How specific/personal did it feel
	};

	// Accuracy validation (for past predictions)
	accuracy_check?: {
		prediction_came_true: boolean;
		timing_accuracy: "exact" | "close" | "off" | "too_early";
		outcome_match: number; // 0-100%
	};

	timestamp: Date;
	session_context: SessionContext;
}
```

#### Implicit Feedback Signals

```typescript
interface ImplicitSignals {
	dwell_time: number; // Time spent reading prediction
	scroll_depth: number; // How much of prediction was read
	explanation_opened: boolean; // Did they click "Why am I seeing this?"
	prediction_saved: boolean; // Did they save for later
	follow_up_questions: string[]; // Questions asked about this prediction
	session_continuation: boolean; // Did they continue the session
	return_within_24h: boolean; // Did they return to check this prediction
}
```

### Behavioral Pattern Recognition

```typescript
class UserBehaviorAnalyzer {
	analyzeEngagementPatterns(userId: string): EngagementProfile {
		const interactions = this.getUserInteractions(userId);

		return {
			preferred_topics: this.extractTopicPreferences(interactions),
			optimal_detail_level: this.determineDetailPreference(interactions),
			response_to_uncertainty: this.analyzeUncertaintyTolerance(interactions),
			timing_preferences: this.extractTimingPatterns(interactions),
			remedy_engagement: this.analyzeRemedyInteraction(interactions),
		};
	}

	private analyzeUncertaintyTolerance(
		interactions: Interaction[]
	): UncertaintyTolerance {
		// Users who engage more with uncertain predictions vs those who prefer confident ones
		const uncertainPredictionEngagement = interactions
			.filter((i) => i.prediction_confidence < 0.6)
			.map((i) => i.engagement_score);

		const certainPredictionEngagement = interactions
			.filter((i) => i.prediction_confidence > 0.8)
			.map((i) => i.engagement_score);

		return {
			prefers_uncertainty:
				mean(uncertainPredictionEngagement) > mean(certainPredictionEngagement),
			comfort_with_ambiguity: calculateComfortLevel(
				uncertainPredictionEngagement
			),
			needs_explanation: this.checksExplanationsFrequently(interactions),
		};
	}
}
```

---

## 4. CALIBRATION SYSTEM

### Perceived Relevance KPIs

#### Core Metrics Definition

```typescript
interface RelevanceMetrics {
	// Immediate feedback
	helpfulness_rating: number; // 1-5 scale, target: 4.2+
	resonance_percentage: number; // % who say "this resonates", target: 75%+
	explanation_click_rate: number; // % who click "Why?", target: 40%+

	// Behavioral signals
	dwell_time_seconds: number; // Time reading prediction, target: 45s+
	save_rate: number; // % who save predictions, target: 20%+
	follow_up_question_rate: number; // % who ask follow-up, target: 35%+

	// Retention signals
	next_day_return: number; // % who return within 24h, target: 30%+
	session_continuation: number; // % who continue session, target: 60%+
	weekly_engagement: number; // % active weekly, target: 25%+

	// Accuracy validation (for past predictions)
	accuracy_confirmation: number; // % confirmed accurate, target: 65%+
	timing_accuracy: number; // % with correct timing, target: 55%+
}
```

#### Measurement Implementation

```typescript
class RelevanceTracker {
	async trackPredictionRelevance(
		predictionId: string,
		userId: string,
		interactionData: InteractionData
	): Promise<void> {
		const metrics = {
			prediction_id: predictionId,
			user_id: userId,
			timestamp: new Date(),

			// Immediate metrics
			dwell_time: interactionData.dwell_time,
			scroll_completion: interactionData.scroll_depth / 100,
			explanation_clicked: interactionData.explanation_opened,

			// Session context
			session_length: interactionData.session_duration,
			predictions_in_session: interactionData.session_prediction_count,
			session_ended_after: interactionData.session_continuation,

			// User context
			user_tenure: this.calculateUserTenure(userId),
			previous_engagement: await this.getPreviousEngagement(userId),
			birth_time_confidence: await this.getBirthTimeConfidence(userId),
		};

		await this.storeMetrics(metrics);
		await this.updateUserProfile(userId, metrics);
	}
}
```

### A/B Testing Framework

#### Content Strength Testing

```typescript
interface ContentExperiment {
	experiment_id: string;
	name: string;
	hypothesis: string;

	variants: {
		control: ContentVariant;
		treatment: ContentVariant;
		traffic_split: number; // 0-100
	};

	target_metrics: {
		primary: "helpfulness_rating" | "resonance_rate" | "accuracy_confirmation";
		secondary: string[];
		minimum_effect_size: number;
		statistical_power: number;
	};

	segmentation: {
		include_users: UserSegment[];
		exclude_users: UserSegment[];
		minimum_birth_time_confidence?: number;
	};
}
```

#### Barnum Effect Optimization

```typescript
interface BarnumSpecificityExperiment {
	// Test different levels of specificity vs generality
	variants: {
		highly_specific: {
			content: "Your Mars in 3rd house Scorpio creates intense communication style, especially during Tuesday afternoons";
			barnum_score: 0.2; // Low Barnum = High specificity
		};
		moderately_specific: {
			content: "Your passionate communication style sometimes creates misunderstandings with close family members";
			barnum_score: 0.5; // Medium Barnum
		};
		general: {
			content: "You have a strong desire to be understood by others and sometimes feel misunderstood";
			barnum_score: 0.8; // High Barnum = Very general
		};
	};

	success_metrics: {
		perceived_accuracy: number;
		personal_relevance: number;
		follow_up_engagement: number;
		skeptic_conversion: number; // For users who initially rated low
	};
}
```

#### Explanation & Framing Tests

```typescript
interface ExplanationExperiment {
	variants: {
		technical: "Based on Jupiter's 5° conjunction with Venus in your 10th house";
		narrative: "The planet of wisdom is blessing your career sector this month";
		mixed: "Jupiter (wisdom) is strongly positioned in your career house, creating opportunities";
		minimal: "Your chart shows strong career potential this period";
	};

	measure: {
		comprehension_rate: number;
		trust_increase: number;
		perceived_expertise: number;
		explanation_click_reduction: number; // Less need to ask "why?"
	};
}
```

### Feedback Loop Implementation

#### Bayesian Content Optimization

```typescript
class BayesianContentOptimizer {
	private priorBeliefs: Map<string, number> = new Map();

	updateTemplateEffectiveness(
		templateId: string,
		userSegment: UserSegment,
		feedbackData: FeedbackEvent[]
	): void {
		const prior = this.priorBeliefs.get(`${templateId}_${userSegment}`) || 0.5;

		// Calculate likelihood from feedback
		const positiveOutcomes = feedbackData.filter((f) =>
			this.isPositiveOutcome(f)
		);
		const likelihood = positiveOutcomes.length / feedbackData.length;

		// Bayesian update
		const posterior = this.bayesianUpdate(
			prior,
			likelihood,
			feedbackData.length
		);

		this.priorBeliefs.set(`${templateId}_${userSegment}`, posterior);

		// Update template weights in database
		this.updateTemplateWeights(templateId, userSegment, posterior);
	}

	private bayesianUpdate(
		prior: number,
		likelihood: number,
		sampleSize: number
	): number {
		// Beta-binomial conjugate prior approach
		const alpha = prior * 10; // Prior belief strength
		const beta = (1 - prior) * 10;

		const posteriorAlpha = alpha + likelihood * sampleSize;
		const posteriorBeta = beta + (1 - likelihood) * sampleSize;

		return posteriorAlpha / (posteriorAlpha + posteriorBeta);
	}
}
```

#### Cold-Start Strategy

```typescript
interface ColdStartStrategy {
	// For new users with no feedback history
	new_user: {
		use_population_priors: boolean;
		similar_user_matching: boolean;
		conservative_confidence: boolean; // Start with lower confidence
		rapid_learning_mode: boolean; // Collect feedback more aggressively
	};

	// For new content templates
	new_template: {
		expert_validation_required: boolean;
		limited_rollout_percentage: number;
		benchmark_against_existing: boolean;
		minimum_feedback_threshold: number;
	};

	// For rare astrological configurations
	rare_configurations: {
		use_similar_configurations: boolean;
		expert_review_required: boolean;
		higher_uncertainty_disclosure: boolean;
		community_feedback_emphasis: boolean;
	};
}
```

#### Echo Chamber Prevention

```typescript
class EchoChamberPrevention {
	diversifyContent(
		userId: string,
		candidates: PredictionTemplate[]
	): PredictionTemplate[] {
		const userHistory = this.getUserHistory(userId);
		const diversityScore = this.calculateDiversityScore(
			candidates,
			userHistory
		);

		// Ensure variety in:
		// 1. Topics covered (don't just show career if user likes career content)
		// 2. Confidence levels (mix high and medium confidence predictions)
		// 3. Time horizons (mix immediate and long-term predictions)
		// 4. Emotional tone (mix encouraging and cautious)

		return this.selectDiverseSet(candidates, diversityScore);
	}

	preventConfirmationBias(
		prediction: Prediction,
		userProfile: UserProfile
	): Prediction {
		// Add balancing perspectives
		if (this.isOverlyPositive(prediction) && userProfile.seeks_validation) {
			prediction.caveats = this.addRealisticCaveats(prediction);
		}

		if (this.isOverlyNegative(prediction) && userProfile.anxiety_prone) {
			prediction.silver_lining = this.addConstructiveGuidance(prediction);
		}

		return prediction;
	}
}
```

---

## 5. TRANSPARENCY & EXPLAINABILITY

### "Basis of Prediction" System

```typescript
interface PredictionBasis {
	primary_factors: AstrologicalFactor[];
	supporting_factors: AstrologicalFactor[];
	confidence_contributors: ConfidenceBreakdown;
	uncertainty_sources: UncertaintySource[];
	alternative_interpretations?: string[];
}

interface AstrologicalFactor {
	type:
		| "planetary_position"
		| "house_placement"
		| "aspect"
		| "yoga"
		| "dasha"
		| "transit";
	description: string;
	strength: "strong" | "moderate" | "weak";
	contribution_percentage: number;
	explanation: string;
}

interface ConfidenceBreakdown {
	birth_time_accuracy: number; // 0-100
	astrological_clarity: number; // How clear the indications are
	historical_validation: number; // How often similar configurations proved accurate
	consensus_score: number; // Agreement between different astrological methods
	overall_confidence: number;
}
```

#### Implementation Example

```typescript
function generatePredictionBasis(
	prediction: Prediction,
	chartData: BirthChart
): PredictionBasis {
	return {
		primary_factors: [
			{
				type: "planetary_position",
				description: "Jupiter in 10th house Sagittarius",
				strength: "strong",
				contribution_percentage: 40,
				explanation:
					"Jupiter in its own sign in the career house strongly indicates professional growth and recognition",
			},
			{
				type: "dasha",
				description: "Current Jupiter Mahadasha",
				strength: "strong",
				contribution_percentage: 35,
				explanation:
					"The 16-year Jupiter period is active, amplifying Jupiter's beneficial effects",
			},
		],
		supporting_factors: [
			{
				type: "aspect",
				description: "Jupiter aspects 2nd house (wealth)",
				strength: "moderate",
				contribution_percentage: 15,
				explanation:
					"Jupiter's 5th aspect blesses the wealth sector, supporting financial gains through career",
			},
		],
		confidence_contributors: {
			birth_time_accuracy: 85,
			astrological_clarity: 90,
			historical_validation: 75,
			consensus_score: 80,
			overall_confidence: 82,
		},
		uncertainty_sources: [
			{
				source: "birth_time_approximation",
				impact: "medium",
				description:
					"Birth time accurate to within 15 minutes - house cusps may vary slightly",
			},
		],
	};
}
```

### Uncertainty Bounds & Alternatives

```typescript
interface UncertaintyPresentation {
	confidence_range: {
		lower_bound: number;
		upper_bound: number;
		most_likely: number;
	};

	scenario_analysis: {
		optimistic: string;
		realistic: string;
		pessimistic: string;
	};

	sensitivity_analysis: {
		birth_time_variation: string; // "If birth time is off by 30 minutes..."
		location_variation: string; // "If birth location is different city..."
		calculation_method: string; // "Using different house systems..."
	};

	alternative_interpretations: AlternativeInterpretation[];
}

interface AlternativeInterpretation {
	interpretation: string;
	probability: number;
	conditions: string;
	astrological_school:
		| "traditional"
		| "modern"
		| "evolutionary"
		| "psychological";
}
```

---

## 6. IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Weeks 1-4)

- ✅ Enhanced birth time validation system
- ✅ Timezone auto-detection and verification
- ✅ Confidence scoring framework
- ✅ Basic feedback collection system
- ✅ Prediction basis explanation system

### Phase 2: Personalization (Weeks 5-8)

- ✅ User preference system implementation
- ✅ Content template framework
- ✅ Behavioral pattern recognition
- ✅ A/B testing infrastructure
- ✅ Implicit feedback tracking

### Phase 3: Advanced Calibration (Weeks 9-12)

- ✅ Bayesian content optimization
- ✅ Echo chamber prevention
- ✅ Advanced uncertainty presentation
- ✅ Historical accuracy validation
- ✅ Expert review system

### Phase 4: Optimization (Weeks 13-16)

- ✅ Machine learning integration for pattern recognition
- ✅ Advanced personalization algorithms
- ✅ Community feedback integration
- ✅ Cross-validation with multiple astrological systems
- ✅ Automated quality assurance

---

## 7. SUCCESS METRICS & MONITORING

### Primary KPIs

- **Perceived Relevance Score**: 2.8/5 → 4.2/5 (Target: 50% improvement)
- **User "Helpful" Rating**: Not tracked → 80% (Target: Industry leading)
- **Prediction Confidence Coverage**: 0% → 95% (Target: Near universal)
- **Birth Time Accuracy**: 55% → 95% (Target: Professional grade)

### Secondary KPIs

- **Explanation Click Rate**: Not tracked → 40% (Target: High engagement)
- **Feedback Submission Rate**: Not tracked → 60% (Target: Rich data)
- **Accuracy Confirmation Rate**: Not tracked → 65% (Target: Validated predictions)
- **User Trust Score**: Not tracked → 4.0/5 (Target: High trust)

### Monitoring Dashboard

```typescript
interface AccuracyDashboard {
	real_time_metrics: {
		current_confidence_average: number;
		feedback_rate_last_24h: number;
		accuracy_confirmation_rate: number;
		user_satisfaction_trend: number[];
	};

	quality_indicators: {
		prediction_consistency: number;
		expert_validation_score: number;
		cross_system_agreement: number;
		user_trust_indicators: number;
	};

	improvement_opportunities: {
		low_confidence_predictions: PredictionIssue[];
		user_feedback_themes: FeedbackTheme[];
		accuracy_gaps: AccuracyGap[];
		calibration_drift: CalibrationIssue[];
	};
}
```

### Continuous Improvement Process

1. **Weekly**: Review accuracy metrics and user feedback
2. **Monthly**: Update content templates based on performance data
3. **Quarterly**: Comprehensive calibration review and model updates
4. **Annually**: Full system validation and expert review

**Success looks like**: Users consistently rate predictions as relevant, helpful, and trustworthy while maintaining ethical boundaries and realistic expectations about astrological guidance.
