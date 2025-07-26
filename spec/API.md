# Timeline API – Clean Spec

## 1 · List Key Events

### Endpoint

```http
GET /locations/{location}/events
````

### **Parameters**

| **Name** | **In** | **Type** | **Required** | **Notes**                            |
| -------- | ------ | -------- | ------------ | ------------------------------------ |
| location | path   | string   | ✓            | URL slug or plain name (RFC 3986 §2) |
| limit    | query  | integer  |              | 1 – 20 · Default = 5                 |

### **Purpose**

Return up to **N** top-level key events for the specified location (fills the five timeline dots).

---

## **2 · Drill-Down Into an Event**

### **Endpoint**

```
GET /locations/{location}/events/drilldown
```

### **Parameters**

| **Name** | **In** | **Type** | **Required** | **Notes**                                                                       |
| -------- | ------ | -------- | ------------ | ------------------------------------------------------------------------------- |
| location     | path   | string   | ✓            | URL slug or plain name (RFC 3986 §2)                                            |
| date     | query  | string   | ✓            | YYYY **or** YYYY-MM-DD (ISO-8601)                                               |
| title    | query  | string   | ✓            | Parent-event title (URL-encoded) — keeps the endpoint idempotent & bookmarkable |
| limit    | query  | integer  |              | 1 – 20 · Default = 5                                                            |

### **Purpose**

Return up to **N** sub-events that break down the specified parent event (shown in a deep-dive drawer when a timeline dot is clicked).

---

## **3 · Response Schema**

Both endpoints return the same JSON structure:

```
{
  "location": { "name": "Las Vegas" },
  "events": [
    {
      "date": "1931",
      "title": "Gambling Legalized",
      "description": "Nevada legalizes gambling, starting the casino boom.",
      "category": "economic",
      "coordinates": { "lat": 36.17, "lng": -115.14 }
    }
    /* … up to N items … */
  ]
}
```

**Errors**

| **Code** | **Meaning**                  |
| -------- | ---------------------------- |
| 404      | Unknown location or event        |
| 422      | Invalid date or title syntax |



## **OpenAPI Snippet**

```
paths:
  /locations/{location}/events:
    get:
      summary: List key events for a location
      parameters:
        - { name: location,  in: path,  required: true, schema: { type: string } }
        - { name: limit, in: query,               schema: { type: integer, default: 5, minimum: 1, maximum: 20 } }
      responses:
        '200': { $ref: '#/components/responses/EventsOk' }

  /locations/{location}/events/drilldown:
    get:
      summary: Break down a specific parent event
      parameters:
        - { name: location,  in: path,  required: true, schema: { type: string } }
        - { name: date,  in: query, required: true, schema: { type: string, pattern: '^\\d{4}(-\\d{2}-\\d{2})?$' } }
        - { name: title, in: query, required: true, schema: { type: string } }
        - { name: limit, in: query,               schema: { type: integer, default: 5, minimum: 1, maximum: 20 } }
      responses:
        '200': { $ref: '#/components/responses/EventsOk' }

components:
  responses:
    EventsOk:
      description: List of events
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/EventsResponse'
```

---

## **6 · FastAPI Sketch**

```
from fastapi import FastAPI, Query, Path
from pydantic import BaseModel

app = FastAPI()

class Event(BaseModel):
    id: str
    date: str
    title: str
    description: str
    category: str | None = None
    coordinates: dict | None = None

class EventsResponse(BaseModel):
    location: dict
    events: list[Event]

@app.get("/locations/{location}/events", response_model=EventsResponse)
async def list_events(
    location: str = Path(...),
    limit: int = Query(5, ge=1, le=20)
):
    # TODO: live Wikipedia + GPT search
    return build_response(location, limit)

@app.get("/locations/{location}/events/drilldown", response_model=EventsResponse)
async def drill_down(
    location: str = Path(...),
    date: str = Query(..., regex=r"^\d{4}(-\d{2}-\d{2})?$"),
    title: str = Query(...),
    limit: int = Query(5, ge=1, le=20)
):
    # TODO: re-query Wikipedia with date & title context
    return build_drilldown(location, date, title, limit)
```

FastAPI auto-generates interactive docs at /docs.

## **7 · Testing**

### List events

```
curl 'http://localhost:8000/locations/London/events?limit=5'
````

### Drill-down: “Great Fire of London”

```
curl --get 'http://localhost:8000/locations/London/events/drilldown' \
  --data-urlencode 'date=1666-09-02' \
  --data-urlencode 'title=Great Fire of London' \
  --data-urlencode 'limit=5'
```

_Stateless, REST-ful, and OpenAPI-compliant._

