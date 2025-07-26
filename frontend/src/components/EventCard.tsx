interface EventDetail {
  text: string;
}

interface EventCardProps {
  title: string;
  details: EventDetail[];
  onClose?: () => void;
}

export default function EventCard({ title, details, onClose }: EventCardProps) {
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

      <ul className="space-y-3">
        {details.map((detail, index) => (
          <li key={index} className="flex items-start">
            <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0" />
            <span className="text-gray-200 leading-relaxed">{detail.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
