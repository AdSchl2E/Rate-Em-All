'use client';

import Pokemons from './Pokemons';

export default function ExplorerPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Pokémons</h1>
      <Pokemons />
    </div>
  );
}
