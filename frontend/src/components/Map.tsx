import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface Location {
  name: string;
  lng: number;
  lat: number;
}

interface MapProps {
  currentLocation: Location;
  isLoading?: boolean;
}

// Set Mapbox access token from environment variable
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

export default function Map({ currentLocation, isLoading }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    // Check if access token is available
    if (!mapboxgl.accessToken) {
      console.error(
        "Mapbox access token is required. Please set VITE_MAPBOX_ACCESS_TOKEN in your .env file",
      );
      return;
    }

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [currentLocation.lng, currentLocation.lat],
        zoom: 10,
        pitch: 0,
        bearing: 0,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Handle map load errors
      map.current.on("error", (e) => {
        console.error("Mapbox error:", e);
      });
    } catch (error) {
      console.error("Failed to initialize Mapbox:", error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    // Create custom marker element for current location
    const el = document.createElement("div");
    el.className = "cursor-pointer group relative";
    el.innerHTML = `
      <div class="flex flex-col items-center">
        <div class="w-6 h-6 rounded-full transition-all duration-300 bg-cyan-400 scale-125 relative">
          <div class="absolute inset-0 bg-cyan-400 rounded-full animate-ping opacity-75"></div>
        </div>
        <span class="mt-2 text-sm font-medium transition-all duration-300 text-cyan-400 scale-110 whitespace-nowrap">
          ${currentLocation.name}
        </span>
      </div>
    `;

    // Create and add marker
    const marker = new mapboxgl.Marker(el)
      .setLngLat([currentLocation.lng, currentLocation.lat])
      .addTo(map.current!);

    markers.current.push(marker);

    // Center map on current location
    map.current.flyTo({
      center: [currentLocation.lng, currentLocation.lat],
      zoom: 10,
      duration: 1500
    });
  }, [currentLocation]);

  return (
    <div className="absolute inset-0 w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
