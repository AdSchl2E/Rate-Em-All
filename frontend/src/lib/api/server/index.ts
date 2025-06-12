import { serverApiRequest, serverPokeApiRequest } from './base';
import { serverAuth } from './auth';
import { serverPokemon } from './pokemon';
import { serverUser } from './user';

// Unified server API
const serverApi = {
  auth: serverAuth,
  pokemon: serverPokemon,
  user: serverUser,
  request: serverApiRequest,
  pokeApi: serverPokeApiRequest
};

export {
  serverApiRequest,
  serverPokeApiRequest,
  serverAuth,
  serverPokemon,
  serverUser
};

export default serverApi;