'use client';

import PokemonList from './PokemonList';

export default function ExplorerPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Pokémons</h1>
      <PokemonList />
    </div>
  );
}
