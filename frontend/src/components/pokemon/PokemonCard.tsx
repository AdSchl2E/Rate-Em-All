'use client';

import { useEffect, useState } from 'react';
import Button from '../buttons/Button';
import { getPokemonRating } from '../../lib/api';

interface Pokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    other: {
      'official-artwork': { front_default: string };
    };
  };
}

interface PokemonCardProps {
  pokemon: Pokemon;
  onRate: (pokemonId: number, rating: number) => void;
}

const PokemonCard = ({ pokemon, onRate }: PokemonCardProps) => {
  const [rating, setRating] = useState<number>(0);

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const data = await getPokemonRating(pokemon.id);
        if (data && typeof data.rating === 'number') {
          setRating(data.rating);
        } else {
          setRating(0);
        }
      } catch (error) {
        // En cas d'erreur, on peut afficher 0 ou ne rien faire
        console.error('Erreur lors du chargement de la note du Pokémon', error);
        setRating(0);
      }
    };
    fetchRating();
  }, [pokemon.id]);

  const handleRate = () => {
    onRate(pokemon.id, rating);
  };

  return (
    <div className="bg-gray-800 shadow-md rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <div className="text-xl">{pokemon.id}</div>
        <div className="text-xl font-bold capitalize">{pokemon.name}</div>
      </div>
      <img
        src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}
        alt={pokemon.name}
        className="mx-auto"
      />
      <p className="text-center mb-2">Note actuelle : {rating.toFixed(2)}</p>
      <input
        type="range"
        min="0"
        max="5"
        step="0.5"
        value={rating}
        onChange={(e) => setRating(parseFloat(e.target.value))}
        className="w-full mt-2"
      />
      <Button label="Rate" onClick={handleRate} />
      <Button label="Favorite" onClick={() => console.log(`Favorited ${pokemon.id}`)} />
    </div>
  );
};

export default PokemonCard;
