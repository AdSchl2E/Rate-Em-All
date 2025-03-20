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

export async function getPokemonRating(pokedexId: number) {
  const response = await fetch(`/api/pokemons/${pokedexId}`);
  if (response.status === 404) {
    return { rating: 0, numberOfVotes: 0, isFavorite: false};
  }
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération de la note');
  }
  return response.json();
}

export async function setFavoritePokemonForUser(userId: number, pokedexId: number, token: string) {
  const response = await fetch(`/api/user/${userId}/favorite-pokemon/${pokedexId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la favorisation');
  }
  return response.json();
}

export async function getUserFavoritePokemons(userId: number, token: string) {
  const response = await fetch(`/api/user/${userId}/favorite-pokemon/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération de la note');
  }
  return response.json();
}
