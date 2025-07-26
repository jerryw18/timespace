import { useState, useEffect } from "react";
import Header from "./components/Header";
import LocationSearch from "./components/LocationSearch";
import Map from "./components/Map";
import Timeline from "./components/Timeline";
import EventCard from "./components/EventCard";
import { apiService, type LocationSearchResult } from "./services/api";
import "./App.css";

function App() {
  const [searchLocation, setSearchLocation] = useState("Seattle");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [currentLocation, setCurrentLocation] = useState({
    name: "Seattle",
    lng: -122.3321,
    lat: 47.6062,
  });
  const [timelineEvents, setTimelineEvents] = useState<Array<{year: number, isActive?: boolean}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentEvents, setCurrentEvents] = useState<Array<{
    date: string;
    title: string;
    description: string;
    category?: string;
  }>>([]);
  const [isDrillingDown, setIsDrillingDown] = useState(false);
  const [timelineStack, setTimelineStack] = useState<Array<{
    events: typeof timelineEvents;
    currentEvents: typeof currentEvents;
    selectedYear: number | null;
    title: string;
  }>>([]);
  const [currentTimelineTitle, setCurrentTimelineTitle] = useState<string>("");

  const handleLocationSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    
    try {
      const results = await apiService.searchLocation(query);
      setSearchResults(results);
      setShowDropdown(results.length > 0);
    } catch (error) {
      console.error('Failed to search location:', error);
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const handleLocationSelect = async (location: LocationSearchResult) => {
    setCurrentLocation({
      name: location.name,
      lng: location.lng,
      lat: location.lat,
    });
    setSearchLocation(location.name);
    setShowDropdown(false);
    setSearchResults([]);
    
    // Fetch events for the new location
    setIsLoading(true);
    await fetchLocationEvents(location.name);
  };

  const handleSearchInputChange = (value: string) => {
    setSearchLocation(value);
    if (value.trim()) {
      // Simple debouncing - search immediately for now, can be improved
      handleLocationSearch(value);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const fetchLocationEvents = async (locationName: string) => {
    setIsLoading(true);
    setApiError(null);
    
    // Use hardcoded data for Seattle initial load
    if (locationName.toLowerCase() === 'seattle') {
      try {
        const seattleEvents = [
          {
            date: "1851",
            title: "Founding of Seattle",
            description: "The Denny Party lands at Alki Point, marking the establishment of Seattle by white settlers."
          },
          {
            date: "1889",
            title: "Great Seattle Fire",
            description: "A catastrophic fire destroys much of downtown Seattle, leading to a major rebuilding effort."
          },
          {
            date: "1962",
            title: "Century 21 Exposition (World's Fair)",
            description: "The Seattle World's Fair opens, introducing the Space Needle and establishing Seattle as a modern city."
          },
          {
            date: "1999",
            title: "WTO Protests",
            description: "Massive protests against the World Trade Organization meeting bring global attention to Seattle and the anti-globalization movement."
          }
        ];
        
        // Extract years from events to create timeline
        const events = seattleEvents.map(event => {
          const year = parseInt(event.date);
          return { year: isNaN(year) ? new Date(event.date).getFullYear() : year };
        });
        
        setTimelineEvents(events);
        setCurrentEvents(seattleEvents);
        
        if (events.length > 0) {
          setSelectedYear(events[0].year);
        }
        setIsLoading(false);
        return;
      } catch (error) {
        console.error('Error setting Seattle data:', error);
      }
    }
    
    // For other cities, try the API
    try {
      const response = await apiService.getLocationEvents(locationName);
      
      // Extract years from events to create timeline
      const events = response.events.map(event => {
        const year = parseInt(event.date);
        return { year: isNaN(year) ? new Date(event.date).getFullYear() : year };
      });
      
      setTimelineEvents(events);
      setCurrentEvents(response.events);
      
      if (events.length > 0) {
        setSelectedYear(events[0].year);
      }
    } catch (error: any) {
      console.error('Failed to fetch location events:', error);
      
      // Set user-friendly error message
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        setApiError('Backend service is currently unavailable. Please try again later.');
      } else if (error.response?.status === 404) {
        setApiError(`No historical data found for ${locationName}.`);
      } else {
        setApiError('Unable to load historical data. Please check your connection and try again.');
      }
      
      // Set empty state on error
      setTimelineEvents([]);
      setCurrentEvents([]);
      setSelectedYear(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleYearSelect = async (year: number) => {
    setSelectedYear(year);
  };

  const handleDrillDown = async () => {
    if (!selectedYear) return;

    const eventForYear = currentEvents.find(event => {
      const eventYear = parseInt(event.date) || new Date(event.date).getFullYear();
      return eventYear === selectedYear;
    });

    if (!eventForYear) return;

    setIsDrillingDown(true);
    
    try {
      // Save current timeline state to stack
      setTimelineStack(prev => [...prev, {
        events: timelineEvents,
        currentEvents: currentEvents,
        selectedYear: selectedYear,
        title: currentTimelineTitle || currentLocation.name
      }]);

      // Call drill-down API
      const response = await apiService.getEventDrilldown(
        currentLocation.name,
        eventForYear.date,
        eventForYear.title
      );

      // Extract years from drill-down events
      const drillDownEvents = response.events.map(event => {
        const year = parseInt(event.date) || new Date(event.date).getFullYear();
        return { year };
      });

      // Update timeline with drill-down data
      setTimelineEvents(drillDownEvents);
      setCurrentEvents(response.events);
      setCurrentTimelineTitle(eventForYear.title);
      setSelectedYear(drillDownEvents.length > 0 ? drillDownEvents[0].year : null);
      setApiError(null);
      
    } catch (error: any) {
      console.error('Failed to fetch drill-down data:', error);
      setApiError('Failed to load detailed timeline. Please try again.');
    } finally {
      setIsDrillingDown(false);
    }
  };

  const handleBackToParentTimeline = () => {
    const lastTimeline = timelineStack[timelineStack.length - 1];
    if (lastTimeline) {
      setTimelineEvents(lastTimeline.events);
      setCurrentEvents(lastTimeline.currentEvents);
      setSelectedYear(lastTimeline.selectedYear);
      setCurrentTimelineTitle(lastTimeline.title);
      setTimelineStack(prev => prev.slice(0, -1));
    }
  };

  // Load initial events for Seattle
  useEffect(() => {
    fetchLocationEvents("Seattle");
  }, []);

  return (
    <div className="h-screen bg-neutral-900 text-white overflow-hidden flex flex-col">
      <Header />

      <div className="flex-1 relative">
        <Map
          currentLocation={currentLocation}
          isLoading={isLoading}
        />

        <LocationSearch 
          value={searchLocation} 
          onChange={handleSearchInputChange}
          onSearch={handleLocationSearch}
          isLoading={isLoading}
          searchResults={searchResults}
          showDropdown={showDropdown}
          onLocationSelect={handleLocationSelect}
          onDropdownClose={() => setShowDropdown(false)}
        />

        {selectedYear && currentEvents.length > 0 && (
          <div className={`absolute left-8 z-30 ${
            timelineStack.length > 0 ? 'bottom-48' : 'bottom-32'
          }`}>
            <EventCard
              title={currentEvents.find(e => 
                (parseInt(e.date) || new Date(e.date).getFullYear()) === selectedYear
              )?.title || "Event"}
              details={[
                { text: currentEvents.find(e => 
                  (parseInt(e.date) || new Date(e.date).getFullYear()) === selectedYear
                )?.description || "No description available" }
              ]}
              onDrillDown={handleDrillDown}
              canDrillDown={true}
              isLoading={isDrillingDown}
              onClose={() => setSelectedYear(null)}
            />
          </div>
        )}
      </div>

      <Timeline
        events={timelineEvents}
        selectedYear={selectedYear}
        onYearSelect={handleYearSelect}
        isLoading={isLoading}
        apiError={apiError}
        currentLocation={currentLocation.name}
        onBack={handleBackToParentTimeline}
        canGoBack={timelineStack.length > 0}
        timelineTitle={currentTimelineTitle}
      />
    </div>
  );
}

export default App;
