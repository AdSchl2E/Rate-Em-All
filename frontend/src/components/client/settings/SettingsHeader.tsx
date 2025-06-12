'use client';

import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface SettingsHeaderProps {
  stats: {
    createdAt: Date;
    favoritesCount: number;
    ratedCount: number;
  };
}

export default function SettingsHeader({ stats }: SettingsHeaderProps) {
  return (
    <>
      {/* Bouton Retour et Titre */}
      <motion.div 
        className="mb-8 flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link href="/profile" className="flex items-center text-gray-400 hover:text-white transition">
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          <span>Retour au profil</span>
        </Link>
        <h1 className="text-2xl font-bold">Paramètres utilisateur</h1>
      </motion.div>
      
      {/* Stats utilisateur */}
      <motion.div 
        className="bg-gray-800 rounded-lg p-4 mb-6 flex justify-around"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <StatItem 
          label="Compte créé"
          value={new Date(stats.createdAt).toLocaleDateString()}
        />
        <StatItem 
          label="Favoris"
          value={stats.favoritesCount.toString()}
          valueClassName="text-red-400"
        />
        <StatItem 
          label="Pokémon notés"
          value={stats.ratedCount.toString()}
          valueClassName="text-amber-400"
        />
      </motion.div>
    </>
  );
}

interface StatItemProps {
  label: string;
  value: string;
  valueClassName?: string;
}

function StatItem({ label, value, valueClassName = "" }: StatItemProps) {
  return (
    <div className="text-center">
      <div className="text-sm text-gray-400">{label}</div>
      <div className={`font-medium ${valueClassName}`}>{value}</div>
    </div>
  );
}