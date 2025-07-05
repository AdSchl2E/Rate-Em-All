/**
 * Hook personnalisé pour gérer l'API Rate-Em-All
 */

'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import api from './api';
import type { RegisterUserData, UserRatingsResponse } from './types';

/**
 * Hook pour gérer l'authentification
 */
export function useAuth() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (userData: RegisterUserData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.auth.register(userData);
      setLoading(false);
      return { success: true, user: result.user };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'inscription';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const updateProfile = async (username: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.user.updateProfile(username);
      setLoading(false);
      return { success: true, user: result.user };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.user.changePassword(currentPassword, newPassword);
      setLoading(false);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du changement de mot de passe';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  return {
    user: session?.user,
    isAuthenticated: !!session,
    loading,
    error,
    register,
    updateProfile,
    changePassword
  };
}

/**
 * Hook pour gérer les Pokemon
 */
export function usePokemon() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ratePokemon = async (pokemonId: number, rating: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.user.ratePokemon(pokemonId, rating);
      setLoading(false);
      return { success: true, ...result };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la notation';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const getUserRatings = async (): Promise<{ success: boolean; ratings?: any[]; error?: string }> => {
    setLoading(true);
    setError(null);
    try {
      const result: UserRatingsResponse = await api.user.getUserRatings();
      setLoading(false);
      return { success: true, ratings: result.ratings };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des notes';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const getUserFavorites = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.user.getUserFavorites();
      setLoading(false);
      return { success: true, favorites: result.favorites };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des favoris';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const searchPokemon = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const results = await api.pokemon.search(query);
      setLoading(false);
      return { success: true, results };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la recherche';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const getPokemonList = async (page = 0, limit = 20) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.pokemon.getList(page, limit);
      setLoading(false);
      return { success: true, ...result };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des Pokemon';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const getTopRated = async (limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const results = await api.pokemon.getTopRated(limit);
      setLoading(false);
      return { success: true, results };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des Pokemon populaires';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  return {
    loading,
    setLoading,
    error,
    setError,
    ratePokemon,
    getUserRatings,
    getUserFavorites,
    searchPokemon,
    getPokemonList,
    getTopRated
  };
}
