'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HeartIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { Pokemon } from '@/types/pokemon';
import { useGlobal } from '@/providers/GlobalProvider';
import { getPokemonTypeColors } from '@/lib/utils/pokemonTypes';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { ClientStarRating } from '@/components/client/ui/ClientStarRating';
import PokemonTypeTag from './PokemonTypeTag';

interface PokemonCardProps {
  pokemon: Pokemon;
  showActions?: boolean;
  showRating?: boolean;
  viewMode?: 'grid' | 'list';
}

export default function PokemonCard({ 
  pokemon, 
  showActions = false, 
  showRating = false,
  viewMode = 'grid'
}: PokemonCardProps) {
  const { status } = useSession();
  const { 
    isFavorite, 
    toggleFavorite, 
    getRating, 
    setRating,
    cachePokemon
  } = useGlobal();
  
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const [isLoadingRating, setIsLoadingRating] = useState(false);
  const [showRatingPanel, setShowRatingPanel] = useState(false);
  
  // Utiliser les fonctions du nouveau GlobalProvider
  const isPokemonInFavorites = isFavorite(pokemon.id);
  const userRating = getRating(pokemon.id);
  
  // S'assurer que le pokemon est dans le cache
  if (pokemon) {
    cachePokemon(pokemon);
  }
  
  // Get pokemon type colors for gradient background
  const [primaryColor, secondaryColor] = getPokemonTypeColors(pokemon);
  
  // Toggle favorite status
  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (status !== 'authenticated') {
      toast.error('Connectez-vous pour ajouter des favoris');
      return;
    }
    
    try {
      setIsLoadingFavorite(true);
      
      // Utilise la fonction toggleFavorite du GlobalProvider qui inclut une mise à jour optimiste
      const isFavoriteNow = await toggleFavorite(pokemon.id);
      
      // Afficher une notification en fonction du résultat
      if (isFavoriteNow) {
        toast.success(`${pokemon.name} ajouté aux favoris`);
      } else {
        toast.success(`${pokemon.name} retiré des favoris`);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Erreur lors de la modification des favoris');
    } finally {
      setIsLoadingFavorite(false);
    }
  };
  
  // Handle rating click
  const handleRateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (status !== 'authenticated') {
      toast.error('Connectez-vous pour noter des Pokémon');
      return;
    }
    
    setShowRatingPanel(!showRatingPanel);
  };
  
  // Handle rating change
  const handleRatingChange = async (rating: number) => {
    if (status !== 'authenticated') return;
    
    try {
      setIsLoadingRating(true);
      
      // Utiliser la fonction setRating du GlobalProvider qui gère la mise à jour optimiste
      const result = await setRating(pokemon.id, rating);
      
      toast.success(`Vous avez noté ${pokemon.name} ${rating}/5`);
      setShowRatingPanel(false);
    } catch (error) {
      console.error('Error rating pokemon:', error);
      toast.error('Erreur lors de l\'enregistrement de la note');
    } finally {
      setIsLoadingRating(false);
    }
  };
  
  // Si mode liste, afficher une version horizontale de la carte
  if (viewMode === 'list') {
    return (
      <div className="p-3 flex bg-gray-800/40 hover:bg-gray-800/70 rounded-lg transition">
        <Link href={`/pokemon/${pokemon.id}`} className="flex flex-grow items-center">
          <div className="w-16 h-16 relative flex-shrink-0 mr-4">
            <Image
              src={pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default || '/images/pokeball.png'}
              width={64}
              height={64}
              alt={pokemon.name}
              className="rounded-full"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/images/pokeball.png';
              }}
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-black/10 to-black/40 pointer-events-none" />
          </div>
          
          <div className="flex-grow">
            <div className="flex items-center justify-between">
              <h3 className="font-medium capitalize">{pokemon.name}</h3>
              <span className="text-sm text-gray-400">#{pokemon.id}</span>
            </div>
            
            <div className="flex flex-wrap gap-1 mt-1">
              {pokemon.types?.map((typeObj, idx) => (
                <PokemonTypeTag
                  key={idx}
                  type={typeObj.type.name}
                  className="px-2 py-0.5 text-xs"
                />
              ))}
            </div>
          </div>
        </Link>
        
        {showActions && (
          <div className="flex flex-col justify-center gap-2 ml-4">
            <button
              onClick={handleToggleFavorite}
              className={`flex items-center justify-center p-2 rounded-full ${
                isPokemonInFavorites ? 'bg-red-500/20 text-red-500' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
              }`}
              disabled={isLoadingFavorite}
            >
              <HeartIcon className="h-5 w-5" />
            </button>
            
            {showRating && (
              <button
                onClick={handleRateClick}
                className={`flex items-center justify-center p-2 rounded-full ${
                  userRating ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <StarOutline className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
  
  // Mode grille par défaut
  return (
    <motion.div 
      className="bg-gray-900 rounded-lg overflow-hidden shadow-lg relative group"
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <div 
        className="h-32 flex items-center justify-center bg-gradient-to-br"
        style={{ backgroundColor: primaryColor }}
      >
        <div 
          className="absolute inset-0 opacity-50" 
          style={{ 
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` 
          }}
        />
        
        <Link href={`/pokemon/${pokemon.id}`} className="relative z-10">
          <Image
            src={pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default || '/images/pokeball.png'}
            width={100}
            height={100}
            alt={pokemon.name}
            className="drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/images/pokeball.png';
            }}
          />
        </Link>
        
        <div className="absolute top-2 right-2 bg-black/40 rounded p-1 text-xs font-mono text-gray-200">
          #{pokemon.id}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium capitalize">
            <Link href={`/pokemon/${pokemon.id}`} className="hover:text-blue-400 transition">
              {pokemon.name}
            </Link>
          </h3>
          
          {showActions && (
            <button
              onClick={handleToggleFavorite}
              className={`flex items-center justify-center p-1.5 rounded-full ${
                isPokemonInFavorites ? 'bg-red-500/20 text-red-500' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
              disabled={isLoadingFavorite}
            >
              <HeartIcon className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-1 mt-2">
          {pokemon.types?.map((typeObj, idx) => (
            <PokemonTypeTag
              key={idx}
              type={typeObj.type.name}
              className="px-2 py-0.5 text-xs"
            />
          ))}
        </div>
        
        {showRating && (
          <div className="mt-3 border-t border-gray-800 pt-3">
            {userRating > 0 ? (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Votre note:</span>
                <div className="flex items-center">
                  <ClientStarRating
                    value={userRating}
                    size="sm"
                    fixed={true}
                  />
                </div>
              </div>
            ) : (
              <button
                onClick={handleRateClick}
                className="w-full py-1 px-2 text-sm bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition"
              >
                Noter ce Pokémon
              </button>
            )}
            
            {showRatingPanel && (
              <div className="mt-2 p-2 bg-gray-800 rounded-md">
                <p className="text-xs text-center mb-1 text-gray-400">Sélectionnez une note:</p>
                <div className="flex justify-center">
                  <ClientStarRating
                    value={userRating}
                    onChange={handleRatingChange}
                    size="md"
                    disabled={isLoadingRating}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}