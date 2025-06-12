'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, AdjustmentsHorizontalIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { SortCriteria, SortDirection, PokemonFilters } from './ExplorerContainer';
import TypesFilter from './filters/TypesFilter';
import GenerationFilter from './filters/GenerationFilter';
import CategoryFilter from './filters/CategoryFilter';
import RatingFilter from './filters/RatingFilter';

interface FilterPanelProps {
  filters: PokemonFilters;
  sortOption: { criteria: SortCriteria; direction: SortDirection };
  onFilterChange: (filters: Partial<PokemonFilters>) => void;
  onSortChange: (criteria: SortCriteria, direction?: SortDirection) => void;
  onReset: () => void;
  isFiltering: boolean;
  availableTypes: string[];
}

export default function FilterPanel({
  filters,
  sortOption,
  onFilterChange,
  onSortChange,
  onReset,
  isFiltering,
  availableTypes
}: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'sort' | 'types' | 'generations' | 'categories' | 'rating'>('sort');
  
  const tabs = [
    { id: 'sort' as const, label: 'Tri' },
    { id: 'types' as const, label: 'Types' },
    { id: 'generations' as const, label: 'Générations' },
    { id: 'categories' as const, label: 'Catégories' },
    { id: 'rating' as const, label: 'Notes' },
  ];
  
  const sortOptions = [
    { id: 'id' as SortCriteria, label: 'Numéro' },
    { id: 'name' as SortCriteria, label: 'Nom' },
    { id: 'rating' as SortCriteria, label: 'Note' },
    { id: 'votes' as SortCriteria, label: 'Votes' },
  ];
  
  // Animation variants
  const panelVariants = {
    closed: { height: 0, opacity: 0 },
    open: { height: 'auto', opacity: 1, transition: { duration: 0.3 } }
  };
  
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      {/* Header - Toujours visible */}
      <div className="flex justify-between items-center p-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2"
        >
          <AdjustmentsHorizontalIcon className="h-5 w-5" />
          <span>Filtres et tri</span>
          <ChevronDownIcon
            className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
          
          {/* Badge indiquant des filtres actifs */}
          {isFiltering && (
            <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
              Actifs
            </span>
          )}
        </button>
        
        {/* Réinitialiser les filtres */}
        {isFiltering && (
          <button
            onClick={onReset}
            className="text-sm text-blue-400 hover:text-blue-300 transition"
          >
            Réinitialiser
          </button>
        )}
      </div>
      
      {/* Panneau de filtres expansible */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={panelVariants}
            className="border-t border-gray-700"
          >
            {/* Onglets de navigation */}
            <div className="flex border-b border-gray-700">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-3 py-2 text-sm ${
                    activeTab === tab.id
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  } transition`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            {/* Contenu des onglets */}
            <div className="p-4">
              {/* Onglet Tri */}
              {activeTab === 'sort' && (
                <div className="grid grid-cols-2 gap-3">
                  {sortOptions.map(option => (
                    <button
                      key={option.id}
                      onClick={() => onSortChange(option.id)}
                      className={`flex items-center justify-between px-4 py-2 rounded-lg ${
                        sortOption.criteria === option.id
                          ? 'bg-gray-700 ring-1 ring-blue-500'
                          : 'bg-gray-700/50 hover:bg-gray-700'
                      } transition`}
                    >
                      <span>{option.label}</span>
                      
                      {sortOption.criteria === option.id && (
                        <span className="ml-2">
                          {sortOption.direction === 'asc' ? (
                            <ArrowUpIcon className="h-4 w-4" />
                          ) : (
                            <ArrowDownIcon className="h-4 w-4" />
                          )}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Onglet Types */}
              {activeTab === 'types' && (
                <TypesFilter
                  selectedTypes={filters.types}
                  onChange={(types) => onFilterChange({ types })}
                  availableTypes={availableTypes}
                />
              )}
              
              {/* Onglet Générations */}
              {activeTab === 'generations' && (
                <GenerationFilter
                  selectedGenerations={filters.generations}
                  onChange={(generations) => onFilterChange({ generations })}
                />
              )}
              
              {/* Onglet Catégories */}
              {activeTab === 'categories' && (
                <CategoryFilter
                  selectedCategories={filters.categories}
                  onChange={(categories) => onFilterChange({ categories })}
                />
              )}
              
              {/* Onglet Notes */}
              {activeTab === 'rating' && (
                <RatingFilter
                  minRating={filters.minRating}
                  onChange={(minRating) => onFilterChange({ minRating })}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}