'use client';

import { useEffect, useState } from 'react';
import { FaHeart, FaInfoCircle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import StarRating from '../stars/StarRating';
import { getPokemonRating } from '../../lib/api';
import { typeColors } from '../../utils/pokemonTypes';
import { useRouter } from 'next/navigation';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useRatings } from '../../contexts/RatingsContext';

interface Pokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    other: {
      'official-artwork': { front_default: string };
    };
  };
  types?: { type: { name: string } }[];
}

interface PokemonCardProps {
  pokemon: Pokemon;
  userId: number;
  showRating?: boolean;
  showActions?: boolean;
  highlighted?: boolean;
}

const PokemonCard = ({ 
  pokemon, 
  userId,
  showRating = true,
  showActions = true,
  highlighted = false
}: PokemonCardProps) => {
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { getRating, hasRated, setRating } = useRatings();
  
  const [currentRating, setCurrentRating] = useState<number>(0);
  const [numberOfVotes, setNumberOfVotes] = useState<number>(0);
  const [isRating, setIsRating] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Obtenir le type principal pour la couleur de gradient
  const mainType = pokemon.types?.[0]?.type.name || 'normal';
  const gradientColor = typeColors[mainType] || '#AAAAAA';

  useEffect(() => {
    const fetchRating = async () => {
      try {
        setLoading(true);
        const data = await getPokemonRating(pokemon.id);
        setCurrentRating(data.rating || 0);
        setNumberOfVotes(data.numberOfVotes || 0);
      } catch (error) {
        console.error("Error fetching rating:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRating();
  }, [pokemon.id]);

  const handleRate = async (rating: number) => {
    if (!userId) {
      toast.error('Connectez-vous pour noter ce Pokémon');
      return;
    }
    
    setIsRating(true);
    try {
      await setRating(pokemon.id, rating);
      // Mettre à jour la note moyenne
      const data = await getPokemonRating(pokemon.id);
      setCurrentRating(data.rating || 0);
      setNumberOfVotes(data.numberOfVotes || 0);
    } catch (error) {
      toast.error("Erreur lors de la notation");
    } finally {
      setIsRating(false);
    }
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêche le clic de se propager à la carte
    
    if (!userId) {
      toast.error('Connectez-vous pour ajouter aux favoris');
      return;
    }

    try {
      // Appel de la fonction du contexte
      const newStatus = await toggleFavorite(pokemon.id);
      
      // Toast de confirmation
      const pokemonName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
      if (newStatus) {
        toast.success(`${pokemonName} ajouté aux favoris!`);
      } else {
        toast.success(`${pokemonName} retiré des favoris`);
      }
    } catch (error) {
      toast.error("Une erreur s'est produite");
    }
  };

  const navigateToDetails = () => {
    router.push(`/pokemon/${pokemon.id}`);
  };

  const pokemonUserRating = getRating(pokemon.id);
  const isPokemonRated = hasRated(pokemon.id);
  const isPokemonFavorite = isFavorite(pokemon.id);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={`rounded-xl shadow-xl overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800 
        ${highlighted ? 'ring-2 ring-yellow-400' : 'border'} 
        ${isPokemonRated ? 'border-blue-500/50' : 'border-gray-700'} 
        ${isPokemonFavorite ? 'shadow-red-500/20 shadow-lg' : ''} 
        cursor-pointer relative`}
      style={{ 
        boxShadow: `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(${parseInt(gradientColor.slice(1,3), 16)}, ${parseInt(gradientColor.slice(3,5), 16)}, ${parseInt(gradientColor.slice(5,7), 16)}, 0.1)` 
      }}
      onClick={navigateToDetails}
    >
      {/* Badge de notes et favoris */}
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-between p-2">
        {isPokemonRated && (
          <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
            Noté {pokemonUserRating}/5
          </span>
        )}
        {isPokemonFavorite && (
          <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full ml-auto">
            Favori
          </span>
        )}
      </div>
      
      {/* Bouton favori */}
      {showActions && (
        <button 
          className="absolute top-2 right-2 z-10 bg-gray-800/50 rounded-full p-2 hover:bg-gray-700/70 transition"
          onClick={handleFavorite}
        >
          <FaHeart 
            className={`text-xl ${isPokemonFavorite ? 'text-red-500' : 'text-gray-300'}`} 
            id={`heart-icon-${pokemon.id}`} 
          />
        </button>
      )}

      {/* Image du Pokémon */}
      <div className="relative">
        <div 
          className="absolute inset-0 opacity-20" 
          style={{ 
            background: `radial-gradient(circle at center, ${gradientColor} 0%, transparent 70%)` 
          }}
        ></div>
        <img 
          src={pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default}
          alt={pokemon.name}
          className="w-full h-48 object-contain p-2"
        />
      </div>

      {/* Types du Pokémon */}
      {pokemon.types && (
        <div className="absolute top-10 left-2 flex gap-1">
          {pokemon.types.map((typeObj, index) => {
            const type = typeObj.type.name;
            return (
              <span 
                key={index}
                className="text-xs px-2 py-1 rounded-full text-white font-medium"
                style={{ backgroundColor: typeColors[type] || '#AAAAAA' }}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </span>
            );
          })}
        </div>
      )}

      {/* Informations du Pokémon */}
      <div className="p-4">
        <h3 className="text-xl font-bold text-center mb-2">
          {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
        </h3>
        <div className="text-center text-sm text-gray-300 mb-3">
          #{pokemon.id}
        </div>
        
        {showRating && (
          <>
            {/* Notation globale */}
            <div className="flex justify-center items-center gap-2 mb-3">
              <StarRating value={currentRating} fixed={true} size="sm" />
              <span className="text-sm">
                ({currentRating.toFixed(1)}/5, {numberOfVotes} vote{numberOfVotes !== 1 ? 's' : ''})
              </span>
            </div>
            
            {/* Ligne de séparation */}
            <div className="border-t border-gray-700 my-3"></div>
            
            {/* Notation utilisateur - Empêcher la propagation sur les étoiles */}
            {showActions && (
              <div onClick={(e) => e.stopPropagation()}>
                <div className="text-center text-sm font-medium mb-1">
                  {isPokemonRated ? (
                    <span className="text-blue-400 flex items-center justify-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Votre note: {pokemonUserRating}/5
                    </span>
                  ) : (
                    "Noter ce Pokémon"
                  )}
                </div>
                <div className="flex justify-center">
                  <StarRating 
                    value={pokemonUserRating} 
                    onChange={(val) => handleRate(val)} 
                    disabled={isRating || !userId}
                    highlight={isPokemonRated}
                  />
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Bouton pour voir les détails */}
        {showActions && (
          <div className="mt-3 text-center">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                navigateToDetails();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition w-full"
            >
              <div className="flex items-center justify-center gap-2">
                <FaInfoCircle />
                <span>Voir les détails</span>
              </div>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PokemonCard;