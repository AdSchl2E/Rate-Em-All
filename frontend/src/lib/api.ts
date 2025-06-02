export async function signup(userData: { name: string; pseudo: string; email: string; password: string }) {
  return fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
}

export async function login(credentials: { email: string; password: string }) {
  return fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
}

export async function ratePokemonForUser(userId: number, pokedexId: number, rating: number, token: string) {
  const response = await fetch(`/api/user/${userId}/rate-pokemon/${pokedexId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ rating }),
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la notation');
  }
  return response.json();
}

// Nouvelle fonction pour récupérer les notes de l'utilisateur
export async function getUserRatings(userId: number, token: string) {
  console.log(`Calling API to get ratings for user ${userId}`);
  
  const response = await fetch(`/api/user/${userId}/ratings`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    cache: 'no-store'
  });
  
  if (!response.ok) {
    console.error(`API error: ${response.status}`);
    throw new Error('Erreur lors de la récupération des notes');
  }
  
  const data = await response.json();
  console.log(`Received data:`, data);
  
  if (!data || !Array.isArray(data.ratings)) {
    console.warn('Data is not in expected format:', data);
    return { ratings: [] };
  }
  
  return data;
}

// Modification de getPokemonRating pour inclure les notes utilisateur si disponibles
export async function getPokemonRating(pokedexId: number, userId?: number, token?: string) {
  const url = userId && token 
    ? `/api/pokemons/${pokedexId}?userId=${userId}` 
    : `/api/pokemons/${pokedexId}`;
  
  const headers: HeadersInit = {
    "Content-Type": "application/json"
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    headers
  });
  
  if (response.status === 404) {
    return { rating: 0, numberOfVotes: 0, isFavorite: false, userRating: 0 };
  }
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération de la note');
  }
  return response.json(); // Devrait maintenant inclure userRating si userId était fourni
}

// Modification de la fonction getUserFavoritePokemons pour garantir un tableau
export async function getUserFavoritePokemons(userId: number, token: string) {
  console.log(`Getting favorites for user ${userId}`);
  
  const response = await fetch(`/api/user/${userId}/favorite-pokemon`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    // Important: désactiver le cache
    cache: "no-store",
    next: { revalidate: 0 }
  });

  if (!response.ok) {
    console.error(`API error: ${response.status}`);
    throw new Error('Erreur lors de la récupération des favoris');
  }

  const data = await response.json();
  console.log(`Received favorites:`, data);
  
  // S'assurer que favorites est un tableau
  if (!data.favorites || !Array.isArray(data.favorites)) {
    console.warn('Format de favoris inattendu:', data);
    return { favorites: [] };
  }
  
  return data;
}

export async function setFavoritePokemonForUser(userId: number, pokedexId: number, token: string) {
  console.log(`Toggling favorite for Pokémon ${pokedexId} for user ${userId}`);
  
  const response = await fetch(`/api/user/${userId}/favorite-pokemon/${pokedexId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    cache: "no-store"
  });

  if (!response.ok) {
    console.error(`API error: ${response.status}`);
    throw new Error('Erreur lors de la mise à jour des favoris');
  }
  
  const data = await response.json();
  console.log('API response for favorite update:', data);
  
  return data;
}
