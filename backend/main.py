import os
import json
import asyncio
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, Query, Path, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import wikipedia
import openai
from datetime import datetime
import re
import logging
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables from .env file (optional)
try:
    load_dotenv()
except Exception as e:
    logger.warning(f"Could not load .env file: {e}")
    # Set API key directly if .env fails
    if not os.getenv("OPENAI_API_KEY"):
        logger.warning("No OPENAI_API_KEY found in environment variables!")

# Initialize FastAPI app
app = FastAPI(
    title="Time Space API",
    description="Interactive History Map API - Discover pivotal events through time",
    version="1.0.0"
)

# Add CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client
from openai import OpenAI

# OpenAI client setup using environment variable
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    logger.warning("⚠️  No OPENAI_API_KEY found! Set environment variable or create .env file")
    logger.warning("🔑 Example: $env:OPENAI_API_KEY='your-api-key-here'")
    client = None
else:
    client = OpenAI(api_key=api_key)
    logger.info("✅ OpenAI client initialized successfully")

# Global dictionary to store previous knowledge
knowledge_dict = {}

# Pydantic Models
class Coordinates(BaseModel):
    lat: float
    lng: float

class Event(BaseModel):
    id: str
    date: str
    title: str
    description: str
    category: Optional[str] = None
    coordinates: Optional[Coordinates] = None

class Location(BaseModel):
    name: str

class EventsResponse(BaseModel):
    location: Location
    events: List[Event]

class QueryRequest(BaseModel):
    location: str

# OpenAI Integration Functions
def test_location(location: str) -> str:
    """Get historical events for a location using OpenAI"""
    if not client:
        logger.warning("🔒 OpenAI client not available - using mock response")
        return get_mock_response(location)
    
    try:
        context = []
        sys_prompt = f"""You are a fabulous historian. Given a location name from the user, return the 5 most significant dates and descriptions of what occurred on those dates in the following json format:
        {{"location": {{ "name": "{location}" }},
         "events": [
            {{
                "date": "1931",
                "title": "Gambling Legalized",
                "description": "Nevada legalizes gambling, starting the casino boom.",
                "category": "economic"
            }}
         ]
        }}
        Only return valid JSON, no additional text."""
        
        context.append({'role':'system', 'content': sys_prompt})
        context.append({'role':'user', 'content': location})

        response = client.chat.completions.create(
            messages=context,
            model="gpt-4o",  # Updated to use gpt-4o instead of gpt-4.1
            temperature=0.5,
            max_tokens=800,  # Increased for more events
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0,
            n=1
        )
        
        llm_response = response.choices[0].message.content
        logger.info(f"LLM Response for {location}: {llm_response}")
        
        # Store in knowledge dictionary
        knowledge_dict[location] = llm_response
        return llm_response
        
    except Exception as e:
        logger.error(f"Error in test_location for {location}: {str(e)}")
        return None

def test_event(location: str, date: str) -> str:
    """Get detailed information about a specific event"""
    if not client:
        logger.warning("🔒 OpenAI client not available - using mock response")
        return get_mock_drilldown_response(location, date)
    
    try:
        context = []
        prev_knowledge = knowledge_dict.get(location, "No previous information available")
        print(prev_knowledge)
        sys_prompt = f"""You are a fabulous historian. Given a location "{location}" and a specific date "{date}", provide detailed information about historical events that occurred in {location} around {date}. 

        Return the response in this EXACT JSON format:
        {{"location": {{ "name": "{location}" }},
         "events": [
            {{
                "date": "{date}",
                "title": "Specific Event Title",
                "description": "Detailed description of what happened in {location} around {date}.",
                "category": "political"
            }},
            {{
                "date": "{date}",
                "title": "Another Event Title", 
                "description": "Another event that happened in {location} around {date}.",
                "category": "economic"
            }}
         ]
        }}

        Focus on events that actually happened in {location} around the year {date}. If you don't know specific events for that exact year, provide events from nearby years in {location}.
        
        Previous context: {prev_knowledge}
        
        IMPORTANT: Only return valid JSON in the exact format above, no additional text or explanations."""
        
        context.append({'role':'system', 'content': sys_prompt})
        context.append({'role':'user', 'content': date})

        response = client.chat.completions.create(
            messages=context,
            model="gpt-4o",
            temperature=0.5,
            max_tokens=400,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0,
            n=1
        )
        
        llm_response = response.choices[0].message.content
        logger.info(f"🤖 LLM Event Response for {location} on {date}: {llm_response}")
        logger.info(f"📏 Response length: {len(llm_response)} characters")
        return llm_response
        
    except Exception as e:
        logger.error(f"Error in test_event for {location} on {date}: {str(e)}")
        return None
        # Helper function to parse OpenAI response and convert to events
def parse_openai_response(response_text: str, location: str) -> List[Dict[str, Any]]:
    """Parse OpenAI JSON response and convert to event format"""
    logger.info(f"🔍 Raw OpenAI response to parse: {response_text[:500]}...")
    
    try:
        # Clean up response text (remove potential markdown formatting)
        response_text = response_text.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        
        logger.info(f"🧹 Cleaned response text: {response_text[:200]}...")
        
        response_data = json.loads(response_text)
        logger.info(f"📊 Parsed JSON data: {response_data}")
        
        # Simple coordinate mapping for common cities
        location_coords = {
            "las vegas": {"lat": 36.1699, "lng": -115.1398},
            "london": {"lat": 51.5074, "lng": -0.1278},
            "paris": {"lat": 48.8566, "lng": 2.3522},
            "new york": {"lat": 40.7128, "lng": -74.0060},
            "berlin": {"lat": 52.5200, "lng": 13.4050},
            "tokyo": {"lat": 35.6762, "lng": 139.6503},
            "rome": {"lat": 41.9028, "lng": 12.4964},
            "milan": {"lat": 45.4642, "lng": 9.1900},
        }
        
        default_coords = location_coords.get(location.lower())
        events = response_data.get("events", [])
        logger.info(f"📋 Found {len(events)} events in response")
        
        enhanced_events = []
        
        for i, event in enumerate(events):
            enhanced_event = {
                "id": f"{location.lower().replace(' ', '_')}_{i}_{event.get('date', 'unknown')}",
                "date": event.get("date", "Unknown"),
                "title": event.get("title", "Historical Event"),
                "description": event.get("description", "An important historical event."),
                "category": event.get("category", "historical"),
                "coordinates": default_coords
            }
            enhanced_events.append(enhanced_event)
            logger.info(f"✅ Enhanced event {i}: {event.get('title', 'No title')}")
        
        logger.info(f"🎯 Returning {len(enhanced_events)} enhanced events")
        return enhanced_events
        
    except json.JSONDecodeError as e:
        logger.error(f"❌ Failed to parse OpenAI response as JSON: {e}")
        logger.error(f"📝 Response text was: {response_text}")
        return []
    except Exception as e:
        logger.error(f"❌ Error processing OpenAI response: {e}")
        logger.error(f"📝 Response text was: {response_text}")
        return []

# API Endpoints
@app.get("/locations/{location}/events", response_model=EventsResponse)
async def list_events(
    location: str = Path(..., description="Location name (city, country, etc.)"),
    limit: int = Query(5, ge=1, le=20, description="Number of events to return")
):
    """
    List key events for a location using OpenAI GPT-4.
    
    This endpoint uses your integrated OpenAI functions to get real historical events.
    """
    
    logger.info(f"Researching events for location: {location}, limit: {limit}")
    
    try:
        # Use the test_location function
        openai_response = test_location(location)
        
        if not openai_response:
            raise HTTPException(status_code=500, detail="Failed to get response from OpenAI")
        
        # Parse the OpenAI response
        events_data = parse_openai_response(openai_response, location)
        
        # Convert to Pydantic models
        events = []
        for event_data in events_data:
            coords = event_data.get("coordinates")
            coordinates = Coordinates(**coords) if coords else None
            
            event = Event(
                id=event_data["id"],
                date=event_data["date"],
                title=event_data["title"],
                description=event_data["description"],
                category=event_data.get("category"),
                coordinates=coordinates
            )
            events.append(event)
        
        response = EventsResponse(
            location=Location(name=location),
            events=events
        )
        
        logger.info(f"Successfully found {len(events)} events for {location}")
        return response
        
    except Exception as e:
        logger.error(f"Error processing request for {location}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during research")

@app.get("/locations/{location}/events/drilldown", response_model=EventsResponse)
async def drill_down(
    location: str = Path(..., description="Location name"),
    date: str = Query(..., regex=r"^\d{4}(-\d{2}-\d{2})?$", description="Date in YYYY or YYYY-MM-DD format"),
    title: str = Query(..., description="Parent event title"),
    limit: int = Query(5, ge=1, le=20, description="Number of sub-events to return")
):
    """
    Drill down into a specific event to get detailed aspects using OpenAI GPT-4.
    
    This endpoint provides detailed breakdown of a main historical event.
    """
    
    logger.info(f"Drilling down into event: {title} ({date}) in {location}")
    
    try:
        # Use the test_event function
        openai_response = test_event(location, date)
        logger.info(f"OpenAI drilldown response: {openai_response}")
        
        if not openai_response:
            logger.warning("No response from test_event, using fallback")
            # Create a fallback response for drill-down
            events_data = [{
                "id": f"{location.lower().replace(' ', '_')}_drilldown_0_{date}",
                "date": date,
                "title": f"Details about {title}",
                "description": f"More information about the event '{title}' that occurred in {location} on {date}. Set your OpenAI API key for detailed historical analysis.",
                "category": "historical",
                "coordinates": None
            }]
        else:
            # Parse the OpenAI response
            events_data = parse_openai_response(openai_response, location)
            logger.info(f"Parsed events data: {events_data}")
        
        # Convert to Pydantic models
        events = []
        for i, event_data in enumerate(events_data):
            coords = event_data.get("coordinates")
            coordinates = Coordinates(**coords) if coords else None
            
            # Generate unique ID for sub-event
            event_id = event_data.get("id", f"{location.lower().replace(' ', '_')}_sub_{i}_{event_data.get('date', date)}")
            
            event = Event(
                id=event_id,
                date=event_data.get("date", date),
                title=event_data.get("title", f"Aspect of {title}"),
                description=event_data.get("description", "A detailed aspect of the main event."),
                category=event_data.get("category", "historical"),
                coordinates=coordinates
            )
            events.append(event)
        
        response = EventsResponse(
            location=Location(name=location),
            events=events
        )
        
        logger.info(f"Successfully found {len(events)} sub-events for {title}")
        return response
        
    except Exception as e:
        logger.error(f"Error processing drilldown for {title}: {str(e)}")
        # Return a fallback response instead of raising an error
        fallback_event = Event(
            id=f"{location.lower().replace(' ', '_')}_error_0_{date}",
            date=date,
            title=f"Event in {location}",
            description=f"Unable to get detailed information about '{title}' in {location}. Please check server logs for details.",
            category="historical",
            coordinates=None
        )
        
        return EventsResponse(
            location=Location(name=location),
            events=[fallback_event]
        )

# Legacy endpoint for backwards compatibility (from README.md)
@app.post("/query", response_model=EventsResponse)
async def query_location(request: QueryRequest):
    """
    Legacy endpoint for querying location events.
    Redirects to the main events endpoint.
    """
    return await list_events(location=request.location, limit=5)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Time Space API"}

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Time Space API - Interactive History Map",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 