export const API_CONFIG = {
  baseUrl: process.env.API_URL || 'http://localhost:3001',
  nextUrl: process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
  endpoints: {
    auth: {
      login: '/auth/login',
      signup: '/auth/signup',
    },
    user: {
      profile: (userId: number | string) => `/user/${userId}`,
      ratings: (userId: number | string) => `/user/${userId}/ratings`,
      favorites: (userId: number | string) => `/user/${userId}/favorite-pokemon`,
      toggleFavorite: (userId: number | string, pokemonId: number | string) => 
        `/user/${userId}/favorite-pokemon/${pokemonId}`,
      ratePokemon: (userId: number | string, pokemonId: number | string) =>
        `/user/${userId}/rate-pokemon/${pokemonId}`,
    },
    pokemon: {
      details: (id: number | string) => `/pokemons/pokedexId/${id}`,
      topRated: '/pokemons/top-rated',
      trending: '/pokemons/trending',
      batchRatings: '/pokemons/ratings/batch',
    }
  },
  cacheConfig: {
    short: { revalidate: 60 },        // 1 minute
    medium: { revalidate: 3600 },     // 1 heure
    long: { revalidate: 86400 }       // 24 heures
  }
};