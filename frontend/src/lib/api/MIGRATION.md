# Guide de Migration vers l'API Simplifiée

## Résumé des changements

✅ **Avant** : 15+ fichiers répartis dans `/client`, `/server`, `/shared`  
✅ **Après** : 5 fichiers principaux

## Structure simplifiée

```
/lib/api/
├── api.ts          # API principale (client + serveur)
├── types.ts        # Types TypeScript
├── hooks.ts        # Hooks React personnalisés
├── pokeapi.ts      # Utilitaires PokeAPI
├── index.ts        # Exports
└── README.md       # Documentation
```

## Migration étape par étape

### 1. Remplacer les imports

**Ancien code :**
```typescript
import { clientPokemon } from '@/lib/api/client';
import { serverPokemon } from '@/lib/api/server';
import { API_CONFIG } from '@/lib/api/shared/config';
```

**Nouveau code :**
```typescript
import api, { serverApi } from '@/lib/api';
// API_CONFIG est maintenant intégré dans api.ts
```

### 2. Remplacer les appels API

**Ancien code :**
```typescript
// Client
const pokemons = await clientPokemon.getTopRated(10);
const userRatings = await clientUser.getUserRatings();

// Serveur
const trending = await serverPokemon.getTrending(5);
```

**Nouveau code :**
```typescript
// Client
const pokemons = await api.pokemon.getTopRated(10);
const userRatings = await api.user.getUserRatings();

// Serveur
const trending = await serverApi.pokemon.getTrending(5);
```

### 3. Utiliser les hooks (recommandé)

**Ancien code :**
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const handleRate = async (pokemonId, rating) => {
  setLoading(true);
  try {
    await clientUser.ratePokemon(pokemonId, rating);
    // ... gestion du succès
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

**Nouveau code :**
```typescript
import { usePokemon } from '@/lib/api';

const { loading, error, ratePokemon } = usePokemon();

const handleRate = async (pokemonId, rating) => {
  const result = await ratePokemon(pokemonId, rating);
  if (result.success) {
    // ... gestion du succès
  } else {
    // L'erreur est automatiquement gérée dans le hook
  }
};
```

## Avantages de la nouvelle structure

1. **Moins de fichiers** : 5 fichiers au lieu de 15+
2. **API unifiée** : Même interface partout
3. **Hooks intégrés** : Gestion d'état automatique
4. **TypeScript amélioré** : Meilleur typage
5. **Maintenance facile** : Code centralisé

## Actions à faire

1. ✅ Tester la nouvelle API avec un composant simple
2. ⏳ Migrer progressivement vos composants
3. ⏳ Supprimer les anciens dossiers une fois la migration terminée

## Fichiers à supprimer après migration

```
/lib/api/client/     # Tout le dossier
/lib/api/server/     # Tout le dossier  
/lib/api/shared/     # Tout le dossier
```

## Exemple d'utilisation rapide

```typescript
// Dans un composant client
import { useAuth, usePokemon } from '@/lib/api';

const MyComponent = () => {
  const { user, isAuthenticated } = useAuth();
  const { loading, ratePokemon, getTopRated } = usePokemon();
  
  // ... votre logique
};

// Dans un Server Component
import { serverApi } from '@/lib/api';

export default async function ServerPage() {
  const topRated = await serverApi.pokemon.getTopRated(10);
  return <div>{/* ... */}</div>;
}
```
