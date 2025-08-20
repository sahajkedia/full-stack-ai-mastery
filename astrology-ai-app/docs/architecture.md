# System Architecture - Astrology AI App

## Executive Summary

**Architecture Goal**: Build a scalable, maintainable system that delivers sub-600ms p95 response times for cached reads and sub-1.5s for AI-generated content, while maintaining strong typing, observability, and ethical guardrails.

**Key Principles**:

- **Performance First**: Edge caching, streaming responses, optimistic UI
- **Free/Low-Cost**: Leverage free tiers and cost-effective solutions
- **Privacy by Design**: Minimal data collection, encryption, user control
- **Observability**: Instrument everything that matters

---

## 1. RECOMMENDED TECH STACK

### Frontend Stack

```typescript
// Core Framework
Next.js 15 (App Router) + TypeScript + React 19

// Styling & UI
Tailwind CSS 3.4 + shadcn/ui + Framer Motion

// State Management
Zustand (lightweight) + React Query (server state)

// Performance
React Suspense + Streaming + Web Workers

// PWA Features
next-pwa + Workbox (offline support)
```

### Backend Stack

```typescript
// API Layer
Next.js API Routes (Edge Runtime) + tRPC v11

// Validation
Zod (runtime validation) + TypeScript (compile-time)

// Authentication (if needed later)
NextAuth.js v5 + JWT (stateless)

// Rate Limiting
@upstash/ratelimit (edge-compatible)
```

### Data Layer

```typescript
// Primary Database (Free Tier)
PostgreSQL (Neon/Supabase free tier - 500MB)

// Caching Layer (Free Tier)
Redis (Upstash free tier - 10K requests/day)

// File Storage (Free Tier)
Vercel Blob Storage (1GB free)

// Search (Future)
Postgres Full-Text Search (built-in)
```

### Infrastructure (Free/Low-Cost)

```typescript
// Hosting
Vercel (Hobby plan - free for personal projects)

// CDN
Vercel Edge Network (included)

// Monitoring (Free Tiers)
Sentry (5K errors/month free)
PostHog (1M events/month free)
Vercel Analytics (included)

// External APIs
OpenAI (pay-per-use, ~$0.01/request)
Google Geocoding API (200 requests/day free)
```

---

## 2. SYSTEM CONTEXT DIAGRAM

The system context diagram shows the high-level architecture with edge-first design for optimal performance.

## 3. CONTAINER DIAGRAM

## 4. COMPONENT DIAGRAM

The component diagram shows the internal structure of key containers and their interactions.

## 5. SEQUENCE DIAGRAM - CRITICAL FLOWS

### Chat Prediction Flow

---

## 6. DOMAIN BOUNDARIES

### Core Domains

#### Identity Domain

```typescript
// Handles user identification and preferences
interface IdentityDomain {
	entities: ["User", "Session", "Preferences"];
	responsibilities: [
		"User authentication (future)",
		"Session management",
		"Preference storage",
		"Privacy controls"
	];
	boundaries: "No access to birth data or predictions";
}
```

#### Profile Domain

```typescript
// Manages birth data and chart calculations
interface ProfileDomain {
	entities: ["BirthData", "ChartCache", "ValidationResult"];
	responsibilities: [
		"Birth data validation",
		"Chart calculations",
		"Timezone resolution",
		"Data accuracy scoring"
	];
	boundaries: "No access to prediction content or user identity";
}
```

#### Content Domain

```typescript
// Handles prediction generation and templates
interface ContentDomain {
	entities: ["Prediction", "Template", "PersonalizationRule"];
	responsibilities: [
		"Prediction generation",
		"Content personalization",
		"Template management",
		"Confidence scoring"
	];
	boundaries: "No direct access to user identity";
}
```

#### Astrology Engine Domain

```typescript
// Core astrological calculations and interpretations
interface AstrologyEngineDomain {
	entities: ["Chart", "Planet", "House", "Yoga", "Dasha"];
	responsibilities: [
		"Planetary calculations",
		"Yoga detection",
		"Dasha periods",
		"Astrological interpretations"
	];
	boundaries: "Pure computational domain, no user data";
}
```

#### Recommendations Domain

```typescript
// Handles content delivery and personalization
interface RecommendationsDomain {
	entities: ["Recommendation", "FeedbackEvent", "UserSegment"];
	responsibilities: [
		"Content recommendation",
		"Feedback processing",
		"User segmentation",
		"A/B test management"
	];
	boundaries: "No access to raw birth data";
}
```

#### Analytics Domain

```typescript
// Tracks usage and performance metrics
interface AnalyticsDomain {
	entities: ["Event", "Metric", "Dashboard", "Alert"];
	responsibilities: [
		"Event tracking",
		"Performance monitoring",
		"User behavior analysis",
		"System health metrics"
	];
	boundaries: "Anonymized data only, no PII";
}
```

---

## 7. DATA SCHEMA DESIGN

### Core Tables

```sql
-- Users table (minimal PII)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT NOW(),
    last_active TIMESTAMP DEFAULT NOW(),
    preferences JSONB DEFAULT '{}',
    segment_id VARCHAR(50),

    -- Privacy controls
    data_retention_days INTEGER DEFAULT 365,
    analytics_consent BOOLEAN DEFAULT FALSE,

    -- Indexes
    INDEX idx_users_segment (segment_id),
    INDEX idx_users_last_active (last_active)
);

-- Birth data (encrypted sensitive info)
CREATE TABLE birth_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Core birth info (encrypted)
    birth_date DATE NOT NULL,
    birth_time TIME NOT NULL,
    birth_place VARCHAR(200) NOT NULL,

    -- Location data
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    timezone VARCHAR(50) NOT NULL,

    -- Accuracy metadata
    time_accuracy VARCHAR(20) DEFAULT 'approximate',
    time_confidence INTEGER DEFAULT 50, -- 0-100
    location_confidence INTEGER DEFAULT 80,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Indexes
    INDEX idx_birth_data_user (user_id),
    INDEX idx_birth_data_location (latitude, longitude)
);

-- Chart cache (computed astrological data)
CREATE TABLE chart_cache (
    birth_data_id UUID PRIMARY KEY REFERENCES birth_data(id) ON DELETE CASCADE,

    -- Computed chart data
    planetary_positions JSONB NOT NULL,
    house_positions JSONB NOT NULL,
    yogas TEXT[] DEFAULT '{}',
    current_dasha VARCHAR(50),

    -- Cache metadata
    calculated_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days'),
    calculation_version VARCHAR(10) DEFAULT '1.0',

    -- Indexes
    INDEX idx_chart_cache_expires (expires_at),
    INDEX idx_chart_cache_calculated (calculated_at)
);

-- Sessions (user interaction tracking)
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Session metadata
    session_type VARCHAR(50) DEFAULT 'chat',
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP,
    message_count INTEGER DEFAULT 0,

    -- Performance tracking
    total_response_time_ms INTEGER DEFAULT 0,
    cache_hit_rate DECIMAL(5,2) DEFAULT 0.0,

    -- Indexes
    INDEX idx_sessions_user (user_id),
    INDEX idx_sessions_started (started_at)
);

-- Messages (chat history)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,

    -- Message content
    role VARCHAR(20) NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    chart_data JSONB,

    -- Performance metadata
    response_time_ms INTEGER,
    confidence_score DECIMAL(5,2),
    cache_hit BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),

    -- Indexes
    INDEX idx_messages_session (session_id),
    INDEX idx_messages_created (created_at),
    INDEX idx_messages_role (role)
);

-- Predictions (generated content tracking)
CREATE TABLE predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    birth_data_id UUID REFERENCES birth_data(id) ON DELETE CASCADE,
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,

    -- Prediction metadata
    category VARCHAR(50) NOT NULL,
    template_id VARCHAR(100),
    confidence_level VARCHAR(20),

    -- Content
    content TEXT NOT NULL,
    basis JSONB, -- Astrological reasoning

    -- Performance tracking
    generation_time_ms INTEGER,
    openai_tokens_used INTEGER,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),

    -- Indexes
    INDEX idx_predictions_birth_data (birth_data_id),
    INDEX idx_predictions_category (category),
    INDEX idx_predictions_created (created_at)
);

-- Feedback events (user ratings and reactions)
CREATE TABLE feedback_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,

    -- Feedback data
    event_type VARCHAR(50) NOT NULL,
    rating INTEGER, -- 1-5 scale
    feedback_text TEXT,

    -- Behavioral data
    dwell_time_seconds INTEGER,
    explanation_clicked BOOLEAN DEFAULT FALSE,
    prediction_saved BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),

    -- Indexes
    INDEX idx_feedback_user (user_id),
    INDEX idx_feedback_message (message_id),
    INDEX idx_feedback_type (event_type)
);

-- Content templates (prediction templates)
CREATE TABLE content_templates (
    id VARCHAR(100) PRIMARY KEY,

    -- Template metadata
    category VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,

    -- Template content
    template TEXT NOT NULL,
    personalization_rules JSONB DEFAULT '{}',
    astrological_conditions JSONB DEFAULT '{}',

    -- Performance tracking
    usage_count INTEGER DEFAULT 0,
    effectiveness_score DECIMAL(5,2) DEFAULT 0.0,
    last_updated TIMESTAMP DEFAULT NOW(),

    -- A/B testing
    is_active BOOLEAN DEFAULT TRUE,
    test_variant VARCHAR(50),

    -- Indexes
    INDEX idx_templates_category (category),
    INDEX idx_templates_active (is_active),
    INDEX idx_templates_effectiveness (effectiveness_score)
);

-- User segments (for personalization)
CREATE TABLE segments (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,

    -- Segmentation criteria
    criteria JSONB NOT NULL,
    user_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Indexes
    INDEX idx_segments_user_count (user_count)
);
```

### Data Relationships

```typescript
interface DataRelationships {
	"1:1": ["users ↔ birth_data", "birth_data ↔ chart_cache"];
	"1:many": [
		"users → sessions",
		"sessions → messages",
		"birth_data → predictions",
		"messages → feedback_events"
	];
	"many:many": [
		"users ↔ segments (via segment_id)",
		"predictions ↔ templates (via template_id)"
	];
}
```

---

## 8. SECURITY & PRIVACY

### Data Encryption Strategy

```typescript
// Encryption at rest
interface EncryptionStrategy {
	database: {
		provider: "PostgreSQL TDE" | "Application-level AES-256";
		encrypted_fields: [
			"birth_data.birth_place",
			"birth_data.latitude",
			"birth_data.longitude",
			"messages.content" // if contains PII
		];
		key_management: "Vercel Environment Variables";
	};

	transit: {
		tls_version: "TLS 1.3";
		certificate_provider: "Vercel SSL";
		hsts_enabled: true;
	};
}

// Implementation
class DataEncryption {
	private static readonly algorithm = "aes-256-gcm";
	private static readonly key = process.env.ENCRYPTION_KEY;

	static encrypt(data: string): EncryptedData {
		const iv = crypto.randomBytes(16);
		const cipher = crypto.createCipher(this.algorithm, this.key);
		const encrypted = Buffer.concat([
			cipher.update(data, "utf8"),
			cipher.final(),
		]);
		const tag = cipher.getAuthTag();

		return {
			encrypted: encrypted.toString("hex"),
			iv: iv.toString("hex"),
			tag: tag.toString("hex"),
		};
	}

	static decrypt(encryptedData: EncryptedData): string {
		const decipher = crypto.createDecipher(this.algorithm, this.key);
		decipher.setAuthTag(Buffer.from(encryptedData.tag, "hex"));

		const decrypted = Buffer.concat([
			decipher.update(Buffer.from(encryptedData.encrypted, "hex")),
			decipher.final(),
		]);

		return decrypted.toString("utf8");
	}
}
```

### Privacy by Design

```typescript
interface PrivacyControls {
	data_minimization: {
		collect_only_necessary: boolean;
		automatic_deletion: {
			inactive_users: "365 days";
			session_data: "90 days";
			feedback_data: "2 years";
		};
	};

	user_control: {
		data_export: "JSON format with all user data";
		data_deletion: "Complete removal within 30 days";
		consent_management: "Granular permissions";
	};

	anonymization: {
		analytics_data: "Remove all PII before aggregation";
		research_data: "Hash user IDs, remove location data";
		public_sharing: "No personal data in shared content";
	};
}
```

### Consent Management

```typescript
interface ConsentFramework {
	consent_types: {
		essential: "Required for app functionality";
		analytics: "Usage tracking and improvement";
		personalization: "Content customization";
		marketing: "Future feature notifications";
	};

	consent_storage: {
		location: "Local storage + database backup";
		duration: "Until withdrawn or 2 years";
		granular_control: true;
	};

	compliance: {
		gdpr: "Full compliance for EU users";
		ccpa: "Compliance for California users";
		coppa: "No data collection from users under 13";
	};
}
```

### Data Retention Policy

```sql
-- Automated data retention
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
  -- Delete inactive users after 1 year
  DELETE FROM users
  WHERE last_active < NOW() - INTERVAL '365 days';

  -- Delete old sessions after 90 days
  DELETE FROM sessions
  WHERE started_at < NOW() - INTERVAL '90 days';

  -- Delete expired chart cache
  DELETE FROM chart_cache
  WHERE expires_at < NOW();

  -- Anonymize old feedback after 2 years
  UPDATE feedback_events
  SET user_id = NULL, feedback_text = '[ANONYMIZED]'
  WHERE created_at < NOW() - INTERVAL '2 years'
  AND user_id IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup job
SELECT cron.schedule('cleanup-old-data', '0 2 * * *', 'SELECT cleanup_old_data();');
```

---

## 9. OBSERVABILITY STRATEGY

### Logging Framework

```typescript
interface LoggingStrategy {
	levels: ["error", "warn", "info", "debug"];
	structured_logging: true;
	log_aggregation: "Vercel Functions logs + Sentry";

	log_categories: {
		performance: "Response times, cache hits, slow queries";
		errors: "Application errors, API failures, validation errors";
		security: "Authentication attempts, rate limit hits";
		business: "Predictions generated, user interactions, feedback";
	};
}

// Implementation
class Logger {
	static performance(event: string, duration: number, metadata?: object) {
		const logEntry = {
			level: "info",
			category: "performance",
			event,
			duration_ms: duration,
			timestamp: new Date().toISOString(),
			...metadata,
		};

		console.log(JSON.stringify(logEntry));

		// Send to PostHog for analysis
		if (typeof window !== "undefined") {
			posthog.capture("performance_metric", logEntry);
		}
	}

	static error(error: Error, context?: object) {
		const logEntry = {
			level: "error",
			category: "error",
			message: error.message,
			stack: error.stack,
			timestamp: new Date().toISOString(),
			...context,
		};

		console.error(JSON.stringify(logEntry));

		// Send to Sentry
		Sentry.captureException(error, { extra: context });
	}

	static business(event: string, data: object) {
		const logEntry = {
			level: "info",
			category: "business",
			event,
			timestamp: new Date().toISOString(),
			...data,
		};

		console.log(JSON.stringify(logEntry));

		// Send to PostHog
		if (typeof window !== "undefined") {
			posthog.capture(event, data);
		}
	}
}
```

### Metrics & Alerts

```typescript
interface MetricsFramework {
	core_metrics: {
		// Performance metrics
		response_time_p95: "API response time 95th percentile";
		cache_hit_rate: "Percentage of requests served from cache";
		error_rate: "Percentage of requests resulting in errors";

		// Business metrics
		prediction_accuracy: "User-reported accuracy of predictions";
		user_satisfaction: "Average rating of predictions";
		session_duration: "Average time spent in app";

		// System metrics
		memory_usage: "Function memory consumption";
		database_connection_pool: "Active DB connections";
		external_api_latency: "OpenAI/Geocoding API response times";
	};

	alerting: {
		error_rate_threshold: "> 5% over 5 minutes";
		response_time_threshold: "> 2s p95 over 5 minutes";
		user_satisfaction_threshold: "< 3.5 average over 24 hours";
	};
}

// Custom metrics collection
class MetricsCollector {
	static recordResponseTime(endpoint: string, duration: number) {
		const metric = {
			name: "api_response_time",
			value: duration,
			tags: { endpoint },
			timestamp: Date.now(),
		};

		this.sendToVercel(metric);
		this.sendToPostHog(metric);
	}

	static recordCacheHit(cache_key: string, hit: boolean) {
		const metric = {
			name: "cache_hit_rate",
			value: hit ? 1 : 0,
			tags: { cache_key },
			timestamp: Date.now(),
		};

		this.sendToVercel(metric);
	}

	static recordUserSatisfaction(rating: number, category: string) {
		const metric = {
			name: "user_satisfaction",
			value: rating,
			tags: { category },
			timestamp: Date.now(),
		};

		this.sendToPostHog(metric);
	}
}
```

### Distributed Tracing

```typescript
interface TracingStrategy {
	trace_propagation: "OpenTelemetry headers";
	trace_sampling: "10% of requests";
	trace_storage: "Vercel + Sentry performance monitoring";

	traced_operations: [
		"API request lifecycle",
		"Database queries",
		"External API calls",
		"Cache operations",
		"Chart calculations"
	];
}

// OpenTelemetry integration
import { trace, SpanStatusCode } from "@opentelemetry/api";

class TracingService {
	static async traceAsyncOperation<T>(
		operationName: string,
		operation: () => Promise<T>,
		attributes?: Record<string, string>
	): Promise<T> {
		const tracer = trace.getTracer("astrology-app");
		const span = tracer.startSpan(operationName, { attributes });

		try {
			const result = await operation();
			span.setStatus({ code: SpanStatusCode.OK });
			return result;
		} catch (error) {
			span.setStatus({
				code: SpanStatusCode.ERROR,
				message: error.message,
			});
			throw error;
		} finally {
			span.end();
		}
	}
}
```

---

## 10. SERVICE LEVEL OBJECTIVES (SLOs)

### Performance SLOs

```typescript
interface PerformanceSLOs {
	api_response_times: {
		cached_reads: {
			target: "p95 < 300ms";
			measurement_window: "7 days";
			error_budget: "1% of requests can exceed target";
		};

		ai_predictions: {
			target: "p95 < 1500ms";
			measurement_window: "7 days";
			error_budget: "5% of requests can exceed target";
		};

		chart_calculations: {
			target: "p95 < 800ms";
			measurement_window: "7 days";
			error_budget: "2% of requests can exceed target";
		};
	};

	frontend_performance: {
		core_web_vitals: {
			lcp: "p75 < 2.5s";
			inp: "p75 < 200ms";
			cls: "p75 < 0.1";
		};

		time_to_interactive: {
			target: "p75 < 3.0s";
			measurement_window: "30 days";
		};
	};
}
```

### Availability SLOs

```typescript
interface AvailabilitySLOs {
	uptime: {
		target: "99.5%"; // ~3.6 hours downtime per month
		measurement_window: "30 days";
		exclusions: ["planned maintenance"];
	};

	error_rate: {
		target: "< 1% of requests result in 5xx errors";
		measurement_window: "24 hours";
		alert_threshold: "> 0.5% over 5 minutes";
	};

	dependency_tolerance: {
		openai_failures: "Graceful degradation with cached responses";
		database_failures: "Read-only mode with cached data";
		redis_failures: "Direct database access (slower)";
	};
}
```

### Quality SLOs

```typescript
interface QualitySLOs {
	prediction_quality: {
		user_satisfaction: {
			target: "Average rating > 4.0/5";
			measurement_window: "30 days";
			minimum_sample_size: 100;
		};

		accuracy_confirmation: {
			target: "> 65% of past predictions confirmed accurate";
			measurement_window: "90 days";
			measurement_method: "User feedback on past predictions";
		};
	};

	data_quality: {
		birth_time_accuracy: {
			target: "> 95% of birth times validated correctly";
			measurement_window: "7 days";
			validation_method: "Timezone and format checks";
		};

		chart_calculation_consistency: {
			target: "< 0.1° variance between calculation runs";
			measurement_window: "24 hours";
			validation_method: "Automated consistency checks";
		};
	};
}
```

---

## 11. IMPLEMENTATION PRIORITIES

### Phase 1: Foundation (Weeks 1-2)

```typescript
interface Phase1Tasks {
	infrastructure: [
		"Set up Vercel deployment pipeline",
		"Configure PostgreSQL database (Neon)",
		"Set up Redis cache (Upstash)",
		"Implement basic monitoring (Sentry + PostHog)"
	];

	core_services: [
		"Refactor existing astrology engine",
		"Add comprehensive error handling",
		"Implement request/response validation",
		"Add basic caching layer"
	];

	performance: [
		"Add response streaming to chat API",
		"Implement loading skeletons",
		"Optimize bundle size and Core Web Vitals",
		"Add service worker for offline support"
	];
}
```

### Phase 2: Scale & Quality (Weeks 3-4)

```typescript
interface Phase2Tasks {
	data_layer: [
		"Implement full data schema",
		"Add data encryption for sensitive fields",
		"Set up automated backups",
		"Implement data retention policies"
	];

	observability: [
		"Set up comprehensive logging",
		"Implement custom metrics collection",
		"Configure alerting and dashboards",
		"Add distributed tracing"
	];

	quality: [
		"Add confidence scoring system",
		"Implement feedback collection",
		"Set up A/B testing framework",
		"Add prediction accuracy tracking"
	];
}
```

### Phase 3: Advanced Features (Weeks 5-8)

```typescript
interface Phase3Tasks {
	personalization: [
		"Implement user segmentation",
		"Add content template system",
		"Build recommendation engine",
		"Add behavioral tracking"
	];

	optimization: [
		"Implement advanced caching strategies",
		"Add machine learning for personalization",
		"Optimize database queries",
		"Add CDN optimization"
	];

	compliance: [
		"Implement privacy controls",
		"Add consent management",
		"Set up data export/deletion",
		"Add security audit logging"
	];
}
```

---

## 12. SUCCESS CRITERIA

### Technical Success Metrics

- **Performance**: p95 response times meet SLO targets
- **Reliability**: 99.5% uptime with error rate < 1%
- **Scalability**: Handle 10x traffic increase without degradation
- **Security**: Pass security audit with no critical vulnerabilities

### Business Success Metrics

- **User Satisfaction**: Average prediction rating > 4.0/5
- **Accuracy**: 65% of past predictions confirmed accurate by users
- **Engagement**: 45% Day-7 retention rate
- **Cost Efficiency**: Monthly infrastructure costs < $50 for 1K DAU

### Quality Success Metrics

- **Code Quality**: 90% test coverage, TypeScript strict mode
- **Observability**: 100% of critical paths instrumented
- **Documentation**: All APIs documented, architecture decisions recorded
- **Privacy**: Full GDPR compliance, user data export/deletion working

**Success looks like**: A fast, reliable, and trustworthy astrology app that users love to use and return to regularly, built on a foundation that can scale efficiently while maintaining quality and ethical standards.

<function_calls>
<invoke name="create_diagram">
<parameter name="content">graph TB
subgraph "Client Layer"
WEB[Web App]
PWA[PWA Features]
SW[Service Worker]
end

    subgraph "Edge Layer"
        EDGE[Vercel Edge Functions]
        CDN[Vercel CDN]
        CACHE[Edge Cache]
    end

    subgraph "Application Layer"
        API[Next.js API Routes]
        TRPC[tRPC Endpoints]
        MW[Middleware]
    end

    subgraph "Domain Services"
        ASTRO[Astrology Engine]
        CHART[Chart Calculator]
        PROMPT[Prompt Engine]
        VALID[Validation Service]
        CACHE_SVC[Cache Service]
    end

    subgraph "External Services"
        OPENAI[OpenAI API]
        GEO[Google Geocoding]
        EPHEMERIS[Swiss Ephemeris]
    end

    subgraph "Data Layer"
        REDIS[(Redis Cache)]
        POSTGRES[(PostgreSQL)]
        BLOB[Blob Storage]
    end

    subgraph "Observability"
        SENTRY[Sentry]
        POSTHOG[PostHog]
        VERCEL_ANALYTICS[Vercel Analytics]
    end

    WEB --> EDGE
    PWA --> SW
    SW --> CACHE

    EDGE --> API
    CDN --> CACHE

    API --> TRPC
    TRPC --> MW
    MW --> ASTRO
    MW --> CHART
    MW --> PROMPT
    MW --> VALID
    MW --> CACHE_SVC

    ASTRO --> OPENAI
    CHART --> EPHEMERIS
    VALID --> GEO
    CACHE_SVC --> REDIS

    API --> POSTGRES
    API --> BLOB

    API --> SENTRY
    WEB --> POSTHOG
    WEB --> VERCEL_ANALYTICS
