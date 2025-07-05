'use client';

import { ArrowsUpDownIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { PokemonSortField, SortDirection } from '@/hooks/usePokemonSort';

/**
 * Sort option configuration
 */
export interface SortOption {
  /** Unique identifier for the option */
  id: PokemonSortField;
  /** Display label */
  label: string;
  /** Optional icon */
  icon?: React.ReactNode;
}

/**
 * Props for the UniversalSortControls component
 */
interface UniversalSortControlsProps {
  /** Currently selected sort field */
  sortField: PokemonSortField;
  /** Current sort direction */
  sortDirection: SortDirection;
  /** Available sorting options */
  options: SortOption[];
  /** Callback when sort option changes */
  onSortChange: (field: PokemonSortField) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Universal sort controls component
 * 
 * Provides a consistent UI for sorting across the application.
 * Handles smart direction toggling and visual feedback.
 * 
 * @param props Component props
 * @returns React component
 */
export default function UniversalSortControls({ 
  sortField, 
  sortDirection, 
  options, 
  onSortChange,
  className = ''
}: UniversalSortControlsProps) {
  
  /**
   * Get the appropriate sort icon for a field
   */
  const getSortIcon = (field: PokemonSortField) => {
    if (field !== sortField) {
      return <ArrowsUpDownIcon className="h-4 w-4 text-gray-500" />;
    }
    
    return sortDirection === 'asc' ? 
      <ArrowUpIcon className="h-4 w-4 text-blue-400" /> : 
      <ArrowDownIcon className="h-4 w-4 text-blue-400" />;
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {options.map(option => (
        <button
          key={option.id}
          onClick={() => onSortChange(option.id)}
          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm transition-colors ${
            sortField === option.id 
              ? 'bg-gray-700 text-blue-400' 
              : 'bg-gray-800 text-gray-300 hover:bg-gray-750'
          }`}
        >
          {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
          {option.label} {getSortIcon(option.id)}
        </button>
      ))}
    </div>
  );
}
