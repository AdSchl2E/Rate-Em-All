'use client';

import { motion } from 'framer-motion';
import { LoadingSpinner } from '@/components/client/ui/LoadingSpinner';

interface LoadingIndicatorProps {
  message?: string;
}

/**
 * LoadingIndicator component
 * Displays an animated loading indicator with optional message
 * 
 * @param {Object} props - Component props
 * @param {string} [props.message='Loading...'] - Message to display below spinner
 */
export default function LoadingIndicator({ message = 'Loading...' }: LoadingIndicatorProps) {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-400">{message}</p>
    </motion.div>
  );
}