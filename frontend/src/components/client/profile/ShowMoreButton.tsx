'use client';

import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface ShowMoreButtonProps {
  isExpanded: boolean;
  itemCount: number;
  visibleCount: number;
  onToggle: () => void;
}

export default function ShowMoreButton({
  isExpanded,
  itemCount,
  visibleCount,
  onToggle
}: ShowMoreButtonProps) {
  const remainingCount = itemCount - visibleCount;
  
  return (
    <motion.div 
      className="text-center mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <button
        onClick={onToggle}
        className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-white flex items-center justify-center w-full max-w-xs mx-auto transition"
      >
        {isExpanded ? (
          <>
            <span>Réduire la liste</span>
            <ChevronUpIcon className="h-4 w-4 ml-1" />
          </>
        ) : (
          <>
            <span>Voir les {remainingCount} autres</span>
            <ChevronDownIcon className="h-4 w-4 ml-1" />
          </>
        )}
      </button>
    </motion.div>
  );
}