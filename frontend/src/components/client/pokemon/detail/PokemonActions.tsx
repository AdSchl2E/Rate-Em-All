'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { HeartIcon, ShareIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { useGlobal } from '@/providers/GlobalProvider';
import { motion } from 'framer-motion';

interface PokemonActionsProps {
  pokemonId: number;
  pokemonName: string;
}

export default function PokemonActions({ 
  pokemonId, 
  pokemonName 
}: PokemonActionsProps) {
  const { data: session } = useSession();
  const { isFavorite, toggleFavorite } = useGlobal();
  
  const [loading, setLoading] = useState(false);
  const isPokemonFavorite = isFavorite(pokemonId);

  const handleFavorite = async () => {
    if (!session?.user?.id) {
      toast.error("Veuillez vous connecter pour ajouter aux favoris");
      return;
    }

    try {
      setLoading(true);
      const newStatus = await toggleFavorite(pokemonId);
      
      if (newStatus) {
        toast.success(`${pokemonName} ajouté aux favoris !`);
      } else {
        toast.success(`${pokemonName} retiré des favoris.`);
      }
    } catch (error) {
      toast.error("Une erreur s'est produite");
      console.error("Favorite error:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/pokemon/${pokemonId}`);
    toast.success('Lien copié dans le presse-papier!');
  };

  const buttonVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {/* Bouton Favoris */}
      <motion.button 
        onClick={handleFavorite} 
        disabled={loading || !session}
        variants={buttonVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.5 }}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
          isPokemonFavorite 
            ? 'bg-red-600 hover:bg-red-700 text-white' 
            : 'bg-gray-700 hover:bg-gray-600 text-white'
        }`}
      >
        <HeartIcon className="h-5 w-5" /> 
        {isPokemonFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      </motion.button>
      
      {/* Bouton Partager */}
      <motion.button
        onClick={handleShare}
        variants={buttonVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.6 }}
        className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-white"
      >
        <ShareIcon className="h-5 w-5" />
        Partager
      </motion.button>
      
      {/* Bouton Evolution - à compléter selon besoin */}
      <motion.button
        variants={buttonVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.7 }}
        className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-white"
      >
        <ArrowPathIcon className="h-5 w-5" />
        Évolution
      </motion.button>
    </div>
  );
}