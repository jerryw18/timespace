interface TimelineEvent {
  year: number;
  isActive?: boolean;
}

interface TimelineProps {
  events: TimelineEvent[];
  selectedYear?: number | null;
  onYearSelect?: (year: number) => void;
  isLoading?: boolean;
  apiError?: string | null;
  currentLocation?: string;
}

export default function Timeline({
  events,
  selectedYear,
  onYearSelect,
  isLoading = false,
  apiError = null,
  currentLocation = '',
}: TimelineProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-90 backdrop-blur-sm p-6 border-t border-gray-700 z-20">
      {/* Show error message if API failed */}
      {apiError && (
        <div className="mb-4 p-4 bg-red-900 bg-opacity-50 border border-red-700 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-red-400 font-medium">Timeline Unavailable</h4>
              <p className="text-red-300 text-sm">{apiError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Show loading state */}
      {isLoading && !apiError && (
        <div className="flex items-center justify-center py-8">
          <svg className="animate-spin w-6 h-6 text-cyan-400 mr-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-white">Loading timeline for {currentLocation}...</span>
        </div>
      )}

      {/* Show timeline if we have events and no error */}
      {events.length > 0 && !apiError && !isLoading && (
        <div className="relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-600 transform -translate-y-1/2" />

          <div className="flex justify-between items-center relative">
            {events.map((event) => (
              <div
                key={event.year}
                className="flex flex-col items-center cursor-pointer group"
                onClick={() => onYearSelect?.(event.year)}
              >
                <div
                  className={`w-4 h-4 rounded-full transition-all duration-300 relative z-10 ${
                    event.year === selectedYear || event.isActive
                      ? "bg-cyan-400 scale-125"
                      : "bg-white hover:bg-cyan-300 hover:scale-110"
                  }`}
                >
                  {(event.year === selectedYear || event.isActive) && (
                    <div className="absolute inset-0 bg-cyan-400 rounded-full animate-ping opacity-75" />
                  )}
                </div>

                <span
                  className={`mt-3 text-sm font-medium transition-all duration-300 ${
                    event.year === selectedYear || event.isActive
                      ? "text-cyan-400 scale-110"
                      : "text-white group-hover:text-cyan-300"
                  }`}
                >
                  {event.year}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Show empty state if no events and no error */}
      {events.length === 0 && !apiError && !isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <svg className="w-12 h-12 text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-400">No timeline data available for {currentLocation}</p>
          </div>
        </div>
      )}
    </div>
  );
}
