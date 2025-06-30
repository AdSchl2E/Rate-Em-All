'use client';

import { ArrowsUpDownIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

/**
 * Sort option configuration
 */
type SortOption = {
  /** Unique identifier for the option */
  id: string;
  /** Display label */
  label: string;
  /** Optional icon */
  icon?: React.ReactNode;
};

/**
 * Props for the SortControls component
 */
interface SortControlsProps {
  /** Currently selected sort field */
  sortBy: string;
  /** Current sort direction */
  sortDir: 'asc' | 'desc';
  /** Available sorting options */
  options: SortOption[];
  /** Callback when sort option changes */
  onSortChange: (option: string, direction: 'asc' | 'desc') => void;
}

/**
 * SortControls component
 * 
 * Provides UI controls for sorting data by different fields and directions.
 * 
 * @param props - Component props
 * @returns React component
 */
export default function SortControls({ 
  sortBy, 
  sortDir, 
  options, 
  onSortChange 
}: SortControlsProps) {
  const toggleSortDirection = (current: 'asc' | 'desc'): 'asc' | 'desc' => {
    return current === 'asc' ? 'desc' : 'asc';
  };

  // Get the sort icon for a given field
  const getSortIcon = (field: string) => {
    if (field !== sortBy) {
      return <ArrowsUpDownIcon className="h-4 w-4 text-gray-500" />;
    }
    
    return sortDir === 'asc' ? 
      <ArrowUpIcon className="h-4 w-4 text-blue-400" /> : 
      <ArrowDownIcon className="h-4 w-4 text-blue-400" />;
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-gray-400">Sort by:</span>
      <div className="flex gap-2 flex-wrap">
        {options.map(option => (
          <button
            key={option.id}
            onClick={() => {
              if (sortBy === option.id) {
                onSortChange(option.id, toggleSortDirection(sortDir));
              } else {
                onSortChange(option.id, 'desc');
              }
            }}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm ${
              sortBy === option.id 
                ? 'bg-gray-700 text-blue-400' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-750'
            }`}
          >
            {option.label} {getSortIcon(option.id)}
          </button>
        ))}
      </div>
    </div>
  );
}