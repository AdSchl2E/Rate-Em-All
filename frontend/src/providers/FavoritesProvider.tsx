'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { setFavoritePokemonForUser } from '../lib/api-client/pokemon';

interface FavoritesContextType {
  favorites: number[];
  isFavorite: (pokemonId: number) => boolean;
  toggleFavorite: (pokemonId: number) => Promise<boolean>;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  isFavorite: () => false,
  toggleFavorite: async () => false,
  loading: true,
});

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const userId = session?.user?.id as number | undefined;
  const accessToken = session?.accessToken as string | undefined;
  
  // Charger depuis localStorage d'abord pour une UI réactive immédiate
  const [favorites, setFavorites] = useState<number[]>(() => {
    if (typeof window !== 'undefined' && userId) {
      const saved = localStorage.getItem(`favorites_${userId}`);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  
  const [loading, setLoading] = useState<boolean>(true);
  
  // Charger les favoris depuis le serveur
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!userId || !accessToken) {
        setFavorites([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await fetch(`/api/user/${userId}/favorite-pokemon`, {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch favorites');
        }
        
        const data = await response.json();
        
        if (data && Array.isArray(data.favorites)) {
          setFavorites(data.favorites);
          
          // Mettre à jour le localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem(`favorites_${userId}`, JSON.stringify(data.favorites));
          }
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFavorites();
  }, [userId, accessToken]);
  
  // Optimisation avec useCallback
  const toggleFavorite = useCallback(async (pokemonId: number): Promise<boolean> => {
    if (!userId || !accessToken) {
      toast.error('Veuillez vous connecter pour ajouter aux favoris');
      return false;
    }
    
    // Mise à jour optimiste
    const isFav = favorites.includes(pokemonId);
    const newFavorites = isFav
      ? favorites.filter(id => id !== pokemonId)
      : [...favorites, pokemonId];
    
    setFavorites(newFavorites);
    
    // Mettre à jour le localStorage immédiatement
    if (typeof window !== 'undefined') {
      localStorage.setItem(`favorites_${userId}`, JSON.stringify(newFavorites));
    }
    
    try {
      // Appeler l'API
      await setFavoritePokemonForUser(userId, pokemonId, accessToken);
      return !isFav; // Retourne le nouvel état
    } catch (error) {
      // Restaurer l'état précédent en cas d'erreur
      setFavorites(favorites);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`favorites_${userId}`, JSON.stringify(favorites));
      }
      console.error('Error toggling favorite:', error);
      throw error; // Propager l'erreur
    }
  }, [userId, accessToken, favorites]);
  
  // Optimisation avec useCallback
  const isFavorite = useCallback((pokemonId: number): boolean => {
    return favorites.includes(pokemonId);
  }, [favorites]);
  
  // Optimisation avec useMemo
  const value = useMemo(() => ({
    favorites,
    isFavorite,
    toggleFavorite,
    loading
  }), [favorites, isFavorite, toggleFavorite, loading]);
  
  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesContext);