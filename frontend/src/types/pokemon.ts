/**
 * Pokemon interface representing a Pokemon entity with all its properties
 * Includes both PokeAPI data and custom application data
 */
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
  
  // Properties added by our API
  rating?: number;
  numberOfVotes?: number;
  userRating?: number;
  isFavorite?: boolean;
  pokedexId?: number;

  // Species data from Pokemon API
  species_info?: {
    // Basic species info
    is_legendary?: boolean;
    is_mythical?: boolean;
    is_baby?: boolean;
    
    // Generation data
    generation?: {
      name: string;  // e.g., "generation-i"
      url: string;
    };
    
    // Color and physical properties
    color?: {
      name: string;
      url: string;
    };
    shape?: {
      name: string;
      url: string;
    };
    
    // Habitat and growth
    habitat?: {
      name: string;
      url: string;
    };
    growth_rate?: {
      name: string;
      url: string;
    };
    
    // Evolution 
    evolution_chain?: {
      url: string;
    };
    evolves_from_species?: {
      name: string;
      url: string;
    };
    
    // Breeding groups
    egg_groups?: {
      name: string;
      url: string;
    }[];
    
    // Gender rate (-1 for genderless, otherwise the percentage of being female)
    gender_rate?: number;
    
    // Capture and happiness
    capture_rate?: number;
    base_happiness?: number;
    
    // Hatch counter (steps to hatch an egg)
    hatch_counter?: number;
    
    // Descriptions and category
    flavor_text_entries?: {
      flavor_text: string;
      language: {
        name: string;
        url: string;
      };
      version: {
        name: string;
        url: string;
      };
    }[];
    genera?: {
      genus: string;
      language: {
        name: string;
        url: string;
      };
    }[];
    
    // Forms info
    forms_switchable?: boolean;
    has_gender_differences?: boolean;
    
    // Additional misc info
    order?: number;
    varieties?: {
      is_default: boolean;
      pokemon: {
        name: string;
        url: string;
      };
    }[];
  };
}

/**
 * User rating for a specific Pokemon
 */
export interface UserRating {
  pokemonId: number;
  rating: number;
}

/**
 * Response structure for user ratings API
 */
export interface UserRatingsResponse {
  ratings: UserRating[];
}