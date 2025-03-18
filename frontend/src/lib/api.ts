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

export async function ratePokemonForUser(userId: number, pokemonId: number, rating: number, token: string) {
  const response = await fetch(`/api/user/${userId}/rate-pokemon/${pokemonId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`, // Envoie le token dans le header Authorization
    },
    body: JSON.stringify({ rating }),
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la notation');
  }
  return response.json();
}


export async function getPokemonRating(pokemonId: number) {
  const response = await fetch(`/api/pokemons/${pokemonId}`);
  if (response.status === 404) {
    return { rating: 0, numberOfVotes: 0 };
  }
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération de la note');
  }
  return response.json();
}
