# Free Astrology API - Complete Documentation Summary

## Base Information

- Base URL: `https://json.freeastrologyapi.com/`
- Authentication: API Key required in header
- Method: POST for all endpoints
- Content-Type: `application/json`

### Authentication Header Format:

```json
{
	"Content-Type": "application/json",
	"x-api-key": "YOUR_API_KEY_HERE"
}
```

## Standard Request Parameters

Most APIs use these common parameters:

```json
{
	"year": 2023, // Integer: Birth year
	"month": 7, // Integer: Birth month (1-12)
	"date": 15, // Integer: Birth day
	"hours": 14, // Integer: Birth hour (0-23)
	"minutes": 30, // Integer: Birth minute (0-59)
	"seconds": 0, // Integer: Birth second (0-59)
	"latitude": 28.6139, // Float: Latitude (-90 to 90)
	"longitude": 77.209, // Float: Longitude (-180 to 180)
	"timezone": 5.5, // Float: Timezone offset
	"observation_point": "topocentric", // String: "topocentric" or "geocentric"
	"language": "en" // String: "en" or "te"
}
```

---

## 1. PRIMITIVE DATA APIs

### 1.1 Planets

- Endpoint: `planets`
- Description: Basic planetary positions
- Request: Standard parameters
- Response: Basic planetary data with positions

### 1.2 Planets Extended

- Endpoint: `planets-extended`
- Description: Detailed planetary data including speed, retrograde status
- Request: Standard parameters
- Response: Extended planetary information with additional details

---

## 2. DIVISIONAL CHART INFO APIs

### Chart Information Endpoints:

- `navamsa-chart-info` (D9) - Marriage, spirituality, inner potential
- `d2-chart-info` (Hora) - Wealth and prosperity
- `d3-chart-info` (Drekkana) - Siblings and courage
- `d4-chart-info` (Chaturthamsa) - Property and fortune
- `d5-chart-info` (Panchamasa) - Fame and intelligence
- `d6-chart-info` (Shasthamsa) - Health and enemies
- `d7-chart-info` (Saptamsa) - Children and creativity
- `d8-chart-info` (Ashtamsa) - Longevity and obstacles
- `d10-chart-info` (Dasamsa) - Career and profession
- `d11-chart-info` (Rudramsa) - Gains and income
- `d12-chart-info` (Dwadasamsa) - Parents and ancestry
- `d16-chart-info` (Shodasamsa) - Vehicles and comforts
- `d20-chart-info` (Vimsamsa) - Spirituality and worship
- `d24-chart-info` (Siddhamsa) - Learning and knowledge
- `d27-chart-info` (Nakshatramsa) - Strength and vitality
- `d30-chart-info` (Trimsamsa) - Misfortunes and difficulties
- `d40-chart-info` (Khavedamsa) - Spiritual development
- `d45-chart-info` (Akshavedamsa) - General character
- `d60-chart-info` (Shashtyamsa) - Overall karma and destiny

Request: Standard parameters
Response: Chart-specific planetary positions and house information

---

## 3. DIVISIONAL CHART SVG APIs

### 3.1 SVG Code Generation

Generate SVG code directly for charts:

- `horoscope-chart-svg-code` (Rasi Chart)
- `navamsa-chart-svg-code` (D9)
- `d2-chart-svg-code` through `d60-chart-svg-code`

Request: Standard parameters
Response: SVG code as string

### 3.2 SVG URL Generation

Get URLs for SVG chart images:

- `rasi-chart-url`
- `navamsa-chart-url` (D9)
- `d2-chart-url` through `d60-chart-url`

Request: Standard parameters
Response: URL string to SVG image

---

## 4. PANCHANG APIs

### 4.1 Complete Panchang

- Endpoint: `panchang`
- Description: Comprehensive daily astrological data
- Request: Standard parameters
- Response: Complete panchang information including all timing details

### 4.2 Individual Panchang Components:

- `sun-rise-set` - Sunrise and sunset times
- `tithi-timings` - Lunar day timings
- `nakshatra-durations` - Lunar mansion durations
- `yoga-timings` - Auspicious period calculations
- `karana-timings` - Half-day period timings
- `vedic-weekday` - Vedic day of week
- `lunar-month-info` - Lunar month details
- `ritu-information` - Seasonal information
- `samvat-information` - Hindu calendar year details
- `aayanam` - Precession calculations
- `hora-timings` - Planetary hour timings
- `choghadiya-timings` - Auspicious/inauspicious periods

### 4.3 Muhurat Timings:

- `abhijit-muhurat` - Most auspicious time
- `amrit-kaal` - Nectar periods
- `brahma-muhurat` - Pre-dawn auspicious time
- `rahu-kalam` - Inauspicious Rahu periods
- `yama-gandam` - Inauspicious Yama periods
- `gulika-kalam` - Gulika ruled periods
- `dur-muhurat` - Inauspicious periods
- `varjyam` - Periods to avoid
- `good-bad-times` - Combined favorable/unfavorable periods

---

## 5. MATCH MAKING API

### 5.1 Ashtakoot Score

- Endpoint: `ashtakoot-score`
- Description: Compatibility analysis based on 8 factors
- Request:

```json
{
	"boy_details": {
		// Standard birth parameters for male
	},
	"girl_details": {
		// Standard birth parameters for female
	}
}
```

- Response: Compatibility scores and detailed analysis

---

## 6. SHAD BALA APIs (Planetary Strength)

### 6.1 Complete Shad Bala

- Endpoint: `shad-bala`
- Description: Complete planetary strength analysis
- Request: Standard parameters
- Response: All strength calculations combined

### 6.2 Individual Strength Components:

- `shad-bala-summary` - Overview of planetary strengths
- `shad-bala-breakdown` - Detailed component breakdown
- `sthana-bala` - Positional strength
- `kaala-bala` - Temporal strength
- `dig-bala` - Directional strength
- `cheshta-bala` - Motional strength
- `drig-bala` - Aspectual strength
- `naisargika-bala` - Natural strength

---

## 7. VIMSOTTARI DASA APIs

### 7.1 Dasa Period Calculations:

- `vimsottari-maha-dasa` - Major planetary periods
- `vimsottari-maha-antar-dasa` - Major and sub-periods
- `dasa-for-date` - Dasa information for specific date

Request: Standard parameters (plus specific date for date-based query)
Response: Dasa periods with start/end dates and ruling planets

---

## 8. ASHTAKA VARGA API

- Status: Coming Soon
- Description: Ashtaka Varga calculations for predictive analysis

---

## API Usage Examples

### Example 1: Get Planetary Positions

```javascript
const response = await fetch("https://json.freeastrologyapi.com/planets", {
	method: "POST",
	headers: {
		"Content-Type": "application/json",
		"x-api-key": "YOUR_API_KEY_HERE",
	},
	body: JSON.stringify({
		year: 1990,
		month: 5,
		date: 15,
		hours: 10,
		minutes: 30,
		seconds: 0,
		latitude: 28.6139,
		longitude: 77.209,
		timezone: 5.5,
		observation_point: "topocentric",
		language: "en",
	}),
});
```

### Example 2: Get Navamsa Chart URL

```javascript
const response = await fetch(
	"https://json.freeastrologyapi.com/navamsa-chart-url",
	{
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-api-key": "YOUR_API_KEY_HERE",
		},
		body: JSON.stringify({
			year: 1990,
			month: 5,
			date: 15,
			hours: 10,
			minutes: 30,
			seconds: 0,
			latitude: 28.6139,
			longitude: 77.209,
			timezone: 5.5,
			observation_point: "topocentric",
			language: "en",
		}),
	}
);
```

### Example 3: Get Complete Panchang

```javascript
const response = await fetch("https://json.freeastrologyapi.com/panchang", {
	method: "POST",
	headers: {
		"Content-Type": "application/json",
		"x-api-key": "YOUR_API_KEY_HERE",
	},
	body: JSON.stringify({
		year: 2023,
		month: 7,
		date: 15,
		hours: 12,
		minutes: 0,
		seconds: 0,
		latitude: 28.6139,
		longitude: 77.209,
		timezone: 5.5,
		observation_point: "topocentric",
		language: "en",
	}),
});
```

---

## API Usage Notes

### Getting Started:

1. Sign Up: Get free API key at [freeastrologyapi.com/signup](https://freeastrologyapi.com/signup)
2. Documentation: Full reference at [freeastrologyapi.com/api-reference](https://freeastrologyapi.com/api-reference)
3. Postman Collection: Available for testing and integration

### Rate Limits:

- Free tier available with usage limits
- Paid plans for higher volume usage
- Check pricing at [freeastrologyapi.com/pricing](https://freeastrologyapi.com/pricing)

### Support:

- Contact: raju@freeastrologyapi.com
- Documentation: Comprehensive guides and examples available
- Community: WhatsApp and Telegram channels for updates

### Response Format:

All APIs return JSON responses with structured data appropriate to the specific calculation or chart requested. Error responses include appropriate HTTP status codes and error messages.

### Common Response Structure:

Most APIs return responses in this general format:

```json
{
	"success": true,
	"data": {
		// API-specific data structure
	},
	"message": "Success"
}
```

### Error Response Format:

```json
{
	"success": false,
	"error": {
		"code": "ERROR_CODE",
		"message": "Error description"
	}
}
```

---

## Integration Tips

### 1. Parameter Validation

Always validate birth details before making API calls:

- Year: Valid 4-digit year
- Month: 1-12
- Date: Valid day for the month
- Hours: 0-23
- Minutes/Seconds: 0-59
- Latitude: -90 to 90
- Longitude: -180 to 180

### 2. Error Handling

Implement proper error handling for:

- Network errors
- API key validation errors
- Invalid parameter errors
- Rate limit exceeded errors

### 3. Caching

Consider caching responses for:

- Chart calculations (rarely change for same birth details)
- Panchang data (daily data can be cached for the day)
- Planetary positions (can be cached for reasonable time periods)

### 4. Performance Optimization

- Use appropriate endpoints (basic vs extended planetary data)
- Batch requests when possible
- Implement request queuing for rate limit management

This API provides a complete toolkit for building Vedic astrology applications with accurate calculations, visual charts, and comprehensive astrological data analysis.

---

## Reference Links

- API Documentation: [https://freeastrologyapi.com/api-docs/indian-vedic-astrology-api-docs](https://freeastrologyapi.com/api-docs/indian-vedic-astrology-api-docs)
- API Reference: [https://freeastrologyapi.com/api-reference](https://freeastrologyapi.com/api-reference)
- Sign Up: [https://freeastrologyapi.com/signup](https://freeastrologyapi.com/signup)
- Pricing: [https://freeastrologyapi.com/pricing](https://freeastrologyapi.com/pricing)
