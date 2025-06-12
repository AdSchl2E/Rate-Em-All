'use client';

import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { LoadingSpinner } from '@/components/client/ui/LoadingSpinner';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  loading?: boolean;
}

export default function SearchBar({ value, onChange, loading = false }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <motion.div 
      className={`relative flex items-center rounded-lg ${
        isFocused 
          ? 'bg-gray-700 ring-2 ring-blue-500' 
          : 'bg-gray-800 hover:bg-gray-700'
      } transition-all duration-200`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <MagnifyingGlassIcon className="h-5 w-5 ml-3 text-gray-400" />
      
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Rechercher un Pokémon par nom ou numéro..."
        className="flex-grow px-3 py-3 bg-transparent outline-none"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      
      {loading && (
        <div className="mr-3">
          <LoadingSpinner size="sm" color="blue" />
        </div>
      )}
      
      {value && !loading && (
        <button
          onClick={() => onChange('')}
          className="mr-3 p-1 rounded-full hover:bg-gray-600 text-gray-400 hover:text-white transition"
          aria-label="Clear search"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      )}
    </motion.div>
  );
}