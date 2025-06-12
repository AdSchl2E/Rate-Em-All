import PageHeader from '@/components/server/shared/PageHeader';
import FavoritesContainer from '@/components/client/pokemon/favorites/FavoritesContainer';

export async function FavoritesPage() {
  // Le composant serveur peut vérifier l'authentification et pré-charger des données
  // si nécessaire, avec une gestion SSR optimale
  
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Mes Pokémon Favoris"
        description="Retrouvez tous vos Pokémon préférés au même endroit"
        icon="heart"
      />
      
      {/* Composant client pour la partie interactive */}
      <FavoritesContainer />
    </div>
  );
}