import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

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
  onBack?: () => void;
  canGoBack?: boolean;
  timelineTitle?: string;
}

export default function Timeline({
  events,
  selectedYear,
  onYearSelect,
  isLoading = false,
  apiError = null,
  currentLocation = '',
  onBack,
  canGoBack = false,
  timelineTitle = '',
}: TimelineProps) {
  const dotsRef = useRef<HTMLDivElement[]>([]);
  const timelineRef = useRef<HTMLDivElement>(null);
  const previousEventsLength = useRef(events.length);

  // Animate timeline dots when events change
  useEffect(() => {
    if (events.length === 0) return;

    const dots = dotsRef.current.filter(Boolean);
    if (dots.length === 0) return;

    // If this is a new timeline (events changed), animate in
    if (events.length !== previousEventsLength.current) {
      // First hide all dots
      gsap.set(dots, { scale: 0, opacity: 0 });
      
      // Then animate them in with stagger
      gsap.to(dots, {
        scale: 1,
        opacity: 1,
        duration: 0.6,
        ease: "back.out(1.7)",
        stagger: 0.1,
      });

      // Add a pulse effect to make it more dynamic
      gsap.to(dots, {
        scale: 1.2,
        duration: 0.3,
        ease: "power2.out",
        stagger: 0.1,
        delay: 0.8,
        yoyo: true,
        repeat: 1
      });
    }

    previousEventsLength.current = events.length;
  }, [events]);

  // Animate selected dot
  useEffect(() => {
    const dots = dotsRef.current.filter(Boolean);
    
    dots.forEach((dot, index) => {
      const isSelected = events[index]?.year === selectedYear;
      
      if (isSelected) {
        gsap.to(dot.querySelector('.dot-inner'), {
          scale: 1.25,
          duration: 0.3,
          ease: "back.out(1.7)"
        });
        gsap.to(dot.querySelector('.dot-label'), {
          scale: 1.1,
          duration: 0.3,
          ease: "back.out(1.7)"
        });
      } else {
        gsap.to(dot.querySelector('.dot-inner'), {
          scale: 1,
          duration: 0.3,
          ease: "power2.out"
        });
        gsap.to(dot.querySelector('.dot-label'), {
          scale: 1,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    });
  }, [selectedYear, events]);
  return (
    <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-700 z-20" style={{ backgroundColor: 'oklch(0.278 0.033 256.848)' }}>
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

      {/* Show back button if we can go back */}
      {canGoBack && (
        <div className="mb-4 flex items-center">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to {timelineTitle || currentLocation}
          </button>
        </div>
      )}

      {/* Show timeline if we have events and no error */}
      {events.length > 0 && !apiError && !isLoading && (
        <div className="relative" ref={timelineRef}>
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-600 transform -translate-y-1/2" />

          <div className="flex justify-between items-center relative">
            {events.map((event, index) => (
              <div
                key={`${event.year}-${index}`}
                ref={(el) => {
                  if (el) dotsRef.current[index] = el;
                }}
                className="flex flex-col items-center cursor-pointer group"
                onClick={() => onYearSelect?.(event.year)}
              >
                <div
                  className={`dot-inner w-4 h-4 rounded-full transition-all duration-300 relative z-10 ${
                    event.year === selectedYear || event.isActive
                      ? "bg-cyan-400"
                      : "bg-white hover:bg-cyan-300"
                  }`}
                >
                  {(event.year === selectedYear || event.isActive) && (
                    <div className="absolute inset-0 bg-cyan-400 rounded-full animate-ping opacity-75" />
                  )}
                </div>

                <span
                  className={`dot-label mt-3 text-sm font-medium transition-all duration-300 ${
                    event.year === selectedYear || event.isActive
                      ? "text-cyan-400"
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
