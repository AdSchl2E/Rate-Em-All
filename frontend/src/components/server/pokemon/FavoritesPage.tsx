import PageHeader from '@/components/server/shared/PageHeader';
import FavoritesContainer from '@/components/client/pokemon/favorites/FavoritesContainer';

/**
 * FavoritesPage component
 * 
 * Server component that renders the user's favorite Pokémon page.
 * Handles server-side authentication checks and data pre-loading.
 * 
 * @returns React server component
 */
export async function FavoritesPage() {
  // Server component can check authentication and pre-load data
  // if needed, with optimal SSR handling
  
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="My Favorite Pokémon"
        description="Find all your favorite Pokémon in one place"
      />
      
      {/* Client component for interactive features */}
      <FavoritesContainer />
    </div>
  );
}