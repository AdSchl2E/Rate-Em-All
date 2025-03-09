import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';

@Controller('pokemon')
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
  findOne(@Param('id') id: string) {
    return this.pokemonService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePokemonDto: UpdatePokemonDto) {
    return this.pokemonService.update(+id, updatePokemonDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pokemonService.remove(+id);
  }

  @Get('name/:name')
  findByName(@Param('name') name: string) {
    return this.pokemonService.findByName(name);
  }

  @Get('pokedexId/:pokedexId')
  findByPokedexId(@Param('pokedexId') pokedexId: string) {
    return this.pokemonService.findByPokedexId(+pokedexId);
  }

  @Post(':pokemonId/rate/:rating')
  ratePokemon(@Param('pokemonId') pokemonId: string, @Param('rating') rating: string) {
    return this.pokemonService.ratePokemon(+pokemonId, +rating);
  }

  @Get(':pokemonId/rating')
  getRating(@Param('pokemonId') pokemonId: string) {
    return this.pokemonService.getRating(+pokemonId);
  }

  @Get(':pokemonId/numberOfVotes')
  getNumberOfVotes(@Param('pokemonId') pokemonId: string) {
    return this.pokemonService.getNumberOfVotes(+pokemonId);
  }
}
