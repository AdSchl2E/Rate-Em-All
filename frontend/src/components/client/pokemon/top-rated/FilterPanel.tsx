import { SPECIAL_CATEGORIES } from './TopRatedContainer';
import { typeColors } from '@/lib/utils/pokemonTypes';

// Pokémon generations constants
const GENERATIONS = [
  { name: 'Génération I', range: [1, 151] },
  { name: 'Génération II', range: [152, 251] },
  { name: 'Génération III', range: [252, 386] },
  { name: 'Génération IV', range: [387, 493] },
  { name: 'Génération V', range: [494, 649] },
  { name: 'Génération VI', range: [650, 721] },
  { name: 'Génération VII', range: [722, 809] },
  { name: 'Génération VIII', range: [810, 898] },
  { name: 'Génération IX', range: [899, 1010] },
];

interface FilterPanelProps {
  pokemonTypes: string[];
  selectedTypes: string[];
  selectedGenerations: number[];
  selectedCategories: string[];
  minRating: number | null;
  setMinRating: (rating: number | null) => void;
  toggleType: (type: string) => void;
  toggleGeneration: (genIndex: number) => void;
  toggleCategory: (category: string) => void;
  resetFilters: () => void;
}

export default function FilterPanel({
  pokemonTypes,
  selectedTypes,
  selectedGenerations,
  selectedCategories,
  minRating,
  setMinRating,
  toggleType,
  toggleGeneration,
  toggleCategory,
  resetFilters
}: FilterPanelProps) {
  // Rating options
  const RATING_OPTIONS = [
    { value: 4, label: '4★+' },
    { value: 4.5, label: '4.5★+' },
    { value: 4.8, label: '4.8★+' }
  ];
  
  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-lg space-y-6 mt-2 mb-6">
      {/* Type filters */}
      <div>
        <h3 className="font-medium mb-2 text-gray-300">Types</h3>
        <div className="flex flex-wrap gap-2">
          {pokemonTypes.map(type => (
            <button
              key={type}
              className={`px-3 py-1 rounded-full text-sm capitalize transition-colors
                ${selectedTypes.includes(type)
                  ? `bg-opacity-90 text-white`
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              style={{
                backgroundColor: selectedTypes.includes(type)
                  ? typeColors[type]
                  : undefined
              }}
              onClick={() => toggleType(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Generation filters */}
      <div>
        <h3 className="font-medium mb-2 text-gray-300">Génération</h3>
        <div className="flex flex-wrap gap-2">
          {GENERATIONS.map((gen, index) => (
            <button
              key={gen.name}
              className={`px-3 py-1 rounded-full text-sm
                ${selectedGenerations.includes(index)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              onClick={() => toggleGeneration(index)}
            >
              {gen.name}
            </button>
          ))}
        </div>
      </div>

      {/* Special categories */}
      <div>
        <h3 className="font-medium mb-2 text-gray-300">Catégories</h3>
        <div className="flex flex-wrap gap-2">
          {SPECIAL_CATEGORIES.map(category => (
            <button
              key={category.id}
              className={`px-3 py-1 rounded-full text-sm
                ${selectedCategories.includes(category.id)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              onClick={() => toggleCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Rating filter */}
      <div>
        <h3 className="font-medium mb-2 text-gray-300">Note minimale</h3>
        <div className="flex flex-wrap gap-2">
          {RATING_OPTIONS.map(option => (
            <button
              key={option.value}
              className={`px-3 py-1 rounded-full text-sm
                ${minRating === option.value
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              onClick={() => setMinRating(minRating === option.value ? null : option.value)}
            >
              {option.label}
            </button>
          ))}
          {minRating !== null && (
            <button
              className="px-3 py-1 rounded-full text-sm bg-gray-700 text-gray-300 hover:bg-gray-600"
              onClick={() => setMinRating(null)}
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Reset filters button */}
      <div className="flex justify-end">
        <button
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          onClick={resetFilters}
        >
          Réinitialiser les filtres
        </button>
      </div>
    </div>
  );
}