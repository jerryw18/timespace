# Time Space Backend

FastAPI backend service for the Time Space interactive history map application.

## Features

- **Agentic Research System**: Live Wikipedia content fetching and OpenAI-powered event extraction
- **RESTful API**: Clean endpoints for location-based historical events
- **Stateless Design**: No database required, all data fetched live
- **Interactive Documentation**: Auto-generated OpenAPI docs at `/docs`

## Architecture

The backend implements an "agentic workflow":
1. **Fetch** → Wikipedia API queries for location-based content
2. **Rank** → OpenAI extracts and ranks significant historical events  
3. **Return** → JSON formatted timeline data

## Setup

### Environment Variables

Create a `.env` file in the project root:

```bash
OPENAI_API_KEY=your-openai-api-key-here
```

### Local Development

```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Docker Development

```bash
# From project root
docker compose up --build backend
```

## API Endpoints

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/locations/{location}/events` | List key events for a location |
| `GET` | `/locations/{location}/events/drilldown` | Drill down into specific event |
| `POST` | `/query` | Legacy endpoint (redirects to events) |

### Utility Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API information |
| `GET` | `/health` | Health check |
| `GET` | `/docs` | Interactive API documentation |

## Usage Examples

### List Events for a Location

```bash
curl "http://localhost:8000/locations/London/events?limit=5"
```

Response:
```json
{
  "location": { "name": "London" },
  "events": [
    {
      "id": "london_0_1666",
      "date": "1666",
      "title": "Great Fire of London",
      "description": "Devastating fire that destroyed medieval City of London within the old Roman walls.",
      "category": "natural",
      "coordinates": { "lat": 51.5074, "lng": -0.1278 }
    }
  ]
}
```

### Drill Down into an Event

```bash
curl --get "http://localhost:8000/locations/London/events/drilldown" \
  --data-urlencode "date=1666-09-02" \
  --data-urlencode "title=Great Fire of London" \
  --data-urlencode "limit=3"
```

### Legacy Query Endpoint

```bash
curl -X POST "http://localhost:8000/query" \
  -H "Content-Type: application/json" \
  -d '{"location": "Las Vegas"}'
```

## Response Schema

All endpoints return `EventsResponse` format:

```typescript
{
  location: { name: string }
  events: Array<{
    id: string
    date: string           // YYYY or YYYY-MM-DD
    title: string          // Max 50 chars
    description: string    // Max 150 chars  
    category?: string      // political|economic|cultural|military|natural
    coordinates?: { lat: number, lng: number }
  }>
}
```

## Development Notes

### Agentic System Components

- **Wikipedia Integration**: Searches and fetches content from multiple pages
- **OpenAI Processing**: Extracts, ranks, and formats historical events
- **Coordinate Enhancement**: Maps locations to geographic coordinates
- **Error Handling**: Graceful fallbacks for API failures

### Supported Locations

The system works best with well-documented locations. Built-in coordinate mapping for:
- Las Vegas, London, Paris, New York, Berlin, Tokyo, Rome

### Rate Limits

- **Wikipedia**: No authentication required, reasonable rate limits
- **OpenAI**: Requires API key, subject to your OpenAI usage limits

## Testing

```bash
# Run basic health check
curl http://localhost:8000/health

# Test with known location
curl "http://localhost:8000/locations/Rome/events?limit=3"
```

## Error Handling

| Status Code | Description |
|-------------|-------------|
| `200` | Success |
| `404` | Unknown location |
| `422` | Invalid parameters |
| `500` | Internal server error |

## Contributing

1. Follow FastAPI best practices
2. Add proper error handling
3. Update this README for new features
4. Test with multiple locations

## License

MIT License - see project root for details. 