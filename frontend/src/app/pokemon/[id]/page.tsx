'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaHeartBroken, FaInfoCircle, FaChartBar, FaCommentAlt, FaChevronLeft, FaChevronRight, FaShareAlt } from 'react-icons/fa';
import Link from 'next/link';
import StarRating from '../../../components/stars/StarRating';
import { getPokemonRating } from '../../../lib/api';
import { typeColors } from '../../../utils/pokemonTypes';
import { useFavorites } from '../../../contexts/FavoritesContext';
import { useRatings } from '../../../contexts/RatingsContext';

interface PokemonStat {
  base_stat: number;
  stat: {
    name: string;
  };
}

interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: { type: { name: string } }[];
  stats: PokemonStat[];
  abilities: { ability: { name: string } }[];
  sprites: {
    front_default: string;
    front_shiny?: string;
    back_default?: string;
    back_shiny?: string;
    other: {
      'official-artwork': { front_default: string };
      home?: { front_default: string };
    };
  };
  species: { url: string };
}

interface SpeciesInfo {
  flavor_text_entries: { flavor_text: string; language: { name: string } }[];
  genera: { genus: string; language: { name: string } }[];
  evolution_chain: { url: string };
  habitat?: { name: string };
}

interface PokemonPageProps {
  params: { id: string };
}

const PokemonDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const pokemonId = parseInt(params.id as string, 10);
  const { data: session } = useSession();
  const userId = session?.user?.id as number;
  
  const { isFavorite, toggleFavorite } = useFavorites();
  const { getRating, hasRated, setRating } = useRatings();
  
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [speciesInfo, setSpeciesInfo] = useState<SpeciesInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [pokemonRating, setPokemonRating] = useState<number>(0);
  const [numberOfVotes, setNumberOfVotes] = useState<number>(0);
  const [isRating, setIsRating] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'info' | 'stats' | 'comments'>('info');
  const [spriteView, setSpriteView] = useState<'default' | 'shiny'>('default');
  
  useEffect(() => {
    const fetchPokemonData = async () => {
      try {
        setLoading(true);
        
        // Récupérer les données de base du Pokémon
        const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        const pokeData = await pokeRes.json();
        setPokemon(pokeData);
        
        // Récupérer les informations sur l'espèce
        const speciesRes = await fetch(pokeData.species.url);
        const speciesData = await speciesRes.json();
        setSpeciesInfo(speciesData);
        
        // Récupérer la note du Pokémon
        const ratingData = await getPokemonRating(pokemonId);
        setPokemonRating(ratingData.rating || 0);
        setNumberOfVotes(ratingData.numberOfVotes || 0);
      } catch (error) {
        console.error("Error fetching Pokémon data:", error);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    // Si l'ID du Pokémon est valide, récupérer ses données
    if (pokemonId && !isNaN(pokemonId)) {
      fetchPokemonData();
    }
  }, [pokemonId]);

  const handleRating = async (rating: number) => {
    if (!userId) {
      toast.error("Veuillez vous connecter pour noter ce Pokémon");
      return;
    }

    try {
      setIsRating(true);
      await setRating(pokemonId, rating);
      
      // Récupérer les nouvelles données de notation
      const updatedRating = await getPokemonRating(pokemonId);
      setPokemonRating(updatedRating.rating || 0);
      setNumberOfVotes(updatedRating.numberOfVotes || 0);
    } catch (error) {
      console.error("Error rating Pokémon:", error);
      toast.error("Erreur lors de la notation");
    } finally {
      setIsRating(false);
    }
  };

  const handleFavorite = async () => {
    if (!userId) {
      toast.error("Veuillez vous connecter pour ajouter aux favoris");
      return;
    }

    try {
      const newStatus = await toggleFavorite(pokemonId);
      
      if (newStatus) {
        toast.success(`${pokemon?.name.charAt(0).toUpperCase()}${pokemon?.name.slice(1)} ajouté aux favoris !`);
      } else {
        toast.success(`${pokemon?.name.charAt(0).toUpperCase()}${pokemon?.name.slice(1)} retiré des favoris.`);
      }
    } catch (error) {
      console.error("Error updating favorite:", error);
      toast.error("Erreur lors de la mise à jour des favoris");
    }
  };
  
  const handleShare = () => {
    const url = `${window.location.origin}/pokemon/${pokemonId}`;
    navigator.clipboard.writeText(url);
    toast.success('Lien copié dans le presse-papier!');
  };
  
  const navigateToPokemon = (direction: 'prev' | 'next') => {
    const currentId = pokemonId;
    const newId = direction === 'prev' ? Math.max(currentId - 1, 1) : currentId + 1;
    router.push(`/pokemon/${newId}`);
  };
  
  const getDescription = () => {
    if (!speciesInfo) return "Aucune description disponible.";
    
    const frenchEntry = speciesInfo.flavor_text_entries.find(
      entry => entry.language.name === 'fr'
    );
    
    if (frenchEntry) return frenchEntry.flavor_text;
    
    const englishEntry = speciesInfo.flavor_text_entries.find(
      entry => entry.language.name === 'en'
    );
    
    return englishEntry ? englishEntry.flavor_text : "Aucune description disponible.";
  };
  
  const getCategory = () => {
    if (!speciesInfo) return "";
    
    const frenchGenus = speciesInfo.genera.find(
      genus => genus.language.name === 'fr'
    );
    
    if (frenchGenus) return frenchGenus.genus;
    
    const englishGenus = speciesInfo.genera.find(
      genus => genus.language.name === 'en'
    );
    
    return englishGenus ? englishGenus.genus : "";
  };
  
  const formatStatName = (name: string) => {
    const statNames: Record<string, string> = {
      'hp': 'PV',
      'attack': 'Attaque',
      'defense': 'Défense',
      'special-attack': 'Attaque Spé.',
      'special-defense': 'Défense Spé.',
      'speed': 'Vitesse'
    };
    
    return statNames[name] || name;
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!pokemon) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold mb-4">Pokémon non trouvé</h1>
        <p className="mb-4">Le Pokémon que vous recherchez n'existe pas.</p>
        <Link href="/explorer" className="text-blue-500 hover:underline">
          Explorer tous les Pokémon
        </Link>
      </div>
    );
  }
  
  // Get main type for background styling
  const mainType = pokemon.types[0].type.name;
  const typeColor = typeColors[mainType] || '#A8A878';

  const pokemonUserRating = getRating(pokemonId);
  const isPokemonRated = hasRated(pokemonId);
  const isPokemonFavorite = isFavorite(pokemonId);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigateToPokemon('prev')} 
          disabled={pokemonId <= 1}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            pokemonId <= 1 
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gray-800 hover:bg-gray-700'
          }`}
        >
          <FaChevronLeft /> Précédent
        </button>
        
        <h1 className="text-3xl font-bold text-center capitalize">
          {pokemon.name} <span className="text-gray-400 text-2xl">#{pokemon.id}</span>
        </h1>
        
        <button 
          onClick={() => navigateToPokemon('next')} 
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg"
        >
          Suivant <FaChevronRight />
        </button>
      </div>
      
      {/* Statut de favori et note */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {isPokemonRated && (
          <div className="px-3 py-1 bg-blue-900/30 text-blue-400 rounded-full border border-blue-500/30 flex items-center gap-1">
            <span className="text-yellow-400">★</span> Noté {pokemonUserRating}/5
          </div>
        )}
        
        {isPokemonFavorite && (
          <div className="px-3 py-1 bg-red-900/30 text-red-400 rounded-full border border-red-500/30 flex items-center gap-1">
            <FaHeart className="text-red-500" /> Dans vos favoris
          </div>
        )}
      </div>
      
      <div className="bg-gray-900 rounded-xl shadow-xl overflow-hidden">
        {/* Header with picture and basic info */}
        <div 
          className="relative py-12 px-6"
          style={{
            background: `linear-gradient(180deg, ${typeColor}40 0%, rgba(17, 24, 39, 1) 100%)`
          }}
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Pokemon image */}
            <div className="relative w-64 h-64">
              <motion.img
                key={`${pokemon.id}-${spriteView}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                src={
                  spriteView === 'default' 
                    ? pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default
                    : pokemon.sprites.front_shiny || pokemon.sprites.front_default
                }
                alt={pokemon.name}
                className="w-full h-full object-contain z-10 drop-shadow-2xl"
              />
              
              {/* Switch between normal/shiny */}
              {pokemon.sprites.front_shiny && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex bg-gray-800 rounded-full p-1 shadow-lg">
                  <button
                    onClick={() => setSpriteView('default')}
                    className={`w-8 h-8 rounded-full ${spriteView === 'default' ? 'bg-blue-500' : 'bg-gray-700'}`}
                  >
                    N
                  </button>
                  <button
                    onClick={() => setSpriteView('shiny')}
                    className={`w-8 h-8 rounded-full ${spriteView === 'shiny' ? 'bg-yellow-500' : 'bg-gray-700'}`}
                  >
                    S
                  </button>
                </div>
              )}
            </div>
            
            {/* Pokemon basic info */}
            <div className="flex-grow max-w-lg">
              {/* Types */}
              <div className="flex gap-2 mb-4 justify-center md:justify-start">
                {pokemon.types.map((typeInfo) => (
                  <span 
                    key={typeInfo.type.name}
                    className="px-4 py-1 rounded-full text-sm font-medium"
                    style={{ 
                      backgroundColor: typeColors[typeInfo.type.name] || '#A8A878',
                      color: ['fairy', 'ice', 'normal', 'flying', 'psychic'].includes(typeInfo.type.name) ? '#1F2937' : 'white'
                    }}
                  >
                    {typeInfo.type.name}
                  </span>
                ))}
              </div>
              
              <div className="mb-6 text-center md:text-left">
                <h2 className="text-xl font-semibold">{getCategory()}</h2>
                <p className="mt-2 text-gray-300">{getDescription()}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-800 p-3 rounded-lg text-center">
                  <div className="text-gray-400 text-sm">Taille</div>
                  <div className="font-bold">{pokemon.height / 10} m</div>
                </div>
                <div className="bg-gray-800 p-3 rounded-lg text-center">
                  <div className="text-gray-400 text-sm">Poids</div>
                  <div className="font-bold">{pokemon.weight / 10} kg</div>
                </div>
              </div>
              
              <div className="flex justify-center md:justify-start gap-4">
                <button
                  onClick={handleFavorite}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg 
                    ${isPokemonFavorite ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'} text-white`}
                >
                  {isPokemonFavorite ? (
                    <>
                      <FaHeartBroken className="mr-2" /> Retirer des favoris
                    </>
                  ) : (
                    <>
                      <FaHeart className="mr-2" /> Ajouter aux favoris
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg"
                >
                  <FaShareAlt /> Partager
                </button>
              </div>
            </div>
            
            {/* Rating section */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full md:w-auto">
              <div className="text-center">
                <div className="text-xl font-bold mb-1">Note Globale</div>
                <div className="flex items-center justify-center">
                  <span className="text-4xl font-bold text-yellow-400 mr-2">
                    {pokemonRating ? pokemonRating.toFixed(1) : '0.0'}
                  </span>
                  <span className="text-2xl text-yellow-400">★</span>
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {numberOfVotes} vote{numberOfVotes !== 1 ? 's' : ''}
                </div>
              </div>
              
              <div className="mt-4">
                <div className="text-center mb-2">
                  {isPokemonRated ? 'Votre note' : 'Noter ce Pokémon'}
                </div>
                <div className="flex justify-center">
                  <StarRating 
                    value={pokemonUserRating} 
                    onChange={handleRating}
                    size="lg"
                    highlight={isPokemonRated}
                    disabled={isRating || !userId}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-800">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-6 py-4 font-medium whitespace-nowrap ${
                activeTab === 'info' 
                  ? 'text-blue-400 border-b-2 border-blue-400' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <FaInfoCircle className="inline mr-2" /> Informations
            </button>
            
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-6 py-4 font-medium whitespace-nowrap ${
                activeTab === 'stats' 
                  ? 'text-blue-400 border-b-2 border-blue-400' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <FaChartBar className="inline mr-2" /> Statistiques
            </button>
            
            <button
              onClick={() => setActiveTab('comments')}
              className={`px-6 py-4 font-medium whitespace-nowrap ${
                activeTab === 'comments' 
                  ? 'text-blue-400 border-b-2 border-blue-400' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <FaCommentAlt className="inline mr-2" /> Commentaires
            </button>
          </div>
        </div>
        
        {/* Tab content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'info' && (
              <motion.div
                key="info"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-xl font-bold mb-4">Capacités</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {pokemon.abilities.map((ability, index) => (
                    <div key={index} className="bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-medium capitalize">{ability.ability.name.replace('-', ' ')}</h4>
                    </div>
                  ))}
                </div>
                
                {/* Additional info - would be fetched from your backend */}
                <h3 className="text-xl font-bold mb-4">Où le trouver</h3>
                <div className="bg-gray-800 p-4 rounded-lg">
                  {speciesInfo?.habitat ? (
                    <p>Habitat: {speciesInfo.habitat.name}</p>
                  ) : (
                    <p>Information non disponible</p>
                  )}
                </div>
              </motion.div>
            )}
            
            {activeTab === 'stats' && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-xl font-bold mb-4">Statistiques de base</h3>
                <div className="space-y-4">
                  {pokemon.stats.map((stat) => (
                    <div key={stat.stat.name}>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{formatStatName(stat.stat.name)}</span>
                        <span>{stat.base_stat}</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (stat.base_stat / 255) * 100)}%` }}
                          className="h-2.5 rounded-full"
                          style={{ 
                            backgroundColor: stat.base_stat > 150 ? '#4ADE80' : stat.base_stat > 90 ? '#FACC15' : '#FB7185'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 p-4 bg-gray-800 rounded-lg">
                  <h4 className="font-bold mb-2">Total</h4>
                  <div className="text-2xl font-bold">
                    {pokemon.stats.reduce((total, stat) => total + stat.base_stat, 0)}
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'comments' && (
              <motion.div
                key="comments"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <CommentSection pokemonId={pokemon.id} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PokemonDetailPage;