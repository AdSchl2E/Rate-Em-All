'use client';

import { useEffect, useState } from 'react';
import { FaHeart } from 'react-icons/fa'; // Icône de cœur
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
  userId: number;
  onRate: (userId: number, pokedexId: number, rating: number) => Promise<void>;
  onFavorite: (userId: number, pokedexId: number) => Promise<void>;
}

const PokemonCard = ({ pokemon, userId, onRate, onFavorite }: PokemonCardProps) => {
  const [currentRating, setCurrentRating] = useState<number>(0); // Note affichée
  const [userRating, setUserRating] = useState<number>(0); // Note sélectionnée
  const [numberOfVotes, setNumberOfVotes] = useState<number>(0);
  const [isFavorite, setIsFavorite] = useState<boolean>(false); // État du favori

  const fetchRating = async () => {
    try {
      const data = await getPokemonRating(pokemon.id);
      if (data && typeof data.rating === 'number') {
        setCurrentRating(data.rating);
        setNumberOfVotes(data.numberOfVotes);
        setIsFavorite(data.isFavorite ?? false); // Vérifie si c'est un favori
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la note du Pokémon', error);
    }
  };

  useEffect(() => {
    fetchRating();
  }, [pokemon.id]);

  const handleRate = async () => {
    await onRate(userId, pokemon.id, userRating);
    fetchRating(); // Récupère la note globale mise à jour après notation
  };

  const handleFavorite = async () => {
      await onFavorite(userId, pokemon.id);
      setIsFavorite((prev) => !prev); // Inverse l'état actuel du favori
  };

  return (
    <div className="bg-gray-800 shadow-md rounded-lg p-4 relative">
      <div className="flex justify-between items-center mb-2">
        <div className="text-xl">{pokemon.id}</div>
        <div className="text-xl font-bold capitalize">{pokemon.name}</div>

        {/* Icône de cœur pour ajouter/enlever des favoris */}
        <button onClick={handleFavorite} className="focus:outline-none">
          <FaHeart className={`text-2xl transition-colors ${isFavorite ? 'text-red-500' : 'text-gray-400'}`} />
        </button>
      </div>

      <img
        src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}
        alt={pokemon.name}
        className="mx-auto"
      />

      <p className="text-center my-2 text-yellow-400 text-lg font-semibold">
        Note actuelle : {currentRating.toFixed(2)} ⭐
      </p>
      <p>Nombre de votes : ({numberOfVotes})</p>

      <div className="flex flex-col items-center">
        <input
          type="range"
          min="0"
          max="5"
          step="0.5"
          value={userRating}
          onChange={(e) => setUserRating(parseFloat(e.target.value))}
          className="w-full mt-2"
        />
        <span className="text-sm text-gray-300">Votre note : {userRating.toFixed(1)}</span>
      </div>

      <Button label="Rate" onClick={handleRate} />
    </div>
  );
};

export default PokemonCard;
