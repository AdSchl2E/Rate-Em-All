'use client';

import { useState } from 'react';
import { PokemonGrid } from '../pokemon/PokemonGrid';
import { Tab } from '../ui/Tab';

interface HomepageClientProps {
  topRated: Pokemon[];
  trending: Pokemon[];
}

export function HomepageClient({ topRated, trending }: HomepageClientProps) {
  const [activeTab, setActiveTab] = useState<'top' | 'trending'>('top');

  return (
    <div>
      <div className="flex space-x-2 mb-4">
        <Tab 
          active={activeTab === 'top'}
          onClick={() => setActiveTab('top')}
        >
          Les mieux notés
        </Tab>
        <Tab 
          active={activeTab === 'trending'}
          onClick={() => setActiveTab('trending')}
        >
          Tendance
        </Tab>
      </div>

      {activeTab === 'top' ? (
        <PokemonGrid pokemons={topRated} />
      ) : (
        <PokemonGrid pokemons={trending} />
      )}
    </div>
  );
}