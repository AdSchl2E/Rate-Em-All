'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HeartIcon } from '@heroicons/react/24/solid';
import { StarIcon } from '@heroicons/react/24/solid';
import { Pokemon } from '@/types/pokemon';
import { useGlobal } from '@/providers/GlobalProvider';
import { getPokemonTypeColors } from '@/lib/utils/pokemonTypes';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { ClientStarRating } from '@/components/client/ui/ClientStarRating';
import PokemonTypeTag from './PokemonTypeTag';
import PokemonStatsSection from '../pokemon/detail/PokemonStatsSection';
import PokemonInfoSection from '../pokemon/detail/PokemonInfoSection';
import PokemonSpeciesSection from '../pokemon/detail/PokemonSpeciesSection';

// Ajouter cette fonction utilitaire en début de fichier, après les imports
function getRatingColor(rating: number) {
  if (rating < 1) return 'text-gray-400';
  if (rating < 2) return 'text-yellow-400';
  if (rating < 3) return 'text-yellow-500';
  if (rating < 3.5) return 'text-amber-500';
  if (rating < 4) return 'text-amber-600';
  if (rating < 4.5) return 'text-orange-500';
  if (rating < 5) return 'text-orange-600';
  return 'text-red-500'; // Pour 5 exactement
}

// Ajouter type pour la taille
type CardSize = 'sm' | 'md' | 'lg';
type ViewMode = 'grid' | 'list' | 'detail'; // Ajout du mode 'detail'

interface PokemonCardProps {
  pokemon: Pokemon;
  showActions?: boolean;
  showRating?: boolean;
  viewMode?: ViewMode; // Mise à jour du type
  size?: CardSize;
  onRatingUpdate?: (rating: number, votes: number) => void; // Pour mettre à jour les données parentes
}

export default function PokemonCard({
  pokemon,
  showActions = true,
  showRating = true,
  viewMode = 'grid',
  size = 'md',
  onRatingUpdate
}: PokemonCardProps) {
  const { status } = useSession();
  const { isFavorite, toggleFavorite, getRating, setRating, cachePokemon } = useGlobal();

  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const [isLoadingRating, setIsLoadingRating] = useState(false);
  const [localUserRating, setLocalUserRating] = useState(0);

  // États locaux pour les notes communautaires et nombre de votes
  const [localCommunityRating, setLocalCommunityRating] = useState(pokemon.rating || 0);
  const [localVoteCount, setLocalVoteCount] = useState(pokemon.numberOfVotes || 0);

  // Utiliser les fonctions du nouveau GlobalProvider
  const isPokemonInFavorites = isFavorite(pokemon.id);
  const userRating = getRating(pokemon.id);

  // Initialiser les états locaux avec les valeurs du Pokémon
  useEffect(() => {
    setLocalUserRating(userRating);
    setLocalCommunityRating(pokemon.rating || 0);
    setLocalVoteCount(pokemon.numberOfVotes || 0);
  }, [userRating, pokemon.rating, pokemon.numberOfVotes]);

  // Déplacer l'appel de cachePokemon dans un useEffect
  useEffect(() => {
    if (pokemon) {
      cachePokemon(pokemon);
    }
  }, [pokemon, cachePokemon]);

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

      // Notification plus discrète pour éviter de surcharger l'utilisateur
      toast.success(isFavoriteNow
        ? `${pokemon.name} ajouté aux favoris`
        : `${pokemon.name} retiré des favoris`,
        { duration: 2000 }
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Erreur lors de la modification des favoris');
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  // Handle rating change
  const handleRatingChange = async (rating: number) => {
    if (status !== 'authenticated') {
      toast.error('Connectez-vous pour noter des Pokémon');
      return;
    }

    try {
      setIsLoadingRating(true);
      setLocalUserRating(rating);

      // Utiliser la fonction setRating du GlobalProvider
      const result = await setRating(pokemon.id, rating);

      // Mettre à jour les états locaux avec les valeurs retournées par l'API
      if (result) {
        setLocalCommunityRating(result.pokemon.rating);
        setLocalVoteCount(result.pokemon.numberOfVotes);

        // Mettre à jour le Pokémon dans le cache
        cachePokemon({
          ...pokemon,
          userRating: rating,
          rating: result.pokemon.rating,
          numberOfVotes: result.pokemon.numberOfVotes
        });
        
        // Propager la mise à jour au parent si nécessaire
        if (onRatingUpdate) {
          onRatingUpdate(result.pokemon.rating, result.pokemon.numberOfVotes);
        }
      }

      // Notification plus discrète
      toast.success(`Vous avez noté ${pokemon.name} ${rating}/5`, {
        duration: 2000
      });
    } catch (error) {
      console.error('Error rating pokemon:', error);
      toast.error('Erreur lors de l\'enregistrement de la note');
      setLocalUserRating(userRating);
    } finally {
      setIsLoadingRating(false);
    }
  };

  // Définir les classes et dimensions en fonction de la taille
  const listSizeClasses = {
    sm: {
      container: "p-1.5",
      image: "w-12 h-12",
      imageSize: { width: 40, height: 40 },
      name: "text-sm",
      idBadge: "text-xs px-0.5",
      type: "px-1 py-0 text-xs",
      starSize: "sm",
      commRating: {
        container: "px-1.5 py-0.5",
        icon: "h-4 w-4 mr-0.5",
        text: "text-sm"
      },
      heartIcon: "h-3.5 w-3.5",
      gap: "gap-2"
    },
    md: {
      container: "p-2",
      image: "w-16 h-16",
      imageSize: { width: 50, height: 50 },
      name: "text-base",
      idBadge: "text-xs px-1",
      type: "px-1.5 py-0.5 text-xs",
      starSize: "md",
      commRating: {
        container: "px-2 py-1",
        icon: "h-6 w-6 mr-1",
        text: "text-base"
      },
      heartIcon: "h-4 w-4",
      gap: "gap-3"
    },
    lg: {
      container: "p-3",
      image: "w-20 h-20",
      imageSize: { width: 60, height: 60 },
      name: "text-lg",
      idBadge: "text-sm px-1.5",
      type: "px-2 py-0.5 text-sm",
      starSize: "lg",
      commRating: {
        container: "px-3 py-1.5",
        icon: "h-7 w-7 mr-1.5",
        text: "text-lg"
      },
      heartIcon: "h-5 w-5",
      gap: "gap-4"
    }
  };

  const gridSizeClasses = {
    sm: {
      imageHeight: "h-24",
      imageSize: { width: 80, height: 80 },
      container: "p-2",
      name: "text-sm",
      commRating: {
        container: "px-1.5 py-0.5",
        icon: "h-4 w-4 mr-0.5",
        text: "text-sm"
      },
      starSize: "sm"
    },
    md: {
      imageHeight: "h-32",
      imageSize: { width: 100, height: 100 },
      container: "p-4",
      name: "text-base",
      commRating: {
        container: "px-2 py-0.5",
        icon: "h-5 w-5 mr-1",
        text: "text-base"
      },
      starSize: "md"
    },
    lg: {
      imageHeight: "h-40",
      imageSize: { width: 120, height: 120 },
      container: "p-5",
      name: "text-lg",
      commRating: {
        container: "px-2.5 py-1.5",
        icon: "h-6 w-6 mr-1.5",
        text: "text-lg"
      },
      starSize: "lg"
    }
  };

  // MODE DÉTAIL - Nouveau mode pour la page principale de détail d'un Pokémon
  if (viewMode === 'detail') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 rounded-xl overflow-hidden shadow-xl"
      >
        <div className="md:flex">
          {/* Section image du Pokémon */}
          <div 
            className="md:w-1/2 p-8 flex items-center justify-center relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}40)` }}
          >
            <div className="absolute inset-0 opacity-20 bg-gradient-to-br"
                style={{ background: `radial-gradient(circle at center, ${primaryColor}, ${secondaryColor} 80%)` }}></div>
            
            <motion.div
              className="relative w-64 h-64 flex items-center justify-center z-10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 15,
                delay: 0.2
              }}
            >
              <Image
                src={pokemon.sprites.other?.['official-artwork']?.front_default || 
                      pokemon.sprites.front_default || 
                      '/images/pokeball.png'}
                alt={pokemon.name}
                fill
                sizes="(max-width: 768px) 300px, 600px"
                className="object-contain drop-shadow-2xl"
                priority
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/images/pokeball.png";
                }}
              />
            </motion.div>
          </div>
          
          {/* Section d'information */}
          <div className="md:w-1/2 p-6">
            {/* En-tête avec nom, ID, types */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-3xl font-bold capitalize">
                  {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1).replace(/-/g, ' ')}
                </h1>
                <span className="text-xl text-gray-400 font-mono">#{pokemon.id}</span>
              </div>
              
              <div className="flex gap-2">
                {pokemon.types?.map((typeObj, index) => (
                  <PokemonTypeTag key={index} type={typeObj.type.name} className="px-3 py-1 text-sm" />
                ))}
              </div>
            </div>
            
            {/* Section notation */}
            <div className="mb-6 space-y-4">
              {/* Note communautaire */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-lg font-medium mb-2">Note communautaire</h3>
                <div className="flex items-center">
                  <div className="flex items-center bg-gray-700/80 px-3 py-2 rounded-md">
                    <StarIcon className={`h-6 w-6 mr-2 ${getRatingColor(localCommunityRating)}`} />
                    <span className={`font-bold text-xl ${getRatingColor(localCommunityRating)}`}>
                      {localCommunityRating > 0 ? localCommunityRating.toFixed(1) : '0.0'}
                      <span className="ml-2 font-normal opacity-70 text-base">
                        ({localVoteCount} vote{localVoteCount !== 1 ? 's' : ''})
                      </span>
                    </span>
                  </div>
                </div>
              </motion.div>
              
              {/* Note utilisateur */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.4 }}
                className="pt-4 border-t border-gray-700"
              >
                <h3 className="text-lg font-medium mb-2">Votre évaluation</h3>
                <div>
                  <ClientStarRating
                    value={localUserRating}
                    onChange={handleRatingChange}
                    size="lg"
                    disabled={isLoadingRating}
                    useColors={true}
                  />
                  
                  {status !== 'authenticated' && (
                    <p className="text-sm text-gray-400 mt-2">
                      <Link href="/login" className="text-blue-400 hover:underline">Connectez-vous</Link> pour noter ce Pokémon
                    </p>
                  )}
                </div>
              </motion.div>
            </div>
            
            {/* Actions utilisateur (favoris, partage) */}
            <div className="flex flex-wrap gap-3">
              {/* Bouton Favoris */}
              <motion.button 
                onClick={handleToggleFavorite} 
                disabled={isLoadingFavorite || status !== 'authenticated'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  isPokemonInFavorites 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                <HeartIcon className="h-5 w-5" /> 
                {isPokemonInFavorites ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              </motion.button>
              
              {/* Autres boutons d'action peuvent être ajoutés ici */}
            </div>
          </div>
        </div>
        
        {/* Statistiques */}
        <div className="border-t border-gray-700 p-6">
          <PokemonStatsSection stats={pokemon.stats || []} />
        </div>
        
        {/* Informations supplémentaires */}
        <PokemonInfoSection pokemon={pokemon} />
        
        {/* Informations d'espèce */}
        <PokemonSpeciesSection pokemon={pokemon} />
      </motion.div>
    );
  }

  // Version liste avec taille ajustable
  if (viewMode === 'list') {
    const listClasses = listSizeClasses[size];

    return (
      <div className="bg-gray-800/40 hover:bg-gray-800/60 rounded-lg transition-all duration-200 shadow-sm">
        <div className={`flex items-center ${listClasses.container}`}>
          {/* Image avec fond coloré (à gauche) */}
          <div className="relative mr-3 flex-shrink-0">
            <div
              className={`${listClasses.image} rounded-lg flex items-center justify-center`}
              style={{
                background: `linear-gradient(135deg, ${primaryColor}50 0%, ${secondaryColor}80 100%)`
              }}
            >
              <Link href={`/pokemon/${pokemon.id}`}>
                <Image
                  src={pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default || '/images/pokeball.png'}
                  width={listClasses.imageSize.width}
                  height={listClasses.imageSize.height}
                  alt={pokemon.name}
                  className="drop-shadow-md z-10"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/images/pokeball.png';
                  }}
                />
              </Link>
              <div className={`absolute bottom-0 right-0 bg-black/40 rounded font-mono ${listClasses.idBadge} text-gray-200`}>
                #{pokemon.id}
              </div>
            </div>
          </div>

          {/* Nom et types (au centre) */}
          <div className="flex-grow">
            <Link href={`/pokemon/${pokemon.id}`} className="block">
              <h3 className={`font-medium capitalize hover:text-blue-400 transition truncate ${listClasses.name}`}>
                {pokemon.name.replace(/-/g, ' ')}
              </h3>
            </Link>

            <div className="flex flex-wrap gap-1 mt-1">
              {pokemon.types?.map((typeObj, idx) => (
                <PokemonTypeTag
                  key={idx}
                  type={typeObj.type.name}
                  className={listClasses.type}
                />
              ))}
            </div>
          </div>

          {/* Actions (à droite): Bouton favoris, note utilisateur, note communauté */}
          <div className={`flex items-center ${listClasses.gap} ml-2`}>
            {/* Bouton favoris */}
            {showActions && (
              <button
                onClick={handleToggleFavorite}
                className={`flex items-center justify-center p-1.5 rounded-full 
                  ${isPokemonInFavorites ? 'bg-red-500/90 text-white' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'}
                  transition-all duration-200 hover:scale-110`}
                disabled={isLoadingFavorite}
                title={isPokemonInFavorites ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                <HeartIcon className={listClasses.heartIcon} />
              </button>
            )}

            {/* Note utilisateur */}
            {showActions && showRating && (
              <div className="flex flex-col items-center">
                <ClientStarRating
                  value={localUserRating}
                  onChange={handleRatingChange}
                  size={listClasses.starSize as any}
                  disabled={isLoadingRating || status !== 'authenticated'}
                  useColors={true}
                />
              </div>
            )}

            {/* Note communauté - UTILISE LES VALEURS LOCALES MISES À JOUR */}
            {showRating && (
              <div className="flex flex-col items-center">
                <motion.div
                  className={`flex items-center bg-gray-800/60 rounded-md ${listClasses.commRating.container}`}
                  animate={{ scale: isLoadingRating ? [1, 1.05, 1] : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <StarIcon
                    className={`${listClasses.commRating.icon} ${getRatingColor(localCommunityRating)}`}
                  />
                  <span className={`font-bold ${listClasses.commRating.text} ${getRatingColor(localCommunityRating)}`}>
                    {localCommunityRating > 0 ? localCommunityRating.toFixed(1) : '0.0'}
                    <span className="ml-1 font-normal opacity-70 text-sm">
                      ({localVoteCount})
                    </span>
                  </span>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Mode grille
  const gridClasses = gridSizeClasses[size];

  return (
    <motion.div
      className="bg-gray-800 rounded-lg overflow-hidden shadow-lg relative group"
      whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
    >
      {/* Section image avec fond de couleur subtil */}
      <div className={`flex items-center justify-center bg-gray-850 relative ${gridClasses.imageHeight}`}>
        {/* Fond subtil avec couleur de type */}
        <div
          className="absolute inset-0 backdrop-filter backdrop-blur-sm"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}25 0%, ${secondaryColor}30 100%)`
          }}
        />

        <Link href={`/pokemon/${pokemon.id}`} className="relative z-10">
          <Image
            src={pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default || '/images/pokeball.png'}
            width={gridClasses.imageSize.width}
            height={gridClasses.imageSize.height}
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

        {/* Bouton favoris flottant */}
        {showActions && (
          <button
            onClick={handleToggleFavorite}
            className={`absolute top-2 left-2 flex items-center justify-center p-1.5 rounded-full shadow-md z-20
              ${isPokemonInFavorites
                ? 'bg-red-500/90 text-white hover:bg-red-600'
                : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700'
              } backdrop-blur-sm transition-all`}
            disabled={isLoadingFavorite}
            title={isPokemonInFavorites ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <HeartIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className={gridClasses.container}>
        <div className="flex items-center justify-between mb-2">
          <h3 className={`font-medium capitalize ${gridClasses.name}`}>
            <Link href={`/pokemon/${pokemon.id}`} className="hover:text-blue-400 transition">
              {
                size === 'sm' && pokemon.name.length > 10
                  ? `${pokemon.name.slice(0, 8).replace(/-/g, ' ')}...`
                : size === 'md' && pokemon.name.length > 11
                  ? `${pokemon.name.slice(0, 9).replace(/-/g, ' ')}...`
                : pokemon.name.replace(/-/g, ' ')
              }
            </Link>
          </h3>

          {/* Note communautaire - UTILISE LES VALEURS LOCALES MISES À JOUR */}
          {showRating && (
            <motion.div
              className={`flex items-center bg-gray-700/60 rounded-md ${gridClasses.commRating.container}`}
              animate={{ scale: isLoadingRating ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 0.3 }}
            >
              <StarIcon
                className={`${gridClasses.commRating.icon} ${getRatingColor(localCommunityRating)}`}
              />
              <span className={`font-bold ${gridClasses.commRating.text} ${getRatingColor(localCommunityRating)}`}>
                {localCommunityRating > 0 ? localCommunityRating.toFixed(1) : '0.0'}
                <span className="ml-1 font-normal opacity-70 text-xs">
                  ({localVoteCount})
                </span>
              </span>
            </motion.div>
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

        {/* Section de notation utilisateur */}
        {showRating && (
          <div className="mt-3 border-t border-gray-700 pt-3">
            <div className="flex items-center justify-center">
              <ClientStarRating
                value={localUserRating}
                onChange={handleRatingChange}
                size={gridClasses.starSize as any}
                disabled={isLoadingRating || status !== 'authenticated'}
                useColors={true}
              />
            </div>
            {status !== 'authenticated' && (
              <p className="text-xs text-gray-500 mt-1 text-center">
                <Link href="/login" className="text-blue-400 hover:underline">
                  Connectez-vous
                </Link> pour noter
              </p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}