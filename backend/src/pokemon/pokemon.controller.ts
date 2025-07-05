/**
 * Pokemon controller
 * Handles all HTTP requests related to Pokemon resources
 */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPokemonRating } from './entities/user-pokemon-rating.entity';
import { PokemonService } from './pokemon.service';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';

@Controller('pokemons')
export class PokemonController {
  constructor(
    private readonly pokemonService: PokemonService,
    @InjectRepository(UserPokemonRating)
    private readonly userPokemonRatingRepository: Repository<UserPokemonRating>,
  ) {}

  /**
   * Create a new Pokemon
   * @param {CreatePokemonDto} createPokemonDto - Data for creating a new Pokemon
   * @returns {Promise<any>} Newly created Pokemon
   */
  @Post()
  create(@Body() createPokemonDto: CreatePokemonDto) {
    return this.pokemonService.create(createPokemonDto);
  }

  /**
   * Get all Pokemon
   * @returns {Promise<any[]>} List of all Pokemon
   */
  @Get()
  findAll() {
    return this.pokemonService.findAll();
  }

  /**
   * Get top rated Pokemon
   * @param {number} limit - Maximum number of Pokemon to return (default: 10)
   * @returns {Promise<any[]>} List of top rated Pokemon
   */
  @Get('top-rated')
  async getTopRated(@Query('limit') limit: number = 10) {
    return this.pokemonService.getTopRated(limit);
  }

  /**
   * Get trending Pokemon based on number of votes
   * @param {number} limit - Maximum number of Pokemon to return (default: 4)
   * @returns {Promise<any[]>} List of trending Pokemon
   */
  @Get('trending')
  async getTrending(@Query('limit') limit: number = 4) {
    return this.pokemonService.getTrending(limit);
  }

  /**
   * Get Pokemon by Pokedex ID with optional user rating
   * @param {string} pokedexId - The Pokedex ID of the Pokemon
   * @param {number} userId - Optional user ID to check if user has rated the Pokemon
   * @returns {Promise<any>} Pokemon data, possibly with user's rating
   * @throws {BadRequestException} If pokedexId is not a valid number
   */
  @Get('pokedexId/:pokedexId')
  async findByPokedexId(
    @Param('pokedexId') pokedexId: string,
    @Query('userId') userId?: number,
  ) {
    const parsedId = parseInt(pokedexId, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException(
        `The pokedexId '${pokedexId}' is not a valid number`,
      );
    }

    const pokemon = await this.pokemonService.findByPokedexId(parsedId);

    if (userId) {
      try {
        const userRating = await this.userPokemonRatingRepository.findOne({
          where: {
            user: { id: userId },
            pokemon: { pokedexId: parsedId },
          },
        });

        if (userRating) {
          return { ...pokemon, userRating: userRating.rating };
        }
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        console.error(`Error fetching user rating: ${error.message}`);
      }
    }

    return pokemon;
  }

  /**
   * Get Pokemon by ID
   * @param {string} id - The ID of the Pokemon
   * @returns {Promise<any>} Pokemon data
   * @throws {BadRequestException} If ID is not a valid number
   */
  @Get(':id')
  async getPokemon(@Param('id') id: string) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException(`L'ID '${id}' n'est pas un nombre valide`);
    }

    return this.pokemonService.findOne(parsedId);
  }

  /**
   * Update a Pokemon
   * @param {string} id - The ID of the Pokemon to update
   * @param {UpdatePokemonDto} updatePokemonDto - Data for updating the Pokemon
   * @returns {Promise<any>} Updated Pokemon
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePokemonDto: UpdatePokemonDto) {
    return this.pokemonService.update(+id, updatePokemonDto);
  }

  /**
   * Delete a Pokemon
   * @param {string} id - The ID of the Pokemon to delete
   * @returns {Promise<any>} Deletion confirmation
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pokemonService.remove(+id);
  }

  /**
   * Rate a Pokemon
   * @param {string} id - The ID of the Pokemon to rate
   * @param {Object} body - Rating data
   * @param {number} body.rating - Rating value
   * @returns {Promise<any>} Updated Pokemon with new rating
   */
  @Post(':id/rate')
  async ratePokemon(@Param('id') id: string, @Body() body: { rating: number }) {
    const pokemonId = parseInt(id, 10);
    return await this.pokemonService.ratePokemon(pokemonId, body.rating);
  }

  /**
   * Get ratings for multiple Pokemon in a batch
   * @param {string} idsParam - Comma-separated list of Pokemon IDs
   * @returns {Promise<Record<string, {rating: number, numberOfVotes: number}>>} Ratings for each Pokemon ID
   */
  @Get('ratings/batch')
  async getBatchRatings(@Query('ids') idsParam: string) {
    if (!idsParam) {
      return {};
    }

    try {
      const ids = idsParam
        .split(',')
        .map((id) => parseInt(id, 10))
        .filter((id) => !isNaN(id));

      if (ids.length === 0) {
        return {};
      }

      const pokemons = await Promise.all(
        ids.map(async (id) => {
          try {
            const pokemon = await this.pokemonService.findByPokedexId(id);
            return { id, pokemon };
          } catch (error) {
            console.error(`Error fetching pokemon ${id}:`, error);
            return { id, pokemon: null };
          }
        }),
      );

      const result = {};
      pokemons.forEach(({ id, pokemon }) => {
        if (pokemon) {
          result[id] = {
            rating: pokemon.rating || 0,
            numberOfVotes: pokemon.numberOfVotes || 0,
          };
        } else {
          result[id] = { rating: 0, numberOfVotes: 0 };
        }
      });

      return result;
    } catch (error) {
      console.error('Error in batch ratings:', error);
      return {};
    }
  }
}
