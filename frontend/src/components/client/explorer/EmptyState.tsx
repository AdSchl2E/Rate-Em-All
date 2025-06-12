'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface EmptyStateProps {
  onReset: () => void;
}

export default function EmptyState({ onReset }: EmptyStateProps) {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-16 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative w-32 h-32 mb-6">
        <Image
          src="/images/sad-pikachu.png"
          alt="Aucun résultat"
          fill
          className="object-contain"
        />
      </div>
      
      <MagnifyingGlassIcon className="h-10 w-10 text-gray-500 mb-4" />
      
      <h3 className="text-xl font-bold mb-2">Aucun Pokémon trouvé</h3>
      <p className="text-gray-400 mb-6 max-w-md mx-auto">
        Nous n'avons trouvé aucun Pokémon correspondant à vos critères de recherche. 
        Essayez de modifier vos filtres ou votre recherche.
      </p>
      
      <button
        onClick={onReset}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
      >
        Réinitialiser les filtres
      </button>
    </motion.div>
  );
}