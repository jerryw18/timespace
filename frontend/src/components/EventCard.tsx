interface EventDetail {
  text: string;
}

interface EventCardProps {
  title: string;
  details: EventDetail[];
  onClose?: () => void;
  onDrillDown?: () => void;
  canDrillDown?: boolean;
  isLoading?: boolean;
}

export default function EventCard({ title, details, onClose, onDrillDown, canDrillDown = true, isLoading = false }: EventCardProps) {
  return (
    <div className="bg-gray-800 bg-opacity-95 backdrop-blur-sm text-white rounded-lg p-6 max-w-md shadow-2xl border border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors ml-4"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      <ul className="space-y-3 mb-4">
        {details.map((detail, index) => (
          <li key={index} className="flex items-start">
            <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0" />
            <span className="text-gray-200 leading-relaxed">{detail.text}</span>
          </li>
        ))}
      </ul>

      {canDrillDown && (
        <div className="flex justify-end">
          <button
            onClick={onDrillDown}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors duration-200 text-sm font-medium"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Exploring...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
                Explore More
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
