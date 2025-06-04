'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { ClientStarRating } from '../ui/ClientStarRating';
import { Pokemon } from '../../../types/pokemon';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import { HeartIcon } from '@heroicons/react/24/solid';
import { typeColors } from '../../../lib/utils/pokemonTypes';
import { useGlobal } from '../../../providers/GlobalProvider';
import { CommunityRating } from '../ui/CommunityRating';
import { getRatingColor } from '../../../lib/utils/ratingColors';

export function PokemonDetailsClient({ pokemon: initialPokemon }: { pokemon: Pokemon }) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const { 
    isFavorite, 
    toggleFavorite, 
    getRating, 
    setRating,
    pokemonCache 
  } = useGlobal();
  
  // État local pour les données Pokémon
  const [pokemon, setPokemon] = useState<Pokemon>({
    ...initialPokemon,
    // Utiliser les infos du cache si disponibles
    rating: pokemonCache[initialPokemon.id]?.rating ?? initialPokemon.rating,
    numberOfVotes: pokemonCache[initialPokemon.id]?.numberOfVotes ?? initialPokemon.numberOfVotes
  });
  const [userRating, setUserRating] = useState(getRating(pokemon.id));
  const isPokemonFavorite = isFavorite(pokemon.id);
  
  const handleRating = async (rating: number) => {
    if (!session?.user?.id) {
      toast.error("Veuillez vous connecter pour noter ce Pokémon");
      return;
    }

    try {
      setLoading(true);
      // Récupérer directement les données retournées par setRating
      const result = await setRating(pokemon.id, rating);
      
      // Mise à jour avec les données retournées plutôt que de relire le cache
      setPokemon(prev => ({
        ...prev,
        rating: result.updatedRating, 
        numberOfVotes: result.numberOfVotes
      }));
      
      // Mettre à jour l'état local de la note utilisateur
      setUserRating(rating);
      
      toast.success(`Vous avez noté ${pokemon.name} ${rating}/5 !`);
    } catch (error) {
      toast.error("Une erreur s'est produite");
      console.error("Rating error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!session?.user?.id) {
      toast.error("Veuillez vous connecter pour ajouter aux favoris");
      return;
    }

    try {
      const newStatus = await toggleFavorite(pokemon.id);
      
      if (newStatus) {
        toast.success(`${pokemon.name} ajouté aux favoris !`);
      } else {
        toast.success(`${pokemon.name} retiré des favoris.`);
      }
    } catch (error) {
      toast.error("Une erreur s'est produite");
    }
  };
  
  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/pokemon/${pokemon.id}`);
    toast.success('Lien copié dans le presse-papier!');
  };

  // Translate and capitalize names
  const formattedName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

  return (
    <div className="animate-fade-in">
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        {/* Focus on name, image and rating */}
        <div className="md:flex">
          {/* Image section */}
          <div className="md:w-1/2 bg-gradient-to-br from-gray-800 to-gray-900 p-8 flex items-center justify-center">
            <div className="relative w-64 h-64">
              <Image
                src={pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default || '/placeholder.png'}
                alt={formattedName}
                fill
                sizes="(max-width: 768px) 300px, 600px"
                className="object-contain"
                priority
              />
            </div>
          </div>
          
          {/* Info section */}
          <div className="md:w-1/2 p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold">{formattedName}</h1>
              <span className="text-xl text-gray-400">#{pokemon.id}</span>
            </div>
            
            {/* Types */}
            <div className="flex gap-2 mb-4">
              {pokemon.types?.map((typeObj, index) => {
                const type = typeObj.type.name;
                // Capitalize type names
                const typeName = type.charAt(0).toUpperCase() + type.slice(1);
                return (
                  <span
                    key={index}
                    className="badge px-3 py-1 text-white font-medium"
                    style={{ backgroundColor: typeColors[type] }}
                  >
                    {typeName}
                  </span>
                );
              })}
            </div>
            
            {/* Rating section - Updated with new prominent CommunityRating */}
            <div className="mb-6" data-detail-pokemon-id={pokemon.id} data-rating={pokemon.rating || 0} data-votes={pokemon.numberOfVotes || 0}>
              <h3 className="text-lg font-medium mb-2">Community Rating</h3>
              <div className="flex items-center">
                <CommunityRating
                  rating={pokemon.rating || 0}
                  votes={pokemon.numberOfVotes || 0}
                  size="lg"
                  showStars={false}
                  prominent={true}
                />
              </div>
            </div>
            
            {/* User rating - Updated with color support */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Your Rating</h3>
              <ClientStarRating
                value={userRating}
                onChange={handleRating}
                size="lg"
                disabled={loading}
                useColors={true}
              />
              {!session && (
                <p className="text-sm text-gray-400 mt-2">
                  <Link href="/login" className="text-blue-400 hover:underline">Log in</Link> to rate this Pokémon
                </p>
              )}
            </div>
            
            {/* Favorite button */}
            <button 
              onClick={handleFavorite} 
              disabled={loading || !session} 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isPokemonFavorite 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              {isPokemonFavorite ? (
                <>
                  <HeartIcon className="h-5 w-5" /> 
                  Remove from Favorites
                </>
              ) : (
                <>
                  <HeartIcon className="h-5 w-5" /> 
                  Add to Favorites
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Stats below */}
        <div className="border-t border-gray-700 p-6">
          <h3 className="text-lg font-medium mb-3">Base Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            {pokemon.stats?.map((stat) => {
              // Capitalize and translate stat names
              const statName = stat.stat.name
                .replace(/-/g, ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
                
              return (
                <div key={stat.stat.name} className="flex items-center gap-2">
                  <span className="text-gray-300 w-32">{statName}</span>
                  <div className="flex-grow h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500" 
                      style={{ width: `${Math.min(100, (stat.base_stat / 255) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-gray-400 text-sm w-8 text-right">{stat.base_stat}</span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Additional info */}
        <div className="border-t border-gray-700 p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-gray-400 text-sm">Height</div>
            <div className="font-medium">{pokemon.height / 10} m</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">Weight</div>
            <div className="font-medium">{pokemon.weight / 10} kg</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">Base Experience</div>
            <div className="font-medium">{pokemon.base_experience || '?'}</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">Abilities</div>
            <div className="font-medium">
              {pokemon.abilities?.map(a => a.ability.name.charAt(0).toUpperCase() + a.ability.name.slice(1)).join(', ')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}