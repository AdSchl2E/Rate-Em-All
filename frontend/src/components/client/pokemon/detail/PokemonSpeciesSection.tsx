'use client';

import { motion } from 'framer-motion';
import { Pokemon } from '@/types/pokemon';

interface PokemonSpeciesSectionProps {
  pokemon: Pokemon;
}

export default function PokemonSpeciesSection({ pokemon }: PokemonSpeciesSectionProps) {
  const speciesInfo = pokemon.species_info;
  
  // Si aucune donnée d'espèce n'est disponible
  if (!speciesInfo) {
    return null;
  }
  
  // Récupère une description en français si disponible, sinon en anglais
  const getDescription = () => {
    const frenchEntry = speciesInfo.flavor_text_entries?.find(
      entry => entry.language.name === 'fr'
    );
    const englishEntry = speciesInfo.flavor_text_entries?.find(
      entry => entry.language.name === 'en'
    );
    return (frenchEntry || englishEntry)?.flavor_text?.replace(/\f/g, ' ') || 'Description non disponible';
  };
  
  // Récupère le genre du Pokémon (catégorie)
  const getGenus = () => {
    const frenchGenus = speciesInfo.genera?.find(g => g.language.name === 'fr');
    const englishGenus = speciesInfo.genera?.find(g => g.language.name === 'en');
    return (frenchGenus || englishGenus)?.genus || '';
  };

  // Conversion du taux de genre en pourcentage femelle/mâle
  const renderGenderRate = () => {
    if (speciesInfo.gender_rate === undefined) return 'Inconnu';
    if (speciesInfo.gender_rate === -1) return 'Sans genre';
    
    const femalePercent = (speciesInfo.gender_rate / 8) * 100;
    const malePercent = 100 - femalePercent;
    return `${femalePercent}% ♀ / ${malePercent}% ♂`;
  };

  // Formatage du nom de génération
  const formatGeneration = (gen: string) => {
    if (!gen) return 'Inconnue';
    const match = gen.match(/generation-([iv]+)/i);
    if (match) {
      const numeral = match[1].toUpperCase();
      return `Génération ${numeral}`;
    }
    return gen.replace('generation-', 'Génération ');
  };

  return (
    <motion.div 
      className="border-t border-gray-700 p-6 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <h3 className="text-xl font-medium mb-3">Informations sur l'espèce</h3>
      
      {/* Description du Pokémon */}
      <div className="bg-gray-750 p-4 rounded-lg">
        <p className="italic text-gray-300">{getDescription()}</p>
        {getGenus() && <p className="mt-2 text-sm text-gray-400">Pokémon {getGenus()}</p>}
      </div>
      
      {/* Informations générales */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {/* Statut */}
        <div className="bg-gray-750 p-3 rounded-lg">
          <h4 className="text-sm text-gray-400 mb-1">Statut</h4>
          <div className="space-y-1">
            {speciesInfo.is_legendary && <span className="inline-block px-2 py-1 rounded bg-yellow-700 text-yellow-200 text-xs mr-1">Légendaire</span>}
            {speciesInfo.is_mythical && <span className="inline-block px-2 py-1 rounded bg-purple-700 text-purple-200 text-xs mr-1">Mythique</span>}
            {speciesInfo.is_baby && <span className="inline-block px-2 py-1 rounded bg-pink-700 text-pink-200 text-xs mr-1">Bébé</span>}
            {!speciesInfo.is_legendary && !speciesInfo.is_mythical && !speciesInfo.is_baby && 
              <span className="text-gray-300">Normal</span>
            }
          </div>
        </div>
        
        {/* Génération */}
        {speciesInfo.generation && (
          <div className="bg-gray-750 p-3 rounded-lg">
            <h4 className="text-sm text-gray-400 mb-1">Génération</h4>
            <div className="text-gray-300">{formatGeneration(speciesInfo.generation.name)}</div>
          </div>
        )}
        
        {/* Couleur */}
        {speciesInfo.color && (
          <div className="bg-gray-750 p-3 rounded-lg">
            <h4 className="text-sm text-gray-400 mb-1">Couleur</h4>
            <div className="text-gray-300 capitalize">{speciesInfo.color.name}</div>
          </div>
        )}
        
        {/* Forme */}
        {speciesInfo.shape && (
          <div className="bg-gray-750 p-3 rounded-lg">
            <h4 className="text-sm text-gray-400 mb-1">Forme</h4>
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
        
        {/* Taux de croissance */}
        {speciesInfo.growth_rate && (
          <div className="bg-gray-750 p-3 rounded-lg">
            <h4 className="text-sm text-gray-400 mb-1">Taux de croissance</h4>
            <div className="text-gray-300 capitalize">{speciesInfo.growth_rate.name.replace('-', ' ')}</div>
          </div>
        )}
        
        {/* Genre */}
        {speciesInfo.gender_rate !== undefined && (
          <div className="bg-gray-750 p-3 rounded-lg">
            <h4 className="text-sm text-gray-400 mb-1">Répartition des genres</h4>
            <div className="text-gray-300">{renderGenderRate()}</div>
          </div>
        )}
        
        {/* Taux de capture */}
        {speciesInfo.capture_rate !== undefined && (
          <div className="bg-gray-750 p-3 rounded-lg">
            <h4 className="text-sm text-gray-400 mb-1">Taux de capture</h4>
            <div className="text-gray-300">{speciesInfo.capture_rate}/255</div>
          </div>
        )}
        
        {/* Bonheur de base */}
        {speciesInfo.base_happiness !== undefined && (
          <div className="bg-gray-750 p-3 rounded-lg">
            <h4 className="text-sm text-gray-400 mb-1">Bonheur de base</h4>
            <div className="text-gray-300">{speciesInfo.base_happiness}/255</div>
          </div>
        )}
        
        {/* Éclosion */}
        {speciesInfo.hatch_counter !== undefined && (
          <div className="bg-gray-750 p-3 rounded-lg">
            <h4 className="text-sm text-gray-400 mb-1">Cycles pour éclore</h4>
            <div className="text-gray-300">{speciesInfo.hatch_counter} ({speciesInfo.hatch_counter * 255} pas)</div>
          </div>
        )}
        
        {/* Groupes d'œufs */}
        {speciesInfo.egg_groups && speciesInfo.egg_groups.length > 0 && (
          <div className="bg-gray-750 p-3 rounded-lg">
            <h4 className="text-sm text-gray-400 mb-1">Groupes d'œufs</h4>
            <div className="text-gray-300 capitalize">
              {speciesInfo.egg_groups.map(group => group.name).join(', ')}
            </div>
          </div>
        )}
      </div>
      
      {/* Évolution */}
      {speciesInfo.evolves_from_species && (
        <div className="bg-gray-750 p-3 rounded-lg">
          <h4 className="text-sm text-gray-400 mb-1">Évolue de</h4>
          <div className="text-gray-300 capitalize font-medium">
            {speciesInfo.evolves_from_species.name}
          </div>
        </div>
      )}
    </motion.div>
  );
}