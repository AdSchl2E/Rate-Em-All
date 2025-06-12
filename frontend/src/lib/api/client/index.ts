import { clientApiRequest } from './base';
import { clientAuth } from './auth';
import { clientUser } from './user';
import { clientPokemon } from './pokemon';

// Create a unified API client
const clientApi = {
  auth: clientAuth,
  user: clientUser,
  pokemon: clientPokemon,
  request: clientApiRequest
};

export {
  clientApiRequest,
  clientAuth,
  clientUser,
  clientPokemon
};

export default clientApi;