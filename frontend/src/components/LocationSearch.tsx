import { useRef, useEffect } from 'react';

interface LocationSearchResult {
  name: string;
  lat: number;
  lng: number;
  country?: string;
  state?: string;
  fullName?: string;
}

interface LocationSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (location: string) => void;
  isLoading?: boolean;
  searchResults?: LocationSearchResult[];
  showDropdown?: boolean;
  onLocationSelect?: (location: LocationSearchResult) => void;
  onDropdownClose?: () => void;
}

export default function LocationSearch({
  value,
  onChange,
  onSearch,
  isLoading = false,
  searchResults = [],
  showDropdown = false,
  onLocationSelect,
  onDropdownClose,
}: LocationSearchProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0 && onLocationSelect) {
      onLocationSelect(searchResults[0]);
    } else {
      onSearch?.(value);
    }
  };

  const handleLocationClick = (location: LocationSearchResult) => {
    onLocationSelect?.(location);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onDropdownClose?.();
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown, onDropdownClose]);

  return (
    <div className="absolute top-6 left-6 z-20" ref={dropdownRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center bg-gray-800 bg-opacity-80 backdrop-blur-sm rounded-lg px-4 py-3 min-w-80">
          <svg
            className="w-5 h-5 text-gray-400 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search location..."
            className="bg-transparent text-white placeholder-gray-400 outline-none flex-1 text-lg"
            disabled={isLoading}
          />
          {isLoading && (
            <div className="ml-3">
              <svg className="animate-spin w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          )}
        </div>

        {/* Dropdown */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 bg-opacity-95 backdrop-blur-sm rounded-lg border border-gray-700 shadow-xl max-h-60 overflow-y-auto">
            {searchResults.map((location, index) => (
              <div
                key={index}
                onClick={() => handleLocationClick(location)}
                className="px-4 py-3 hover:bg-gray-700 cursor-pointer transition-colors border-b border-gray-700 last:border-b-0"
              >
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 text-cyan-400 mr-3 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <div>
                    <div className="text-white font-medium">{location.name}</div>
                    <div className="text-gray-400 text-sm">
                      {[location.state, location.country].filter(Boolean).join(', ')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}
