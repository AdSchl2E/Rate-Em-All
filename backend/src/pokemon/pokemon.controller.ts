import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';

@Controller('pokemons')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Post()
  create(@Body() createPokemonDto: CreatePokemonDto) {
    return this.pokemonService.create(createPokemonDto);
  }

  @Get()
  findAll() {
    return this.pokemonService.findAll();
  }

  @Get(':id')
  async getPokemon(@Param('id') id: string) {
    const pokemonId = parseInt(id, 10);
    return await this.pokemonService.findOne(pokemonId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePokemonDto: UpdatePokemonDto) {
    return this.pokemonService.update(+id, updatePokemonDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pokemonService.remove(+id);
  }

  @Get('pokedexId/:pokedexId')
  findByPokedexId(@Param('pokedexId') pokedexId: string) {
    return this.pokemonService.findByPokedexId(+pokedexId);
  }

  @Post(':id/rate')
  async ratePokemon(@Param('id') id: string, @Body() body: { rating: number }) {
    const pokemonId = parseInt(id, 10);
    return await this.pokemonService.ratePokemon(pokemonId, body.rating);
  }
}
