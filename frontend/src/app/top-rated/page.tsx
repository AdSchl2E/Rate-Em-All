'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import StarRating from '../../components/stars/StarRating';
import { FaFilter, FaSearch, FaChevronUp, FaChevronDown, FaTrophy, FaMedal } from 'react-icons/fa';
import { typeColors } from '../../utils/pokemonTypes';
import { toast } from 'react-hot-toast';
import PokemonCard from '../../components/pokemon/PokemonCard';

interface Pokemon {
  id: number;
  pokedexId: number;
  name: string;
  rating: number;
  numberOfVotes: number;
  sprites?: {
    front_default: string;
    other: {
      'official-artwork': { front_default: string };
    };
  };
  types?: { type: { name: string } }[];
}

const TopRatedPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [topPokemon, setTopPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [minVotes, setMinVotes] = useState<number>(5);
  const userId = session?.user?.id as number | undefined;

  useEffect(() => {
    const fetchTopRated = async () => {
      try {
        setLoading(true);
        console.log("Fetching top-rated Pokémon...");
        
        // Appel au backend pour récupérer les Pokémon les mieux notés
        const res = await fetch('/api/pokemons/top-rated?limit=50', { // Augmenter la limite
          cache: 'no-store',
          next: { revalidate: 0 }
        });
        
        if (!res.ok) {
          console.error(`Error response: ${res.status}`);
          const errorText = await res.text();
          console.error(`Error details: ${errorText}`);
          throw new Error('Erreur lors de la récupération des Pokémon les mieux notés');
        }
        
        const data = await res.json();
        console.log(`Received ${data.length} Pokémon from top-rated API`);
        
        // Si aucun pokémon n'est renvoyé, afficher un message et sortir
        if (!data || data.length === 0) {
          console.log("No Pokémon found in top-rated");
          setTopPokemon([]);
          return;
        }
        
        // Pour chaque pokémon du top, récupérer les détails additionnels depuis l'API Pokémon
        console.log("Fetching details for each Pokémon...");
        const enhancedData = await Promise.all(data.map(async (pokemon: Pokemon) => {
          try {
            console.log(`Fetching details for Pokémon ${pokemon.pokedexId}...`);
            const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.pokedexId}`);
            
            if (!pokeRes.ok) {
              console.error(`Failed to fetch details for Pokémon ${pokemon.pokedexId}: ${pokeRes.status}`);
              // Return the original pokemon without additional details
              return pokemon;
            }
            
            const pokeData = await pokeRes.json();
            return {
              ...pokemon,
              name: pokeData.name,
              sprites: pokeData.sprites,
              types: pokeData.types
            };
          } catch (error) {
            console.error(`Error for Pokémon ${pokemon.pokedexId}:`, error);
            // Renvoyer les données sans les images en cas d'erreur
            return pokemon;
          }
        }));
        
        console.log(`Enhanced data for ${enhancedData.length} Pokémon`);
        setTopPokemon(enhancedData);
      } catch (error) {
        console.error('Error in fetchTopRated:', error);
        toast.error("Erreur lors du chargement des données");
        // En cas d'erreur complète, initialiser avec tableau vide
        setTopPokemon([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTopRated();
  }, []);

  const handleSortDirection = () => {
    setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  const filteredPokemon = topPokemon
    .filter(pokemon => 
      pokemon.name?.toLowerCase().includes(searchTerm.toLowerCase()) && 
      pokemon.numberOfVotes >= minVotes
    )
    .sort((a, b) => {
      if (sortDirection === 'desc') {
        return b.rating - a.rating;
      } else {
        return a.rating - b.rating;
      }
    });
    
  // Top 3 Pokémons pour le podium
  const topThree = filteredPokemon.slice(0, 3);
  const remainingPokemon = filteredPokemon.slice(3);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-2 text-gradient bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent">
          Palmarès des Pokémon
        </h1>
        <p className="text-gray-400">Les Pokémon les mieux notés par la communauté</p>
      </div>
      
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div className="relative w-full md:w-1/3">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="bg-gray-800 border border-gray-700 text-white rounded-lg block w-full pl-10 p-2.5 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Rechercher un Pokémon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center">
            <button
              onClick={() => setFilterOpen(prev => !prev)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
            >
              <FaFilter />
              Filtres
            </button>
            
            <button
              onClick={handleSortDirection}
              className="flex items-center gap-2 px-4 py-2 ml-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
            >
              {sortDirection === 'desc' ? <FaChevronDown /> : <FaChevronUp />}
              Note
            </button>
          </div>
        </div>
        
        {/* Filter Panel */}
        {filterOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-gray-800 rounded-lg"
          >
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium">Nombre minimum de votes</label>
              <input
                type="range"
                min="0"
                max="500"
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                value={minVotes}
                onChange={(e) => setMinVotes(Number(e.target.value))}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0</span>
                <span>{minVotes}</span>
                <span>500+</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-400"></div>
        </div>
      ) : (
        <>
          {filteredPokemon.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-400 text-xl">Aucun Pokémon ne correspond à votre recherche.</p>
            </div>
          ) : (
            <>
              {/* Podium pour les 3 premiers */}
              {topThree.length > 0 && (
                <div className="mb-16">
                  <h2 className="text-2xl font-bold mb-8 text-center">Le Podium</h2>
                  <div className="flex flex-col md:flex-row justify-center items-end gap-4 mb-8">
                    {/* Positions sur le podium - 2ème place */}
                    {topThree.length > 1 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="order-2 md:order-1 w-full md:w-1/4"
                      >
                        <div className="relative pb-8">
                          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <div className="rounded-full bg-gray-800 p-3 border-2 border-gray-700">
                              <FaMedal className="text-3xl text-silver" />
                            </div>
                          </div>
                          <div className="bg-gradient-to-b from-gray-700 to-gray-800 p-3 rounded-lg text-center pt-10 h-[220px]">
                            <div className="flex flex-col items-center h-full">
                              <div className="text-2xl font-bold text-silver">2e</div>
                              <img 
                                src={topThree[1]?.sprites?.front_default} 
                                alt={topThree[1]?.name} 
                                className="w-28 h-28 object-contain my-2"
                              />
                              <h3 className="font-bold capitalize text-lg">{topThree[1]?.name}</h3>
                              <div className="flex items-center gap-2 mt-2">
                                <StarRating value={topThree[1]?.rating} fixed={true} size="sm" />
                                <span>({topThree[1]?.rating.toFixed(1)})</span>
                              </div>
                              <div className="text-sm text-gray-400">{topThree[1]?.numberOfVotes} votes</div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    
                    {/* Positions sur le podium - 1ère place */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="order-1 md:order-2 w-full md:w-1/3"
                    >
                      <div className="relative pb-12">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                          <div className="rounded-full bg-gray-800 p-4 border-4 border-yellow-400/50">
                            <FaTrophy className="text-4xl text-gold" />
                          </div>
                        </div>
                        <div className="bg-gradient-to-b from-yellow-800/30 to-gray-800 p-4 rounded-lg text-center pt-12 border border-yellow-500/20 shadow-lg shadow-yellow-500/10 h-[280px]">
                          <div className="flex flex-col items-center h-full">
                            <div className="text-3xl font-bold text-gold">1er</div>
                            <img 
                              src={topThree[0]?.sprites?.other?.['official-artwork']?.front_default || topThree[0]?.sprites?.front_default} 
                              alt={topThree[0]?.name} 
                              className="w-40 h-40 object-contain my-3 drop-shadow-[0_0_10px_rgba(255,215,0,0.3)]"
                            />
                            <h3 className="font-bold capitalize text-xl">{topThree[0]?.name}</h3>
                            <div className="flex items-center gap-2 mt-2">
                              <StarRating value={topThree[0]?.rating} fixed={true} size="md" />
                              <span className="text-lg">({topThree[0]?.rating.toFixed(1)})</span>
                            </div>
                            <div className="text-gray-300">{topThree[0]?.numberOfVotes} votes</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                    
                    {/* Positions sur le podium - 3ème place */}
                    {topThree.length > 2 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="order-3 w-full md:w-1/4"
                      >
                        <div className="relative pb-6">
                          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <div className="rounded-full bg-gray-800 p-2 border-2 border-gray-700">
                              <FaMedal className="text-2xl text-bronze" />
                            </div>
                          </div>
                          <div className="bg-gradient-to-b from-gray-700 to-gray-800 p-3 rounded-lg text-center pt-8 h-[200px]">
                            <div className="flex flex-col items-center h-full">
                              <div className="text-xl font-bold text-bronze">3e</div>
                              <img 
                                src={topThree[2]?.sprites?.front_default} 
                                alt={topThree[2]?.name} 
                                className="w-24 h-24 object-contain my-2"
                              />
                              <h3 className="font-bold capitalize">{topThree[2]?.name}</h3>
                              <div className="flex items-center gap-2 mt-2">
                                <StarRating value={topThree[2]?.rating} fixed={true} size="sm" />
                                <span>({topThree[2]?.rating.toFixed(1)})</span>
                              </div>
                              <div className="text-sm text-gray-400">{topThree[2]?.numberOfVotes} votes</div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Reste du classement */}
              <div>
                <h2 className="text-2xl font-bold mb-6 text-center">Classement Complet</h2>
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                >
                  {remainingPokemon.map((pokemon, index) => (
                    <motion.div key={pokemon.id} variants={itemVariants}>
                      <div className="relative">
                        {/* Position badge */}
                        <div className="absolute top-0 left-0 w-10 h-10 bg-gray-800 rounded-tl-lg rounded-br-lg flex items-center justify-center z-10 font-bold text-gray-300">
                          #{index + 4}
                        </div>
                        <PokemonCard 
                          pokemon={pokemon} 
                          userId={userId || 0}
                          showActions={false}
                        />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </>
          )}
        </>
      )}

      {/* CSS pour les couleurs des médailles */}
      <style jsx global>{`
        .text-gold {
          color: #FFD700;
        }
        .text-silver {
          color: #C0C0C0;
        }
        .text-bronze {
          color: #CD7F32;
        }
        .text-gradient {
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
    </div>
  );
};

export default TopRatedPage;