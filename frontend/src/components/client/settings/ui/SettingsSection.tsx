'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface SettingsSectionProps {
  children: ReactNode;
  className?: string;
}

export default function SettingsSection({ children, className = '' }: SettingsSectionProps) {
  return (
    <motion.section
      className={`bg-gray-800 rounded-xl p-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {children}
    </motion.section>
  );
}