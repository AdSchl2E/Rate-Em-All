'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

/**
 * Props for the SettingsSection component
 */
interface SettingsSectionProps {
  /** Child components to render within the section */
  children: ReactNode;
  /** Additional CSS classes to apply */
  className?: string;
}

/**
 * SettingsSection component
 * 
 * Renders a styled section container for settings content.
 * Includes animation effects when mounted.
 * 
 * @param props - Component props
 * @returns React component
 */
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