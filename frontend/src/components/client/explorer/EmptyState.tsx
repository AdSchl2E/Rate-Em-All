'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface EmptyStateProps {
  onReset: () => void;
}

/**
 * EmptyState component
 * Displays when no Pokémon match the search/filter criteria
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onReset - Callback function to reset filters
 */
export default function EmptyState({ onReset }: EmptyStateProps) {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-16 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      
      <MagnifyingGlassIcon className="h-10 w-10 text-gray-500 mb-4" />
      
      <h3 className="text-xl font-bold mb-2">No Pokémon found</h3>
      <p className="text-gray-400 mb-6 max-w-md mx-auto">
        We couldn't find any Pokémon matching your search criteria.
        Try modifying your filters or search query.
      </p>
      
      <button
        onClick={onReset}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
      >
        Reset filters
      </button>
    </motion.div>
  );
}