'use client';

import { motion } from 'framer-motion';
import { Pokemon } from '@/types/pokemon';

interface PokemonStatsSectionProps {
  stats: Pokemon['stats'];
}

/**
 * PokemonStatsSection component
 * Displays a Pokémon's base stats with animated progress bars
 * 
 * @param {Object} props - Component props
 * @param {Pokemon['stats']} props.stats - Array of Pokémon stats
 */
export default function PokemonStatsSection({ stats }: PokemonStatsSectionProps) {
  // Map of stat names for translation/formatting
  const statNames: Record<string, string> = {
    'hp': 'HP',
    'attack': 'Attack',
    'defense': 'Defense',
    'special-attack': 'Special Attack',
    'special-defense': 'Special Defense',
    'speed': 'Speed'
  };
  
  // Colors for different stats
  const statColors: Record<string, string> = {
    'hp': '#FF5959',
    'attack': '#F5AC78',
    'defense': '#FAE078',
    'special-attack': '#9DB7F5',
    'special-defense': '#A7DB8D',
    'speed': '#FA92B2'
  };
  
  return (
    <>
      <h3 className="text-lg font-medium mb-4">Base Stats</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat, index) => {
          // Format stat name
          const statName = statNames[stat.stat.name] || stat.stat.name.replace(/-/g, ' ');
          // Theoretical maximum value for stats (255 is the maximum)
          const maxStatValue = 255;
          // Percentage for the progress bar
          const percentage = Math.min(100, (stat.base_stat / maxStatValue) * 100);
          // Stat color
          const statColor = statColors[stat.stat.name] || '#6890F0';
            
          return (
            <motion.div 
              key={stat.stat.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <div className="flex justify-between mb-1">
                <span className="text-gray-300">{statName}</span>
                <span className="font-medium">{stat.base_stat}</span>
              </div>
              <div className="h-2.5 bg-gray-700 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full rounded-full"
                  style={{ backgroundColor: statColor }}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ 
                    delay: 0.5 + index * 0.1,
                    type: "spring",
                    stiffness: 50,
                    damping: 10
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}