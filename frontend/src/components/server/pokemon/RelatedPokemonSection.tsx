import { Pokemon } from '@/types/pokemon';
import PokemonCard from '@/components/client/shared/PokemonCard';

/**
 * RelatedPokemonSection props interface
 */
interface RelatedPokemonSectionProps {
  /** List of related Pokemon to display */
  pokemonList: Pokemon[];
  /** Section title */
  title: string;
}

/**
 * RelatedPokemonSection component
 * 
 * Displays a grid of related Pokemon cards with a title.
 * Used for showing similar or related Pokemon on detail pages.
 * 
 * @param props - Component props
 * @returns React component
 */
export default function RelatedPokemonSection({ 
  pokemonList, 
  title 
}: RelatedPokemonSectionProps) {
  return (
    <section className="mt-8">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {pokemonList.map(pokemon => (
          <PokemonCard 
            key={pokemon.id}
            pokemon={pokemon}
            viewMode="list"
            size="md"
            showRating={true}
          />
        ))}
      </div>
    </section>
  );
}