'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Button from '../components/buttons/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { FaSearch, FaStar, FaRegStar, FaChartBar, FaHeart } from 'react-icons/fa';

interface Pokemon {
  id: number;
  name: string;
  rating: number;
  numberOfVotes: number;
  sprites: {
    front_default: string;
    other: {
      'official-artwork': { front_default: string };
    };
  };
  types?: { type: { name: string } }[];
}

export default function HomePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [trendingPokemons, setTrendingPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [randomPokemon, setRandomPokemon] = useState<number>(Math.floor(Math.random() * 151) + 1);

  useEffect(() => {
    // Function to fetch top rated pokemons
    const fetchTrendingPokemons = async () => {
      try {
        setLoading(true);
        console.log("Fetching trending Pokémon...");
        
        const res = await fetch('/api/pokemons/trending', {
          cache: 'no-store',
          next: { revalidate: 0 }
        });
        
        if (!res.ok) {
          console.error(`Error response: ${res.status}`);
          const errorText = await res.text();
          console.error(`Error details: ${errorText}`);
          throw new Error('Erreur lors de la récupération des Pokémon tendances');
        }
        
        const data = await res.json();
        console.log(`Received ${data.length} Pokémon from trending API`);
        
        // Si aucun pokémon n'est renvoyé, utiliser des données factices
        if (!data || data.length === 0) {
          console.log("No trending Pokémon found, using mock data");
          await useMockTrendingData();
          return;
        }
        
        // Pour chaque pokémon tendance, récupérer les détails depuis l'API Pokémon
        console.log("Fetching details for each trending Pokémon...");
        const enhancedData = await Promise.all(data.map(async (pokemon: any) => {
          try {
            console.log(`Fetching details for Pokémon ${pokemon.pokedexId}...`);
            const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.pokedexId}`);
            
            if (!pokeRes.ok) {
              console.error(`Failed to fetch details for Pokémon ${pokemon.pokedexId}: ${pokeRes.status}`);
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
            return pokemon;
          }
        }));
        
        console.log(`Enhanced data for ${enhancedData.length} trending Pokémon`);
        setTrendingPokemons(enhancedData);
      } catch (error) {
        console.error('Error in fetchTrendingPokemons:', error);
        await useMockTrendingData();
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingPokemons();
    
    // Set interval to change random pokemon for hero section
    const interval = setInterval(() => {
      setRandomPokemon(Math.floor(Math.random() * 151) + 1);
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // Fonction pour utiliser des données mock en cas d'erreur
  const useMockTrendingData = async () => {
    console.log("Using mock data for trending Pokémon");
    const randomIds = Array.from({ length: 4 }, () => Math.floor(Math.random() * 151) + 1);
    const pokemonData = await Promise.all(
      randomIds.map(async (id) => {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const pokemon = await res.json();
        return {
          ...pokemon,
          rating: (Math.random() * 5).toFixed(1),
          numberOfVotes: Math.floor(Math.random() * 100) + 10
        };
      })
    );
    setTrendingPokemons(pokemonData);
  };

  // Hero Section Animation Variants
  const heroVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section 
        initial="hidden"
        animate="visible"
        variants={heroVariants}
        className="relative bg-gradient-to-b from-gray-900 to-gray-800 py-20 rounded-2xl mb-16 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-500 rounded-full filter blur-3xl opacity-10"></div>
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-purple-500 rounded-full filter blur-3xl opacity-10"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center">
            <motion.div 
              variants={itemVariants} 
              className="lg:w-1/2 mb-10 lg:mb-0"
            >
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
                Explorez et Notez<br/>
                <span className="text-gradient bg-gradient-to-r from-blue-400 to-purple-500">Tous les Pokémon</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Découvrez, notez et partagez vos Pokémon favoris avec la communauté. 
                Rejoignez des milliers de dresseurs passionnés dès aujourd'hui !
              </p>
              <div className="flex flex-wrap gap-4">
                {session ? (
                  <Button label="Explorer les Pokémon" onClick={() => router.push('/explorer')} />
                ) : (
                  <>
                    <Button label="S'inscrire" onClick={() => router.push('/signup')} />
                    <Button label="Se connecter" onClick={() => router.push('/login')} />
                  </>
                )}
              </div>
              <div className="flex items-center mt-8">
                <div className="flex -space-x-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 border-2 border-gray-800" />
                  ))}
                </div>
                <span className="ml-3 text-gray-400">+ 5000 dresseurs actifs</span>
              </div>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="lg:w-1/2 flex justify-center"
            >
              {randomPokemon && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full filter blur-3xl opacity-30"></div>
                  <img 
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${randomPokemon}.png`} 
                    alt="Pokémon aléatoire" 
                    className="w-64 h-64 object-contain z-10 drop-shadow-2xl relative"
                  />
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-black bg-opacity-50 rounded-full filter blur-xl"></div>
                </motion.div>
              )}
            </motion.div>
          </div>
          
          <motion.div 
            variants={itemVariants}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            <div>
              <div className="text-3xl font-bold text-blue-400">800+</div>
              <div className="text-gray-400">Pokémon</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400">100K+</div>
              <div className="text-gray-400">Évaluations</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400">50K+</div>
              <div className="text-gray-400">Utilisateurs</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-400">10K+</div>
              <div className="text-gray-400">Avis</div>
            </div>
          </motion.div>
        </div>
      </motion.section>
      
      {/* Trending Pokémon */}
      <section className="mb-20">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">Pokémons Tendances</h2>
            <Link href="/top-rated" className="text-blue-400 hover:underline flex items-center">
              Voir tout <FaChartBar className="ml-1" />
            </Link>
          </div>
          
          {loading ? (
            <div className="py-12 flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingPokemons.map((pokemon) => (
                <Link href={`/pokemon/${pokemon.id}`} key={pokemon.id}>
                  <motion.div 
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700 hover:border-blue-500 transition-colors"
                  >
                    <div className="p-4 flex justify-between items-start">
                      <h3 className="text-lg font-medium capitalize">{pokemon.name}</h3>
                      <span className="bg-gray-900 px-2 py-1 rounded text-xs">#{pokemon.id}</span>
                    </div>
                    
                    <div className="px-4 flex justify-center">
                      <img
                        src={pokemon.sprites?.other['official-artwork'].front_default || pokemon.sprites?.front_default}
                        alt={pokemon.name}
                        className="h-32 object-contain"
                      />
                    </div>
                    
                    <div className="p-4 bg-gray-900/50">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <FaStar className="text-yellow-400 mr-1" />
                          <span>{pokemon.rating}</span>
                          <span className="text-gray-400 text-xs ml-1">({pokemon.numberOfVotes})</span>
                        </div>
                        <FaHeart className="text-red-500" />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-gray-900 rounded-2xl mb-20">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-16">Fonctionnalités de l'application</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-500/20 text-blue-400 mb-4">
                <FaStar className="text-xl" />
              </div>
              <h3 className="text-xl font-bold mb-2">Système de notation</h3>
              <p className="text-gray-400">Évaluez tous les Pokémon sur une échelle de 5 étoiles et découvrez les notes de la communauté.</p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-red-500/20 text-red-400 mb-4">
                <FaHeart className="text-xl" />
              </div>
              <h3 className="text-xl font-bold mb-2">Collection de favoris</h3>
              <p className="text-gray-400">Créez votre liste de Pokémon favoris pour les retrouver facilement.</p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-purple-500/20 text-purple-400 mb-4">
                <FaSearch className="text-xl" />
              </div>
              <h3 className="text-xl font-bold mb-2">Explorateur avancé</h3>
              <p className="text-gray-400">Recherchez and filtrez les Pokémon par type, génération et caractéristiques.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="mb-20">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-10 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Prêt à commencer votre aventure ?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">Rejoignez notre communauté de dresseurs et partagez votre passion pour les Pokémon !</p>
            
            {session ? (
              <Button label="Explorer maintenant" onClick={() => router.push('/explorer')} />
            ) : (
              <Button label="Créer un compte" onClick={() => router.push('/signup')} />
            )}
          </div>
        </div>
      </section>
      
      {/* CSS for text gradient */}
      <style jsx>{`
        .text-gradient {
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
    </div>
  );
}