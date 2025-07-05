// API simplifié unifié
export { default as api, serverApi, serverApiRequest } from './api';
export * from './api';
export * from './pokeapi';
export * from './types';
export * from './hooks';

// Pour une compatibilité temporaire, on garde les exports existants
// Vous pouvez progressivement migrer vers la nouvelle API

// Import recommandé :
// import api from '@/lib/api'; // Pour les composants client
// import { serverApi } from '@/lib/api'; // Pour les Server Components
// import { useAuth, usePokemon } from '@/lib/api'; // Pour les hooks