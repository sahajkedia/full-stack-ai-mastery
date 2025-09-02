# Astrology AI App Setup Guide

## Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```env
# OpenAI API Key for AI chat functionality
OPENAI_API_KEY=your_openai_api_key_here

# MongoDB Connection URI
# For local development, use: mongodb://localhost:27017
# For MongoDB Atlas, use: mongodb+srv://username:password@cluster.mongodb.net/database
MONGODB_URI=mongodb://localhost:27017

# Next.js Configuration
NODE_ENV=development
```

## MongoDB Setup

### Option 1: Local MongoDB

1. Install MongoDB locally on your system
2. Start MongoDB service
3. Use `MONGODB_URI=mongodb://localhost:27017` in your `.env.local`

### Option 2: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create a database user with read/write permissions
4. Get your connection string and replace `<username>`, `<password>`, and `<cluster>` with your values
5. Use the connection string as your `MONGODB_URI`

## API Integration

The astrology API is already configured with the provided API key:

- **API**: https://json.freeastrologyapi.com/planets
- **Key**: KgTnXKOIkQaPfz0X2bIg2aeO8feo8QDM7zXeKG5Y
- **Limit**: 50 calls per day

## Features Implemented

### 1. OpenMap API Integration

- Location search with autocomplete dropdown
- Current location detection
- Coordinate extraction for astrology calculations

### 2. MongoDB Caching System

- Automatic chart data caching to reduce API calls
- Duplicate detection using input hash
- Access tracking and statistics
- Automatic cleanup of old, rarely accessed charts

### 3. Astrology API Integration

- Birth chart calculation with Lahiri Ayanamsha
- Topocentric observation point
- Automatic timezone detection based on coordinates
- Input validation and error handling

### 4. Database Collections

#### `birth_charts`

Stores calculated birth chart data with the following structure:

- `input`: Birth details (name, date, time, location)
- `chartData`: Complete astrology API response
- `inputHash`: SHA256 hash for duplicate detection
- `createdAt`, `updatedAt`: Timestamps
- `accessCount`, `lastAccessedAt`: Usage tracking

## API Endpoints

### `POST /api/chart/calculate`

Calculate a new birth chart or retrieve cached data.

**Request Body:**

```json
{
	"name": "John Doe",
	"gender": "male",
	"day": "5",
	"month": "12",
	"year": "2000",
	"hours": "6",
	"minutes": "24",
	"seconds": "0",
	"placeOfBirth": "Patna, Bihar, India",
	"latitude": 25.7771,
	"longitude": 87.4753,
	"timezone": 5.5
}
```

### `GET /api/chart/calculate?id={chartId}`

Retrieve a specific chart by ID.

### `GET /api/chart/calculate?limit={number}`

Get recent charts (default limit: 10).

### `GET /api/chart/stats`

Get caching statistics and API usage metrics.

## Usage

1. Install dependencies: `npm install`
2. Set up environment variables in `.env.local`
3. Start the development server: `npm run dev`
4. Open http://localhost:3000 in your browser
5. Fill in the birth details form with location search
6. Generate birth chart (will be cached for future use)

## Caching Benefits

- **API Call Reduction**: Identical birth details will use cached data
- **Performance**: Instant loading for previously calculated charts
- **Cost Efficiency**: Maximizes the 50 daily API call limit
- **Statistics**: Track cache efficiency and most accessed charts

## Data Validation

The system validates:

- Required fields (name, birth details, location)
- Date ranges (1900-present, no future dates)
- Time format (0-23 hours, 0-59 minutes/seconds)
- Coordinate ranges (latitude: -90 to 90, longitude: -180 to 180)
- Location name presence
