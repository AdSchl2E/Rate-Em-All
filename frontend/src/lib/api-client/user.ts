// Récupérer les Pokémon favoris d'un utilisateur
export async function getUserFavoritePokemons(userId: number, token: string) {
  try {
    const response = await fetch(`/api/user/${userId}/favorite-pokemon`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: 'no-store'  // Important: ne pas mettre en cache cette requête
    });

    if (!response.ok) {
      throw new Error('Failed to fetch favorite Pokémons');
    }
    console.log(`Fetched favorite Pokémons for user ${userId}`);

    return await response.json();
  } catch (error) {
    console.error('Error fetching favorite Pokémons:', error);
    return { favorites: [] };
  }
}

// Récupérer les notations d'un utilisateur
export async function getUserRatings(userId: number, token: string) {
  try {
    console.log(`Calling API for user ${userId} ratings with token`);
    
    const response = await fetch(`/api/user/${userId}/ratings`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      // Important: ne pas mettre en cache cette requête
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error('Failed to fetch ratings:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      throw new Error(`Failed to fetch ratings: ${response.status}`);
    }

    const data = await response.json();
    console.log('Rating data received from API:', data);
    
    // Vérifier le format reçu (les logs montrent que c'est un objet avec une propriété ratings)
    if (data && data.ratings) {
      return data; // Retourner l'objet complet
    } else {
      console.warn('Unexpected rating data format:', data);
      return { ratings: [] }; // Format par défaut
    }
  } catch (error) {
    console.error('Error fetching user ratings:', error);
    return { ratings: [] };
  }
}

// Mettre à jour le profil utilisateur
export async function updateUserProfile(userId: number, userData: any, token: string) {
  const response = await fetch(`/api/user/${userId}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData)
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la mise à jour du profil');
  }

  return response.json();
}