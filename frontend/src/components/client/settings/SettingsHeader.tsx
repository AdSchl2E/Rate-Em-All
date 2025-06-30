'use client';

import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

/**
 * Props for the SettingsHeader component
 */
interface SettingsHeaderProps {
  /** User statistics to display */
  stats: {
    /** Account creation date */
    createdAt: Date;
    /** Number of favorite Pokémon */
    favoritesCount: number;
    /** Number of rated Pokémon */
    ratedCount: number;
  };
}

/**
 * SettingsHeader component
 * 
 * Displays the header section of the settings page,
 * including navigation back to profile and user statistics.
 * 
 * @param props - Component props
 * @returns React component
 */
export default function SettingsHeader({ stats }: SettingsHeaderProps) {
  return (
    <>
      {/* Back button and Title */}
      <motion.div 
        className="mb-8 flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link href="/profile" className="flex items-center text-gray-400 hover:text-white transition">
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          <span>Back to profile</span>
        </Link>
        <h1 className="text-2xl font-bold">User Settings</h1>
      </motion.div>
      
      {/* User stats */}
      <motion.div 
        className="bg-gray-800 rounded-lg p-4 mb-6 flex justify-around"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <StatItem 
          label="Account created"
          value={new Date(stats.createdAt).toLocaleDateString()}
        />
        <StatItem 
          label="Favorites"
          value={stats.favoritesCount.toString()}
          valueClassName="text-red-400"
        />
        <StatItem 
          label="Rated Pokémon"
          value={stats.ratedCount.toString()}
          valueClassName="text-amber-400"
        />
      </motion.div>
    </>
  );
}

/**
 * Props for the StatItem component
 */
interface StatItemProps {
  /** Label text for the stat */
  label: string;
  /** Value to display */
  value: string;
  /** Optional CSS class for the value text */
  valueClassName?: string;
}

/**
 * StatItem component
 * 
 * Displays a single statistic with label and value.
 * 
 * @param props - Component props
 * @returns React component
 */
function StatItem({ label, value, valueClassName = "" }: StatItemProps) {
  return (
    <div className="text-center">
      <div className="text-sm text-gray-400">{label}</div>
      <div className={`font-medium ${valueClassName}`}>{value}</div>
    </div>
  );
}