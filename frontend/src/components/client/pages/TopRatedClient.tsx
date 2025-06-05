'use client';

import { useState, useMemo, useEffect } from 'react';
import { ClientPokemonCard } from '../pokemon/ClientPokemonCard';
import { Pokemon } from '../../../types/pokemon';
import { typeColors } from '../../../lib/utils/pokemonTypes';
import { StarIcon, TrophyIcon, AdjustmentsHorizontalIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { ClientStarRating } from '../ui/ClientStarRating';
import Image from 'next/image';
import Link from 'next/link';
import { useGlobal } from '../../../providers/GlobalProvider';
import { CommunityRating } from '../ui/CommunityRating';
import { fetchTopRated } from '../../../lib/api-server/pokemon';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';

// Pokémon generations with their Pokedex ranges
const GENERATIONS = [
  { name: 'Génération I', range: [1, 151] },
  { name: 'Génération II', range: [152, 251] },
  { name: 'Génération III', range: [252, 386] },
  { name: 'Génération IV', range: [387, 493] },
  { name: 'Génération V', range: [494, 649] },
  { name: 'Génération VI', range: [650, 721] },
  { name: 'Génération VII', range: [722, 809] },
  { name: 'Génération VIII', range: [810, 898] },
  { name: 'Génération IX', range: [899, 1010] },
];

// Special categories of Pokémon
const SPECIAL_CATEGORIES = [
  { id: 'legendary', name: 'Légendaire' },
  { id: 'mythical', name: 'Mythique' },
  { id: 'starter', name: 'Starter' },
  { id: 'mega', name: 'Méga-Évolution' },
  { id: 'gmax', name: 'Gigamax' },
  { id: 'alolan', name: "Forme d'Alola" },
  { id: 'galarian', name: 'Forme de Galar' },
  { id: 'hisuian', name: 'Forme de Hisui' }
];

// Rating options
const RATING_OPTIONS = [
  { value: 4, label: '4★+' },
  { value: 4.5, label: '4.5★+' },
  { value: 4.8, label: '4.8★+' }
];

interface TopRatedClientProps {
  initialPokemons: Pokemon[];
}

export function TopRatedClient({ initialPokemons }: TopRatedClientProps) {
  const [sortBy, setSortBy] = useState<'rating' | 'votes' | 'name'>('rating');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedGenerations, setSelectedGenerations] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const { pokemonCache, userRatings } = useGlobal();
  const { data: session } = useSession();
  
  // État pour l'animation du podium
  const [animationComplete, setAnimationComplete] = useState(false);
  
  // State for storing all Pokémon data (initial + any updates)
  const [allPokemons, setAllPokemons] = useState<Pokemon[]>(initialPokemons);
  
  // Track user ratings changes to trigger refresh when needed
  const [lastRatingTimestamp, setLastRatingTimestamp] = useState<number>(0);
  
  // Effect to refresh data when a rating changes
  useEffect(() => {
    const refreshTopRated = async () => {
      try {
        if (lastRatingTimestamp > 0) {
          console.log('Refreshing top rated Pokémon after new rating');
          const freshTopRated = await fetchTopRated(50);
          setAllPokemons(freshTopRated);
        }
      } catch (error) {
        console.error('Failed to refresh top rated Pokémon:', error);
      }
    };

    refreshTopRated();
  }, [lastRatingTimestamp]);
  
  // Watch for changes in userRatings to detect new ratings
  useEffect(() => {
    setLastRatingTimestamp(Date.now());
  }, [userRatings]);
  
  // Extraire tous les types uniques de Pokémon
  const pokemonTypes = useMemo(() => {
    const types = new Set<string>();
    
    allPokemons.forEach(pokemon => {
      pokemon.types?.forEach(typeObj => {
        types.add(typeObj.type.name);
      });
    });
    
    return Array.from(types).sort();
  }, [allPokemons]);
  
  // Préparer les Pokémon avec les données du cache
  const enhancedPokemons = useMemo(() => {
    return allPokemons.map(pokemon => ({
      ...pokemon,
      rating: pokemonCache[pokemon.id]?.rating ?? pokemon.rating,
      numberOfVotes: pokemonCache[pokemon.id]?.numberOfVotes ?? pokemon.numberOfVotes
    }));
  }, [allPokemons, pokemonCache]);
  
  // Gestionnaire de tri
  const handleSortChange = (criteria: 'rating' | 'votes' | 'name') => {
    if (sortBy === criteria) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(criteria);
      // Par défaut, tri décroissant pour rating et votes, croissant pour name
      setSortDirection(criteria === 'name' ? 'asc' : 'desc');
    }
  };
  
  // Toggle type selection
  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };

  const toggleGeneration = (genIndex: number) => {
    setSelectedGenerations(prev =>
      prev.includes(genIndex)
        ? prev.filter(g => g !== genIndex)
        : [...prev, genIndex]
    );
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSelectedTypes([]);
    setSelectedGenerations([]);
    setSelectedCategories([]);
    setMinRating(null);
    setSortBy('rating');
    setSortDirection('desc');
  };
  
  // Filtrer et trier les Pokémon
  const displayedPokemons = useMemo(() => {
    // Filtrer d'abord
    let filtered = enhancedPokemons.filter(pokemon => {
      // Type filter
      if (selectedTypes.length > 0) {
        const pokemonTypes = pokemon.types?.map(t => t.type.name) || [];
        if (!selectedTypes.every(type => pokemonTypes.includes(type))) {
          return false;
        }
      }
      
      // Generation filter
      if (selectedGenerations.length > 0) {
        const genMatch = selectedGenerations.some(genIndex => {
          const gen = GENERATIONS[genIndex];
          return pokemon.id >= gen.range[0] && pokemon.id <= gen.range[1];
        });
        if (!genMatch) return false;
      }
      
      // Special categories filter
      if (selectedCategories.length > 0) {
        const legendaryIds = [144, 145, 146, 150, 243, 244, 245, 249, 250, 377, 378, 379, 380, 381, 382, 383, 384, 480, 481, 482, 483, 484, 485, 486, 487, 488, 638, 639, 640, 641, 642, 643, 644, 645, 646, 716, 717, 718, 772, 773, 785, 786, 787, 788, 789, 790, 791, 792, 800, 888, 889, 890, 891, 892, 894, 895, 896, 897, 898];
        const mythicalIds = [151, 251, 385, 386, 489, 490, 491, 492, 493, 494, 647, 648, 649, 719, 720, 721, 801, 802, 807, 808, 809, 893];
        const starterIds = [1, 4, 7, 152, 155, 158, 252, 255, 258, 387, 390, 393, 495, 498, 501, 650, 653, 656, 722, 725, 728, 810, 813, 816, 906, 909, 912];

        const isLegendary = legendaryIds.includes(pokemon.id);
        const isMythical = mythicalIds.includes(pokemon.id);
        const isStarter = starterIds.includes(pokemon.id);
        
        const pokemonName = pokemon.name.toLowerCase();
        const isMega = pokemonName.includes('mega');
        const isGmax = pokemonName.includes('gmax') || pokemonName.includes('gigantamax');
        const isAlolan = pokemonName.includes('-alola');
        const isGalarian = pokemonName.includes('-galar');
        const isHisuian = pokemonName.includes('-hisui');

        const categoryMatches = {
          legendary: isLegendary,
          mythical: isMythical,
          starter: isStarter,
          mega: isMega,
          gmax: isGmax,
          alolan: isAlolan,
          galarian: isGalarian,
          hisuian: isHisuian
        };
        
        if (!selectedCategories.some(cat => categoryMatches[cat as keyof typeof categoryMatches])) {
          return false;
        }
      }
      
      // Rating filter
      if (minRating !== null) {
        const pokemonRating = pokemon.rating || 0;
        if (pokemonRating < minRating) return false;
      }
      
      return true;
    });
    
    // Puis trier
    const directionFactor = sortDirection === 'asc' ? 1 : -1;
    
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return directionFactor * ((a.rating || 0) - (b.rating || 0));
        case 'votes':
          return directionFactor * ((a.numberOfVotes || 0) - (b.numberOfVotes || 0));
        case 'name':
          return directionFactor * a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [enhancedPokemons, selectedTypes, selectedGenerations, selectedCategories, minRating, sortBy, sortDirection]);

  // Limiter aux 10 premiers résultats
  const topTenPokemons = displayedPokemons.slice(0, 10);
  
  // Séparation pour le podium et la liste
  const podiumPokemons = topTenPokemons.slice(0, 3);
  const listPokemons = topTenPokemons.slice(3, 10);
  
  const isFiltering = selectedTypes.length > 0 || 
                     selectedGenerations.length > 0 || 
                     selectedCategories.length > 0 ||
                     minRating !== null;
  
  // Animation variants pour Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.3,
        delayChildren: 0.3,
        when: "beforeChildren"
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 100,
        damping: 12
      }
    }
  };
  
  const medalVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: { 
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: 0.5
      }
    }
  };
  
  const imageVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 100,
        delay: 0.8
      }
    },
    hover: {
      scale: 1.1,
      transition: { type: "spring", stiffness: 400, damping: 10 }
    }
  };
  
  // Animation de confettis autour du 1er
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="mt-12 animate-fade-in">
      {/* Filtres et options de tri */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          {/* Options de tri principales */}
          <div className="bg-gray-800 rounded-lg p-3 flex items-center gap-2 flex-grow">
            <span className="text-sm text-gray-400 mr-2">Trier par:</span>
            {[
              { id: 'rating', label: 'Note' },
              { id: 'votes', label: 'Votes' },
            ].map((option) => (
              <button
                key={option.id}
                className={`px-3 py-1 rounded-full text-sm flex items-center gap-1
                  ${sortBy === option.id
                    ? (option.id === 'rating' ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-medium' : 'bg-blue-600 text-white')
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                onClick={() => handleSortChange(option.id as 'rating' | 'votes' | 'name')}
              >
                <span>{option.label}</span>
                {sortBy === option.id && (
                  sortDirection === 'asc'
                    ? <ArrowUpIcon className="h-3 w-3" />
                    : <ArrowDownIcon className="h-3 w-3" />
                )}
              </button>
            ))}
          </div>
          
          {/* Toggle button for filters */}
          <button
            className={`flex items-center gap-2 px-4 py-3 rounded-lg whitespace-nowrap transition
              ${showFilters ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
            Filtres {isFiltering && `(${selectedTypes.length + selectedGenerations.length + selectedCategories.length + (minRating !== null ? 1 : 0)})`}
          </button>
        </div>
        
        {/* Expanded filter options */}
        {showFilters && (
          <div className="bg-gray-800 rounded-lg p-4 shadow-lg space-y-6 mt-2">
            
            {/* Type filters */}
            <div>
              <h3 className="font-medium mb-2 text-gray-300">Types</h3>
              <div className="flex flex-wrap gap-2">
                {pokemonTypes.map(type => (
                  <button
                    key={type}
                    className={`px-3 py-1 rounded-full text-sm capitalize transition-colors
                      ${selectedTypes.includes(type)
                        ? `bg-opacity-90 text-white`
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    style={{
                      backgroundColor: selectedTypes.includes(type) 
                        ? typeColors[type]
                        : undefined
                    }}
                    onClick={() => toggleType(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Generation filters */}
            <div>
              <h3 className="font-medium mb-2 text-gray-300">Génération</h3>
              <div className="flex flex-wrap gap-2">
                {GENERATIONS.map((gen, index) => (
                  <button
                    key={gen.name}
                    className={`px-3 py-1 rounded-full text-sm
                      ${selectedGenerations.includes(index)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    onClick={() => toggleGeneration(index)}
                  >
                    {gen.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Special categories */}
            <div>
              <h3 className="font-medium mb-2 text-gray-300">Catégories</h3>
              <div className="flex flex-wrap gap-2">
                {SPECIAL_CATEGORIES.map(category => (
                  <button
                    key={category.id}
                    className={`px-3 py-1 rounded-full text-sm
                      ${selectedCategories.includes(category.id)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    onClick={() => toggleCategory(category.id)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Reset filters button */}
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                onClick={resetFilters}
              >
                Réinitialiser les filtres
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* PODIUM DES MEILLEURS - ANIMATED VERSION */}
      {podiumPokemons.length > 0 && (
        <motion.div 
          className="mb-16 mt-32"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          onAnimationComplete={() => setAnimationComplete(true)}
        >
          
          {/* Confetti animation container */}
          <div className="relative mx-auto max-w-5xl">
            {animationComplete && (
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-50">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
                  <div className="animate-confetti-1 absolute w-2 h-2 bg-yellow-300 rounded-full"></div>
                  <div className="animate-confetti-2 absolute w-3 h-3 bg-blue-400 rounded-full"></div>
                  <div className="animate-confetti-3 absolute w-2 h-2 bg-red-400 rounded-full"></div>
                  <div className="animate-confetti-4 absolute w-4 h-1 bg-green-400"></div>
                  <div className="animate-confetti-5 absolute w-2 h-2 bg-purple-400 rounded-full"></div>
                  <div className="animate-confetti-6 absolute w-3 h-3 bg-pink-400 rounded-full"></div>
                </div>
              </div>
            )}
            
            <div className="flex flex-col md:flex-row justify-center items-end gap-4 mx-auto">
              {/* 2ème place - maintenant à gauche */}
              {podiumPokemons.length >= 2 && (
                <motion.div 
                  className="order-1 md:order-0 w-full md:w-1/3 flex flex-col items-center"
                  variants={itemVariants}
                >
                  
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-t-xl w-full p-4 pt-0 relative border border-gray-700">
                    <motion.div 
                      className="h-32 flex items-center justify-center -mt-16"
                      variants={imageVariants}
                      whileHover="hover"
                    >
                      <Link href={`/pokemon/${podiumPokemons[1]?.id}`}>
                        <div className="relative group">
                          <div className="absolute -inset-1 bg-gradient-to-r from-gray-200 to-gray-400 rounded-full opacity-30 group-hover:opacity-100 blur-md transition duration-1000"></div>
                          <Image
                            src={podiumPokemons[1]?.sprites.other?.['official-artwork']?.front_default || podiumPokemons[1]?.sprites.front_default || '/images/pokeball.png'}
                            width={120}
                            height={120}
                            alt={podiumPokemons[1]?.name || ''}
                            className="drop-shadow-xl relative z-10"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/images/pokeball.png";
                            }}
                          />
                        </div>
                      </Link>
                    </motion.div>
                    
                    <motion.h3 
                      className="text-center text-xl font-semibold capitalize mb-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.2 }}
                    >
                      <Link href={`/pokemon/${podiumPokemons[1]?.id}`} className="hover:text-blue-400 transition">
                        {podiumPokemons[1]?.name}
                      </Link>
                    </motion.h3>
                    
                    <motion.div 
                      className="flex justify-center mb-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.3 }}
                    >
                      {podiumPokemons[1]?.types?.map((typeObj, idx) => {
                        const type = typeObj.type.name;
                        return (
                          <span
                            key={idx}
                            className="badge px-2 py-1 text-xs text-white font-medium mx-1"
                            style={{ backgroundColor: typeColors[type] }}
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </span>
                        );
                      })}
                    </motion.div>
                    
                    <motion.div 
                      className="flex justify-center items-center"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.4 }}
                    >
                      <CommunityRating
                        rating={podiumPokemons[1]?.rating || 0}
                        votes={podiumPokemons[1]?.numberOfVotes || 0}
                        size="md"
                        showStars={false}
                      />
                    </motion.div>
                    
                    {/* Après le bloc de CommunityRating, ajouter la note personnelle: */}
                    <motion.div 
                      className="flex justify-center items-center mt-2"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.5 }}
                    >
                      {userRatings[podiumPokemons[1]?.id] ? (
                        <div className="flex flex-col items-center">
                          <div className="flex items-center">
                            <ClientStarRating 
                              value={userRatings[podiumPokemons[1]?.id]} 
                              size="sm" 
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 italic">Vous n'avez pas encore noté ce Pokémon</div>
                      )}
                    </motion.div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-gray-600 to-gray-700 h-24 w-full rounded-b-xl flex items-center justify-center overflow-hidden relative">
                    <div className="absolute inset-0 bg-[url('/images/silver-texture.jpg')] opacity-20 bg-cover mix-blend-overlay"></div>
                    <div className="text-2xl font-bold text-gray-300">2</div>
                  </div>
                </motion.div>
              )}
              
              {/* 1ère place - maintenant au milieu */}
              {podiumPokemons.length >= 1 && (
                <motion.div 
                  className="order-0 md:order-1 w-full md:w-1/3 flex flex-col items-center mb-0 md:-mb-6 z-10"
                  variants={itemVariants}
                >
                  
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-t-xl w-full p-4 pt-0 relative shadow-xl border border-yellow-500/50">
                    <motion.div 
                      className="h-36 flex items-center justify-center -mt-20"
                      variants={imageVariants}
                      whileHover="hover"
                    >
                      <Link href={`/pokemon/${podiumPokemons[0]?.id}`}>
                        <div className="relative group">
                          <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-full opacity-40 group-hover:opacity-80 blur-md transition duration-1000 animate-pulse"></div>
                          <Image
                            src={podiumPokemons[0]?.sprites.other?.['official-artwork']?.front_default || podiumPokemons[0]?.sprites.front_default || '/images/pokeball.png'}
                            width={140}
                            height={140}
                            alt={podiumPokemons[0]?.name || ''}
                            className="drop-shadow-xl relative z-10"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/images/pokeball.png";
                            }}
                          />
                        </div>
                      </Link>
                    </motion.div>
                    
                    <motion.h3 
                      className="text-center text-2xl font-bold capitalize mb-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.2 }}
                    >
                      <Link href={`/pokemon/${podiumPokemons[0]?.id}`} className="hover:text-blue-400 transition bg-gradient-to-r from-yellow-200 to-amber-400 text-transparent bg-clip-text">
                        {podiumPokemons[0]?.name}
                      </Link>
                    </motion.h3>
                    
                    <motion.div 
                      className="flex justify-center mb-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.3 }}
                    >
                      {podiumPokemons[0]?.types?.map((typeObj, idx) => {
                        const type = typeObj.type.name;
                        return (
                          <span
                            key={idx}
                            className="badge px-3 py-1 text-white font-medium mx-1"
                            style={{ backgroundColor: typeColors[type] }}
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </span>
                        );
                      })}
                    </motion.div>
                    
                    <motion.div 
                      className="flex justify-center items-center"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.4 }}
                    >
                      <CommunityRating
                        rating={podiumPokemons[0]?.rating || 0}
                        votes={podiumPokemons[0]?.numberOfVotes || 0}
                        size="lg"
                        showStars={false}
                      />
                    </motion.div>
                    
                    {/* Après le bloc de CommunityRating, ajouter la note personnelle: */}
                    <motion.div 
                      className="flex justify-center items-center mt-2"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.5 }}
                    >
                      {userRatings[podiumPokemons[0]?.id] ? (
                        <div className="flex flex-col items-center">
                          <div className="flex items-center">
                            <ClientStarRating 
                              value={userRatings[podiumPokemons[0]?.id]} 
                              size="md" 
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 italic">Vous n'avez pas encore noté ce Pokémon</div>
                      )}
                    </motion.div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-yellow-600 to-amber-700 h-32 w-full rounded-b-xl flex items-center justify-center overflow-hidden relative">
                    <div className="absolute inset-0 bg-[url('/images/gold-texture.jpg')] opacity-30 bg-cover mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-yellow-400/20 to-transparent"></div>
                    <div className="text-3xl font-bold text-white">1</div>
                  </div>
                </motion.div>
              )}
              
              {/* 3ème place - maintenant à droite */}
              {podiumPokemons.length >= 3 && (
                <motion.div 
                  className="order-2 md:order-2 w-full md:w-1/3 flex flex-col items-center"
                  variants={itemVariants}
                >
                  
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-t-xl w-full p-4 pt-0 relative border border-amber-700/50">
                    <motion.div 
                      className="h-28 flex items-center justify-center -mt-14"
                      variants={imageVariants}
                      whileHover="hover"
                    >
                      <Link href={`/pokemon/${podiumPokemons[2]?.id}`}>
                        <div className="relative group">
                          <div className="absolute -inset-1 bg-gradient-to-r from-amber-700 to-amber-900 rounded-full opacity-30 group-hover:opacity-100 blur-md transition duration-1000"></div>
                          <Image
                            src={podiumPokemons[2]?.sprites.other?.['official-artwork']?.front_default || podiumPokemons[2]?.sprites.front_default || '/images/pokeball.png'}
                            width={100}
                            height={100}
                            alt={podiumPokemons[2]?.name || ''}
                            className="drop-shadow-xl relative z-10"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/images/pokeball.png";
                            }}
                          />
                        </div>
                      </Link>
                    </motion.div>
                    
                    <motion.h3 
                      className="text-center text-lg font-medium capitalize mb-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.2 }}
                    >
                      <Link href={`/pokemon/${podiumPokemons[2]?.id}`} className="hover:text-blue-400 transition">
                        {podiumPokemons[2]?.name}
                      </Link>
                    </motion.h3>
                    
                    <motion.div 
                      className="flex justify-center mb-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.3 }}
                    >
                      {podiumPokemons[2]?.types?.map((typeObj, idx) => {
                        const type = typeObj.type.name;
                        return (
                          <span
                            key={idx}
                            className="badge px-2 py-0.5 text-xs text-white font-medium mx-1"
                            style={{ backgroundColor: typeColors[type] }}
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </span>
                        );
                      })}
                    </motion.div>
                    
                    <motion.div 
                      className="flex justify-center items-center"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.4 }}
                    >
                      <CommunityRating
                        rating={podiumPokemons[2]?.rating || 0}
                        votes={podiumPokemons[2]?.numberOfVotes || 0}
                        size="md"
                        showStars={false}
                      />
                    </motion.div>
                    
                    {/* Après le bloc de CommunityRating, ajouter la note personnelle: */}
                    <motion.div 
                      className="flex justify-center items-center mt-2"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.5 }}
                    >
                      {userRatings[podiumPokemons[2]?.id] ? (
                        <div className="flex flex-col items-center">
                          <div className="flex items-center">
                            <ClientStarRating 
                              value={userRatings[podiumPokemons[2]?.id]} 
                              size="sm" 
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 italic">Vous n'avez pas encore noté ce Pokémon</div>
                      )}
                    </motion.div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-amber-800 to-amber-900 h-20 w-full rounded-b-xl flex items-center justify-center overflow-hidden relative">
                    <div className="absolute inset-0 bg-[url('/images/bronze-texture.jpg')] opacity-20 bg-cover mix-blend-overlay"></div>
                    <div className="text-xl font-bold text-amber-200">3</div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
      
      {/* LISTE DES POSITIONS 4-10 - Modern design without table headers */}
      {listPokemons.length > 0 && (
        <motion.div 
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            Les autres meilleurs Pokémon
          </h3>
          
          <div className="space-y-3">
            {listPokemons.map((pokemon, idx) => (
              <div 
                key={pokemon.id} 
                className="bg-gray-800/80 hover:bg-gray-700 transition rounded-lg shadow-lg overflow-hidden flex items-center"
              >
                {/* Rank number */}
                <div className="p-4 flex-shrink-0 w-16 font-bold text-2xl text-center bg-gradient-to-br from-gray-800 to-gray-900">
                  {idx + 4}
                </div>
                
                {/* Pokémon info */}
                <Link href={`/pokemon/${pokemon.id}`} className="flex items-center flex-grow p-3 hover:text-blue-400 transition">
                  <div className="w-12 h-12 mr-4 bg-gray-700/50 rounded-full overflow-hidden flex items-center justify-center">
                    <Image 
                      src={pokemon.sprites.front_default || '/images/pokeball.png'}
                      alt={pokemon.name}
                      width={48}
                      height={48}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/images/pokeball.png";
                      }}
                    />
                  </div>
                  
                  <div>
                    <div className="font-medium capitalize text-lg">{pokemon.name}</div>
                    
                    {/* Types */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {pokemon.types?.map((typeObj, typeIdx) => {
                        const type = typeObj.type.name;
                        return (
                          <span
                            key={typeIdx}
                            className="badge px-2 py-0.5 text-xs text-white font-medium"
                            style={{ backgroundColor: typeColors[type] }}
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </Link>
                
                {/* Rating & votes info */}
                <div className="mr-6 flex gap-4 items-center">
                  <div>
                    <CommunityRating
                      rating={pokemon.rating || 0}
                      votes={pokemon.numberOfVotes || 0}
                      size="md"
                      showVotes={true}
                      prominent={true}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}