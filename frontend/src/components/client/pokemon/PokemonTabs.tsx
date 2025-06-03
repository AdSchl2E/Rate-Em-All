'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ServerStatBar } from '../../server/display/ServerStatBar';
import { pokemonType } from '../../../types/pokemon';
import { typeColors } from '../../../lib/utils/pokemonTypes';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-medium rounded-t-lg focus:outline-none ${
        active
          ? 'bg-gray-800 text-white border-b-2 border-blue-500'
          : 'text-gray-400 hover:text-gray-300'
      }`}
    >
      {children}
    </button>
  );
}

export function PokemonTabs({ pokemon }: { pokemon: pokemonType }) {
  const [activeTab, setActiveTab] = useState<'stats' | 'moves' | 'evolution'>('stats');
  
  // Fonction pour formatter les noms (première lettre majuscule)
  const formatName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');
  };
  
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      {/* Onglets */}
      <div className="flex border-b border-gray-700">
        <TabButton 
          active={activeTab === 'stats'} 
          onClick={() => setActiveTab('stats')}
        >
          Statistiques
        </TabButton>
        <TabButton 
          active={activeTab === 'moves'} 
          onClick={() => setActiveTab('moves')}
        >
          Attaques
        </TabButton>
        <TabButton 
          active={activeTab === 'evolution'} 
          onClick={() => setActiveTab('evolution')}
        >
          Évolution
        </TabButton>
      </div>
      
      {/* Contenu de l'onglet Stats */}
      {activeTab === 'stats' && (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colonne gauche: Infos de base */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Informations de base</h3>
              
              <div className="space-y-4">
                {/* Types */}
                <div>
                  <div className="text-sm text-gray-400 mb-1">Types</div>
                  <div className="flex gap-2">
                    {pokemon.types?.map((typeObj, i) => {
                      const type = typeObj.type.name;
                      return (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-full text-white text-sm font-medium"
                          style={{ backgroundColor: typeColors[type] || '#6B7280' }}
                        >
                          {formatName(type)}
                        </span>
                      );
                    })}
                  </div>
                </div>
                
                {/* Taille et poids */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Taille</div>
                    <div>{(pokemon.height / 10).toFixed(1)} m</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Poids</div>
                    <div>{(pokemon.weight / 10).toFixed(1)} kg</div>
                  </div>
                </div>
                
                {/* Capacités */}
                <div>
                  <div className="text-sm text-gray-400 mb-1">Capacités</div>
                  <div className="flex flex-wrap gap-2">
                    {pokemon.abilities?.map((abilityObj, i) => (
                      <span 
                        key={i}
                        className={`px-2 py-1 rounded bg-gray-700 text-sm ${
                          abilityObj.is_hidden ? 'border border-gray-500' : ''
                        }`}
                      >
                        {formatName(abilityObj.ability.name)}
                        {abilityObj.is_hidden && ' (Cachée)'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Colonne droite: Stats */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Statistiques</h3>
              
              <div className="space-y-3">
                {pokemon.stats?.map((statObj) => (
                  <div key={statObj.stat.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">
                        {formatName(statObj.stat.name)}
                      </span>
                      <span className="text-sm font-medium">
                        {statObj.base_stat}
                      </span>
                    </div>
                    <ServerStatBar value={statObj.base_stat} maxValue={255} statName={statObj.stat.name} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Contenu de l'onglet Attaques */}
      {activeTab === 'moves' && (
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Attaques</h3>
          
          {pokemon.moves && pokemon.moves.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
              {pokemon.moves.slice(0, 30).map((moveObj, i) => (
                <div key={i} className="bg-gray-700 p-2 rounded">
                  {formatName(moveObj.move.name)}
                </div>
              ))}
              {pokemon.moves.length > 30 && (
                <div className="col-span-full text-center text-gray-400 mt-2">
                  + {pokemon.moves.length - 30} autres attaques
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-400">Aucune attaque disponible</div>
          )}
        </div>
      )}
      
      {/* Contenu de l'onglet Évolution */}
      {activeTab === 'evolution' && (
        <div className="p-4 text-center">
          <h3 className="text-lg font-semibold mb-4">Chaîne d'évolution</h3>
          
          <div className="text-gray-400">
            Les données d'évolution ne sont pas disponibles pour le moment.
          </div>
          
          <div className="mt-4 flex justify-center">
            <Image 
              src={pokemon.sprites.other?.['official-artwork']?.front_default || 
                   pokemon.sprites.front_default || 
                   '/placeholder.png'}
              alt={pokemon.name}
              width={200}
              height={200}
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}