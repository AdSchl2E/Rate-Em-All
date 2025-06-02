import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, Query, Req } from '@nestjs/common';
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

  @Post()
  create(@Body() createPokemonDto: CreatePokemonDto) {
    return this.pokemonService.create(createPokemonDto);
  }

  @Get()
  findAll() {
    return this.pokemonService.findAll();
  }

  // Routes spécifiques AVANT la route wildcard :id
  @Get('top-rated')
  async getTopRated(@Query('limit') limit: number = 10) {
    return this.pokemonService.getTopRated(limit);
  }

  @Get('trending')
  async getTrending(@Query('limit') limit: number = 4) {
    return this.pokemonService.getTrending(limit);
  }

  @Get('pokedexId/:pokedexId')
  async findByPokedexId(
    @Param('pokedexId') pokedexId: string,
    @Query('userId') userId?: number,
    @Req() req?: any
  ) {
    const parsedId = parseInt(pokedexId, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException(`Le pokedexId '${pokedexId}' n'est pas un nombre valide`);
    }
    
    const pokemon = await this.pokemonService.findByPokedexId(parsedId);
    
    // Si un userId est fourni, vérifier si l'utilisateur a déjà noté ce Pokémon
    if (userId) {
      try {
        const userRating = await this.userPokemonRatingRepository.findOne({
          where: { 
            user: { id: userId }, 
            pokemon: { pokedexId: parsedId } 
          }
        });
        
        if (userRating) {
          return { ...pokemon, userRating: userRating.rating };
        }
      } catch (error) {
        // Gérer silencieusement les erreurs et continuer
        console.error(`Erreur lors de la récupération de la note utilisateur: ${error.message}`);
      }
    }
    
    // Retourner les données Pokémon standard si pas de rating utilisateur
    return pokemon;
  }

  // Route wildcard :id APRÈS les routes spécifiques
  @Get(':id')
  async getPokemon(@Param('id') id: string) {
    // Vérifier si l'ID est un nombre valide
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException(`L'ID '${id}' n'est pas un nombre valide`);
    }
    
    return this.pokemonService.findOne(parsedId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePokemonDto: UpdatePokemonDto) {
    return this.pokemonService.update(+id, updatePokemonDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pokemonService.remove(+id);
  }

  @Post(':id/rate')
  async ratePokemon(@Param('id') id: string, @Body() body: { rating: number }) {
    const pokemonId = parseInt(id, 10);
    return await this.pokemonService.ratePokemon(pokemonId, body.rating);
  }
}
