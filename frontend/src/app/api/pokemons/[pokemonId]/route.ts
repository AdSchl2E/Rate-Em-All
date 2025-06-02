import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: { pokemonId: string } }
) {
  try {
    const params = await context.params;
    const { pokemonId } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    console.log(`Getting rating for Pokémon ${pokemonId}, userId=${userId}`);
    
    // Récupérer les données de notation standard
    const response = await fetch(`http://localhost:3001/pokemons/pokedexId/${pokemonId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        // Renvoyer une notation par défaut si le Pokémon n'est pas trouvé
        return NextResponse.json({ rating: 0, numberOfVotes: 0, userRating: 0 }, { status: 200 });
      }
      return NextResponse.json(
        { message: "Failed to get Pokemon rating" },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    // Si un userId est fourni, récupérer également la note donnée par l'utilisateur
    if (userId) {
      const authHeader = request.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
          { message: "Authorization header missing or invalid" },
          { status: 401 }
        );
      }
      
      const token = authHeader.split(" ")[1];
      
      try {
        // Récupérer les notes de l'utilisateur
        const userRatingsResponse = await fetch(
          `http://localhost:3001/user/${userId}/ratings`,
          {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            },
          }
        );
        
        if (userRatingsResponse.ok) {
          const userRatings = await userRatingsResponse.json();
          
          if (userRatings && Array.isArray(userRatings.ratings)) {
            // Chercher si l'utilisateur a déjà noté ce Pokémon
            const userRating = userRatings.ratings.find(
              (r: any) => r.pokemonId === parseInt(pokemonId)
            );
            
            if (userRating) {
              // Ajouter la note de l'utilisateur aux données retournées
              data.userRating = userRating.rating;
              console.log(`Found user rating: ${userRating.rating}/5`);
            }
          }
        }
        
        // Vérifier si le Pokémon est dans les favoris
        const favoritesResponse = await fetch(
          `http://localhost:3001/user/${userId}/favorite-pokemon`,
          {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            },
          }
        );
        
        if (favoritesResponse.ok) {
          const favorites = await favoritesResponse.json();
          if (Array.isArray(favorites)) {
            data.isFavorite = favorites.includes(parseInt(pokemonId));
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Ne pas échouer si on ne peut pas obtenir les données utilisateur
      }
    }
    
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { message: "Server error", error: errorMessage },
      { status: 500 }
    );
  }
}

