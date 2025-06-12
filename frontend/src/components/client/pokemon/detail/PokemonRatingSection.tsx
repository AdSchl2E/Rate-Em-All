'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { Pokemon } from '@/types/pokemon';
import { useGlobal } from '@/providers/GlobalProvider';
import { motion } from 'framer-motion';
import { ClientStarRating } from '../../ui/ClientStarRating';
import { CommunityRating } from '../../ui/CommunityRating';

interface PokemonRatingSectionProps {
  pokemon: Pokemon;
  onRatingUpdate: (rating: number, votes: number) => void;
}

export default function PokemonRatingSection({ 
  pokemon, 
  onRatingUpdate 
}: PokemonRatingSectionProps) {
  const { data: session } = useSession();
  const { getRating, setRating } = useGlobal();
  
  const [loading, setLoading] = useState(false);
  const [userRating, setUserRating] = useState(getRating(pokemon.id));
  
  const handleRating = async (rating: number) => {
    if (!session?.user?.id) {
      toast.error("Veuillez vous connecter pour noter ce Pokémon");
      return;
    }

    try {
      setLoading(true);
      // Récupérer directement les données retournées par setRating
      const result = await setRating(pokemon.id, rating);
      
      // Mettre à jour l'état local de la note utilisateur
      setUserRating(rating);
      
      // Propager les mises à jour vers le parent
      onRatingUpdate(result.updatedRating, result.numberOfVotes);
      
      toast.success(`Vous avez noté ${pokemon.name} ${rating}/5 !`);
    } catch (error) {
      toast.error("Une erreur s'est produite");
      console.error("Rating error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Note communautaire */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-lg font-medium mb-2">Note communautaire</h3>
        <div className="flex items-center">
          <CommunityRating
            rating={pokemon.rating || 0}
            votes={pokemon.numberOfVotes || 0}
            size="lg"
            showStars={true}
            prominent={true}
          />
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
            value={userRating}
            onChange={handleRating}
            size="lg"
            disabled={loading}
            useColors={true}
          />
          
          {!session && (
            <p className="text-sm text-gray-400 mt-2">
              <Link href="/login" className="text-blue-400 hover:underline">Connectez-vous</Link> pour noter ce Pokémon
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}