'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { HeartIcon } from '@heroicons/react/24/outline';

interface EmptyStateProps {
  message: string;
  actionText?: string;
  actionHref?: string;
}

export default function EmptyState({ message, actionText, actionHref }: EmptyStateProps) {
  return (
    <motion.div 
      className="bg-gray-800/60 rounded-lg p-8 text-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col items-center">
        <motion.div
          className="mb-4 bg-gray-700/50 p-5 rounded-full inline-flex"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <HeartIcon className="h-10 w-10 text-gray-400" />
        </motion.div>
        
        <motion.p 
          className="mb-5 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {message}
        </motion.p>
        
        {actionText && actionHref && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link 
              href={actionHref}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 transition rounded-lg inline-flex items-center space-x-2 text-white font-medium shadow-lg shadow-blue-700/20"
            >
              {actionText}
            </Link>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}