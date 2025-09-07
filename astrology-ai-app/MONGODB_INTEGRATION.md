# MongoDB Integration Guide

This document explains how the Astrology AI App now saves and manages birth details, chart data, and chat conversations in MongoDB.

## Overview

The application now provides comprehensive data persistence for:

- **User Sessions**: Track user interactions and preferences
- **Birth Charts**: Store calculated astrological charts with metadata
- **Chat Messages**: Persist all conversation history
- **Analytics**: Track user engagement and system performance

## Database Collections

### 1. Birth Charts (`birth_charts`)

Stores calculated astrological charts with input parameters and results.

**Key Fields:**

- `input`: Birth details (name, date, time, place)
- `chartData`: Raw astrology API response
- `inputHash`: SHA256 hash for duplicate detection
- `createdAt`, `updatedAt`: Timestamps
- `accessCount`: Number of times chart was accessed
- `userId`: Optional user identifier

### 2. Sessions (`sessions`)

Manages user sessions and their associated data.

**Key Fields:**

- `sessionId`: Unique session identifier
- `birthDetails`: User's birth information
- `chartIds`: Array of associated chart IDs
- `currentChartId`: Currently active chart
- `metadata`: Session preferences and type
- `isActive`: Session status

### 3. Messages (`messages`)

Stores all chat messages with metadata.

**Key Fields:**

- `sessionId`: Associated session
- `content`: Message text
- `role`: "user" or "assistant"
- `timestamp`: When message was sent
- `metadata`: Additional context (chart data, message type)

### 4. Analytics (`analytics`)

Tracks user interactions and system performance.

**Key Fields:**

- `eventType`: Type of event (chart_calculation, chat_message, etc.)
- `sessionId`: Associated session
- `timestamp`: When event occurred
- `metadata`: Event-specific data

## API Endpoints

### MongoDB User API (`/api/mongodb/user`)

- `POST /api/mongodb/user` - Save/retrieve user charts
- `GET /api/mongodb/user?userId={id}` - Get user's charts
- `GET /api/mongodb/user?chartId={id}` - Get specific chart

**Actions:**

- `saveBirthChart` - Save new birth chart
- `getUserCharts` - Retrieve user's chart history
- `updateChart` - Modify existing chart
- `deleteChart` - Remove chart

### MongoDB Message API (`/api/mongodb/message`)

- `POST /api/mongodb/message` - Save/retrieve messages
- `GET /api/mongodb/message?sessionId={id}` - Get session messages

**Actions:**

- `saveMessage` - Save single message
- `saveMessages` - Save multiple messages
- `getSessionMessages` - Retrieve conversation history
- `deleteMessage` - Remove message

### MongoDB Session API (`/api/mongodb/session`)

- `POST /api/mongodb/session` - Manage sessions
- `GET /api/mongodb/session?sessionId={id}` - Get session info

**Actions:**

- `create` - Start new session
- `updateBirthDetails` - Update birth information
- `addChart` - Associate chart with session
- `setCurrentChart` - Set active chart
- `updateMetadata` - Modify session preferences
- `close` - End session

### MongoDB Analytics API (`/api/mongodb/analytics`)

- `POST /api/mongodb/analytics` - Track events
- `GET /api/mongodb/analytics?action={type}` - Get statistics

**Actions:**

- `trackEvent` - Log general event
- `trackChartCalculation` - Log chart generation
- `trackChatMessage` - Log message exchange
- `trackSession` - Log session lifecycle

**Statistics:**

- `dashboard` - Overview metrics
- `chartUsage` - Chart generation stats
- `userEngagement` - User interaction data
- `errorAnalysis` - Error tracking

## Data Service

The `DataService` class provides high-level methods for common operations:

### Save Complete Session

```typescript
const result = await DataService.saveCompleteSession({
	sessionId: "unique_session_id",
	userId: "optional_user_id",
	birthDetails: birthChartInput,
	chartData: astrologyApiResponse,
	initialMessages: welcomeMessages,
});
```

### Save Chat Message

```typescript
const result = await DataService.saveChatMessage({
	sessionId: "session_id",
	userId: "user_id",
	content: "Hello!",
	role: "user",
	metadata: { messageType: "text" },
});
```

### Get Session Data

```typescript
const result = await DataService.getSessionData("session_id");
// Returns: { session, messages, charts }
```

## Frontend Integration

### Saving Messages

The main page now automatically saves all chat messages:

```typescript
// User message
await fetch("/api/mongodb/message", {
	method: "POST",
	body: JSON.stringify({
		action: "saveMessage",
		data: {
			sessionId: sessionId,
			content: message,
			role: "user",
			metadata: { messageType: "text" },
		},
	}),
});

// Bot response
await fetch("/api/mongodb/message", {
	method: "POST",
	body: JSON.stringify({
		action: "saveMessage",
		data: {
			sessionId: sessionId,
			content: botResponse.text,
			role: "assistant",
			metadata: { messageType: "text", chartData: botResponse.chartData },
		},
	}),
});
```

### Session Management

Sessions are created and updated when users submit birth details:

```typescript
// Create session
await fetch("/api/mongodb/session", {
	method: "POST",
	body: JSON.stringify({
		action: "create",
		data: { sessionId: newSessionId, metadata: { sessionType: "new_user" } },
	}),
});

// Update with birth details
await fetch("/api/mongodb/session", {
	method: "POST",
	body: JSON.stringify({
		action: "updateBirthDetails",
		data: { sessionId: newSessionId, birthDetails: formattedDetails },
	}),
});
```

## Data Cleanup

The system automatically cleans up old data:

- **Charts**: Removed after 90 days if rarely accessed
- **Sessions**: Removed after 7 days if inactive
- **Messages**: Removed after 30 days
- **Analytics**: Removed after 90 days

## Environment Variables

Ensure these are set in your `.env.local`:

```bash
MONGODB_URI=mongodb://localhost:27017/astrology-app
# or
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/astrology-app
```

## Benefits

1. **Persistent Conversations**: Users can return to previous chats
2. **Chart History**: Access to previously calculated charts
3. **User Analytics**: Track engagement and improve user experience
4. **Data Recovery**: Backup and restore capabilities
5. **Performance Insights**: Monitor system performance and errors

## Security Considerations

- Birth details are stored but can be anonymized
- Session data is cleaned up automatically
- User IDs are optional for guest users
- Sensitive data is not exposed in API responses

## Monitoring

Use the analytics endpoints to monitor:

- Daily active users
- Chart calculation success rates
- Popular birth details patterns
- Error frequency and types
- User engagement metrics

## Future Enhancements

- User authentication and profiles
- Chart sharing between users
- Advanced analytics dashboard
- Data export capabilities
- GDPR compliance features

