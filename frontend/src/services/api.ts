import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface Event {
  id?: string;
  date: string;
  title: string;
  description: string;
  category?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface EventsResponse {
  location: {
    name: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  events: Event[];
}

export interface LocationSearchResult {
  name: string;
  lat: number;
  lng: number;
  country?: string;
  state?: string;
  fullName?: string;
}

class ApiService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  });

  async getLocationEvents(location: string, limit: number = 5): Promise<EventsResponse> {
    try {
      const response = await this.api.get(`/locations/${encodeURIComponent(location)}/events`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch location events:', error);
      throw error;
    }
  }

  async getEventDrilldown(
    location: string,
    date: string,
    title: string,
    limit: number = 5
  ): Promise<EventsResponse> {
    try {
      const response = await this.api.get(`/locations/${encodeURIComponent(location)}/events/drilldown`, {
        params: { date, title, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch event drilldown:', error);
      throw error;
    }
  }

  async searchLocation(query: string): Promise<LocationSearchResult[]> {
    try {
      const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
      if (!mapboxToken) {
        console.error('Mapbox access token not found');
        return [];
      }

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&types=place&limit=5&language=en`
      );

      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status}`);
      }

      const data = await response.json();
      
      return data.features.map((feature: any) => {
        const place = feature.place_name.split(',');
        const placeName = place[0];
        const region = place[1]?.trim();
        const country = place[place.length - 1]?.trim();

        return {
          name: placeName,
          lat: feature.center[1],
          lng: feature.center[0],
          state: region !== country ? region : undefined,
          country: country,
          fullName: feature.place_name
        };
      });
    } catch (error) {
      console.error('Failed to search location:', error);
      return [];
    }
  }
}

export const apiService = new ApiService();