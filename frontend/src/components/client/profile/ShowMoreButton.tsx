'use client';

import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

/**
 * Props for the ShowMoreButton component
 */
interface ShowMoreButtonProps {
  /** Whether the content is currently expanded */
  isExpanded: boolean;
  /** Total number of items in the collection */
  itemCount: number;
  /** Number of items currently visible */
  visibleCount: number;
  /** Callback function to toggle expansion state */
  onToggle: () => void;
}

/**
 * ShowMoreButton component
 * 
 * Displays a button to expand or collapse a list of items.
 * Shows the number of remaining items when collapsed.
 * 
 * @param props - Component props
 * @returns React component
 */
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
            <span>Collapse list</span>
            <ChevronUpIcon className="h-4 w-4 ml-1" />
          </>
        ) : (
          <>
            <span>Show {remainingCount} more</span>
            <ChevronDownIcon className="h-4 w-4 ml-1" />
          </>
        )}
      </button>
    </motion.div>
  );
}