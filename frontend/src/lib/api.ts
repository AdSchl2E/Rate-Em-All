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
  
export async function ratePokemon(pokemonId: number, rating: number) {
  const response = await fetch(`/api/pokemons/${pokemonId}/rate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
    // Aucun enregistrement dans la base, on retourne une note par défaut
    return { rating: 0, numberOfVotes: 0 };
  }
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération de la note');
  }
  return response.json(); // On suppose que l'objet retourné contient { rating: number, numberOfVotes: number }
}
