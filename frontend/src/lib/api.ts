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

export async function ratePokemon(pokemonId: number, rating: number, accessToken: string) {
  return fetch(`/api/pokemons/${pokemonId}/rate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ rating }),
  });
}
  