# API Simplifiée Rate-Em-All

Cette nouvelle structure simplifie considérablement la gestion de l'API en regroupant tout dans quelques fichiers principaux.

## Structure

- **`api.ts`** : API client et serveur unifiée (principal)
- **`pokeapi.ts`** : Utilitaires pour les appels directs à PokeAPI
- **`index.ts`** : Exports principaux

## Utilisation

### Pour les composants client ('use client')

```typescript
import api from '@/lib/api';

// Dans un composant
const MyComponent = () => {
  const [pokemons, setPokemons] = useState([]);
  
  useEffect(() => {
    const loadData = async () => {
      // Récupérer des Pokemon
      const data = await api.pokemon.getList(0, 20);
      setPokemons(data.pokemons);
      
      // Rechercher
      const results = await api.pokemon.search('pikachu');
      
      // Noter un Pokemon
      await api.user.ratePokemon(25, 5);
      
      // Obtenir les favoris
      const favorites = await api.user.getUserFavorites();
    };
    
    loadData();
  }, []);
  
  return <div>...</div>;
};
```

### Pour les Server Components

```typescript
import { serverApi } from '@/lib/api';

export default async function ServerPage() {
  const topRated = await serverApi.pokemon.getTopRated(10);
  const trending = await serverApi.pokemon.getTrending(5);
  
  return (
    <div>
      {/* Votre JSX */}
    </div>
  );
}
```

### Hooks personnalisés recommandés

```typescript
// useAuth.ts
export function useAuth() {
  const { data: session } = useSession();
  
  const register = async (userData) => {
    try {
      const result = await api.auth.register(userData);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  return { user: session?.user, register };
}

// usePokemon.ts
export function usePokemon() {
  const ratePokemon = async (pokemonId, rating) => {
    try {
      const result = await api.user.ratePokemon(pokemonId, rating);
      return { success: true, ...result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  return { ratePokemon };
}
```

## Migration depuis l'ancien code

### Remplacez les imports :
- `import { clientPokemon } from '@/lib/api/client'` → `import api from '@/lib/api'`
- `import { serverPokemon } from '@/lib/api/server'` → `import { serverApi } from '@/lib/api'`

### Remplacez les appels :
- `clientPokemon.getTopRated(10)` → `api.pokemon.getTopRated(10)`
- `serverPokemon.getTopRated(10)` → `serverApi.pokemon.getTopRated(10)`

## Avantages

1. **Moins de fichiers** : Tout est dans 2-3 fichiers principaux
2. **API unifiée** : Même interface pour client et serveur
3. **Plus simple à maintenir** : Moins de duplication de code
4. **Meilleure lisibilité** : Structure plus claire

## Prochaines étapes

1. Utilisez la nouvelle API dans vos composants
2. Supprimez progressivement les anciens dossiers `/client`, `/server`, `/shared`
3. Créez des hooks personnalisés pour les opérations communes
4. Ajoutez des méthodes manquantes si nécessaire
