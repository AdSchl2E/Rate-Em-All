'use client';

type SortOption = {
  id: string;
  label: string;
  activeClass: string;
};

interface SortControlsProps {
  sortBy: string;
  sortDir: 'asc' | 'desc';
  options: SortOption[];
  onSortChange: (option: string, direction: 'asc' | 'desc') => void;
}

export default function SortControls({ 
  sortBy, 
  sortDir, 
  options, 
  onSortChange 
}: SortControlsProps) {
  const toggleSortDirection = (current: 'asc' | 'desc'): 'asc' | 'desc' => {
    return current === 'asc' ? 'desc' : 'asc';
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-400">Trier par:</span>
      <div className="flex rounded-lg overflow-hidden">
        {options.map(option => (
          <button
            key={option.id}
            className={`px-3 py-1 text-sm ${
              sortBy === option.id 
                ? `${option.activeClass} text-white` 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => {
              if (sortBy === option.id) {
                onSortChange(option.id, toggleSortDirection(sortDir));
              } else {
                onSortChange(option.id, 'desc');
              }
            }}
          >
            {option.label}
            {sortBy === option.id && (
              <span className="ml-1">
                {sortDir === 'desc' ? '↓' : '↑'}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}