export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  abilities: {
    ability: {
      name: string;
      url: string;
    };
    is_hidden: boolean;
    slot: number;
  }[];
  sprites: {
    front_default: string;
    front_shiny?: string;
    back_default?: string;
    back_shiny?: string;
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
  types: {
    type: {
      name: string;
      url: string;
    };
    slot: number;
  }[];
  stats: {
    base_stat: number;
    effort: number;
    stat: {
      name: string;
      url: string;
    };
  }[];
  
  // Propriétés ajoutées par notre API
  rating?: number;
  numberOfVotes?: number;
  userRating?: number;
  isFavorite?: boolean;
  pokedexId?: number;
}

export interface UserRating {
  pokemonId: number;
  rating: number;
}

export interface UserRatingsResponse {
  ratings: UserRating[];
}