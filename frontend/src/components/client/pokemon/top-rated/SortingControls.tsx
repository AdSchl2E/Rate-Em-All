import { AdjustmentsHorizontalIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { SortCriteria, SortDirection } from './TopRatedContainer';

interface SortingControlsProps {
  sortBy: SortCriteria;
  sortDirection: SortDirection;
  handleSortChange: (criteria: SortCriteria) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  isFiltering: boolean;
  filterCount: number;
}

export default function SortingControls({
  sortBy,
  sortDirection,
  handleSortChange,
  showFilters,
  setShowFilters,
  isFiltering,
  filterCount
}: SortingControlsProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        {/* Options de tri principales */}
        <div className="bg-gray-800 rounded-lg p-3 flex items-center gap-2 flex-grow">
          <span className="text-sm text-gray-400 mr-2">Trier par:</span>
          {[
            { id: 'rating', label: 'Note' },
            { id: 'votes', label: 'Votes' },
          ].map((option) => (
            <button
              key={option.id}
              className={`px-3 py-1 rounded-full text-sm flex items-center gap-1
                ${sortBy === option.id
                  ? (option.id === 'rating' ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-medium' : 'bg-blue-600 text-white')
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              onClick={() => handleSortChange(option.id as SortCriteria)}
            >
              <span>{option.label}</span>
              {sortBy === option.id && (
                sortDirection === 'asc'
                  ? <ArrowUpIcon className="h-3 w-3" />
                  : <ArrowDownIcon className="h-3 w-3" />
              )}
            </button>
          ))}
        </div>

        {/* Toggle button for filters */}
        <button
          className={`flex items-center gap-2 px-4 py-3 rounded-lg whitespace-nowrap transition
            ${showFilters ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <AdjustmentsHorizontalIcon className="h-5 w-5" />
          Filtres {isFiltering && `(${filterCount})`}
        </button>
      </div>
    </div>
  );
}