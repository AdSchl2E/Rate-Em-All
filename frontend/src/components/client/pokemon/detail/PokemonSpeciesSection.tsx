'use client';

import { motion } from 'framer-motion';
import { Pokemon } from '@/types/pokemon';

interface PokemonSpeciesSectionProps {
  pokemon: Pokemon;
}

/**
 * PokemonSpeciesSection component
 * Displays detailed species information about a Pokémon
 * 
 * @param {Object} props - Component props
 * @param {Pokemon} props.pokemon - Pokémon data containing species information
 */
export default function PokemonSpeciesSection({ pokemon }: PokemonSpeciesSectionProps) {
  const speciesInfo = pokemon.species_info;
  
  // If no species data is available
  if (!speciesInfo) {
    return null;
  }
  
  /**
   * Get Pokémon description in English or French if available
   * @returns {string} Formatted description text
   */
  const getDescription = () => {
    const englishEntry = speciesInfo.flavor_text_entries?.find(
      entry => entry.language.name === 'en'
    );
    const frenchEntry = speciesInfo.flavor_text_entries?.find(
      entry => entry.language.name === 'fr'
    );
    return (englishEntry || frenchEntry)?.flavor_text?.replace(/\f/g, ' ') || 'No description available';
  };
  
  /**
   * Get Pokémon genus (category)
   * @returns {string} Genus text
   */
  const getGenus = () => {
    const englishGenus = speciesInfo.genera?.find(g => g.language.name === 'en');
    const frenchGenus = speciesInfo.genera?.find(g => g.language.name === 'fr');
    return (englishGenus || frenchGenus)?.genus || '';
  };

  /**
   * Convert gender rate to female/male percentage
   * @returns {string} Formatted gender distribution text
   */
  const renderGenderRate = () => {
    if (speciesInfo.gender_rate === undefined) return 'Unknown';
    if (speciesInfo.gender_rate === -1) return 'Genderless';
    
    const femalePercent = (speciesInfo.gender_rate / 8) * 100;
    const malePercent = 100 - femalePercent;
    return `${femalePercent}% ♀ / ${malePercent}% ♂`;
  };

  /**
   * Format generation name for display
   * @param {string} gen - Raw generation name
   * @returns {string} Formatted generation name
   */
  const formatGeneration = (gen: string) => {
    if (!gen) return 'Unknown';
    const match = gen.match(/generation-([iv]+)/i);
    if (match) {
      const numeral = match[1].toUpperCase();
      return `Generation ${numeral}`;
    }
    return gen.replace('generation-', 'Generation ');
  };

  return (
    <motion.div 
      className="border-t border-gray-700 p-6 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <h3 className="text-xl font-medium mb-3">Species Information</h3>
      
      {/* Pokémon description */}
      <div className="bg-gray-750 p-4 rounded-lg">
        <p className="italic text-gray-300">{getDescription()}</p>
        {getGenus() && <p className="mt-2 text-sm text-gray-400">The {getGenus()}</p>}
      </div>
      
      {/* General information */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {/* Status */}
        <div className="bg-gray-750 p-3 rounded-lg">
          <h4 className="text-sm text-gray-400 mb-1">Status</h4>
          <div className="space-y-1">
            {speciesInfo.is_legendary && <span className="inline-block px-2 py-1 rounded bg-yellow-700 text-yellow-200 text-xs mr-1">Legendary</span>}
            {speciesInfo.is_mythical && <span className="inline-block px-2 py-1 rounded bg-purple-700 text-purple-200 text-xs mr-1">Mythical</span>}
            {speciesInfo.is_baby && <span className="inline-block px-2 py-1 rounded bg-pink-700 text-pink-200 text-xs mr-1">Baby</span>}
            {!speciesInfo.is_legendary && !speciesInfo.is_mythical && !speciesInfo.is_baby && 
              <span className="text-gray-300">Normal</span>
            }
          </div>
        </div>
        
        {/* Generation */}
        {speciesInfo.generation && (
          <div className="bg-gray-750 p-3 rounded-lg">
            <h4 className="text-sm text-gray-400 mb-1">Generation</h4>
            <div className="text-gray-300">{formatGeneration(speciesInfo.generation.name)}</div>
          </div>
        )}
        
        {/* Color */}
        {speciesInfo.color && (
          <div className="bg-gray-750 p-3 rounded-lg">
            <h4 className="text-sm text-gray-400 mb-1">Color</h4>
            <div className="text-gray-300 capitalize">{speciesInfo.color.name}</div>
          </div>
        )}
        
        {/* Shape */}
        {speciesInfo.shape && (
          <div className="bg-gray-750 p-3 rounded-lg">
            <h4 className="text-sm text-gray-400 mb-1">Shape</h4>
            <div className="text-gray-300 capitalize">{speciesInfo.shape.name}</div>
          </div>
        )}
        
        {/* Habitat */}
        {speciesInfo.habitat && (
          <div className="bg-gray-750 p-3 rounded-lg">
            <h4 className="text-sm text-gray-400 mb-1">Habitat</h4>
            <div className="text-gray-300 capitalize">{speciesInfo.habitat.name}</div>
          </div>
        )}
        
        {/* Growth rate */}
        {speciesInfo.growth_rate && (
          <div className="bg-gray-750 p-3 rounded-lg">
            <h4 className="text-sm text-gray-400 mb-1">Growth Rate</h4>
            <div className="text-gray-300 capitalize">{speciesInfo.growth_rate.name.replace('-', ' ')}</div>
          </div>
        )}
        
        {/* Gender */}
        {speciesInfo.gender_rate !== undefined && (
          <div className="bg-gray-750 p-3 rounded-lg">
            <h4 className="text-sm text-gray-400 mb-1">Gender Distribution</h4>
            <div className="text-gray-300">{renderGenderRate()}</div>
          </div>
        )}
        
        {/* Capture rate */}
        {speciesInfo.capture_rate !== undefined && (
          <div className="bg-gray-750 p-3 rounded-lg">
            <h4 className="text-sm text-gray-400 mb-1">Capture Rate</h4>
            <div className="text-gray-300">{speciesInfo.capture_rate}/255</div>
          </div>
        )}
        
        {/* Base happiness */}
        {speciesInfo.base_happiness !== undefined && (
          <div className="bg-gray-750 p-3 rounded-lg">
            <h4 className="text-sm text-gray-400 mb-1">Base Happiness</h4>
            <div className="text-gray-300">{speciesInfo.base_happiness}/255</div>
          </div>
        )}
        
        {/* Hatch counter */}
        {speciesInfo.hatch_counter !== undefined && (
          <div className="bg-gray-750 p-3 rounded-lg">
            <h4 className="text-sm text-gray-400 mb-1">Hatch Cycles</h4>
            <div className="text-gray-300">{speciesInfo.hatch_counter} ({speciesInfo.hatch_counter * 255} steps)</div>
          </div>
        )}
        
        {/* Egg groups */}
        {speciesInfo.egg_groups && speciesInfo.egg_groups.length > 0 && (
          <div className="bg-gray-750 p-3 rounded-lg">
            <h4 className="text-sm text-gray-400 mb-1">Egg Groups</h4>
            <div className="text-gray-300 capitalize">
              {speciesInfo.egg_groups.map(group => group.name).join(', ')}
            </div>
          </div>
        )}
      </div>
      
      {/* Evolution */}
      {speciesInfo.evolves_from_species && (
        <div className="bg-gray-750 p-3 rounded-lg">
          <h4 className="text-sm text-gray-400 mb-1">Evolves From</h4>
          <div className="text-gray-300 capitalize font-medium">
            {speciesInfo.evolves_from_species.name}
          </div>
        </div>
      )}
    </motion.div>
  );
}