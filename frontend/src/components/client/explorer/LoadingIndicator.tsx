'use client';

import { motion } from 'framer-motion';
import { LoadingSpinner } from '@/components/client/ui/LoadingSpinner';

interface LoadingIndicatorProps {
  message?: string;
}

export default function LoadingIndicator({ message = 'Chargement...' }: LoadingIndicatorProps) {
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