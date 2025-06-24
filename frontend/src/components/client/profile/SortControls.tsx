'use client';

import { ArrowsUpDownIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

type SortOption = {
  id: string;
  label: string;
  icon?: React.ReactNode;
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

  // Obtenir l'icône de tri pour un champ donné
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
      <span className="text-sm text-gray-400">Trier par:</span>
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