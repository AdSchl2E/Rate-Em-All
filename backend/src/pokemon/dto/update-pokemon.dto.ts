/**
 * Data Transfer Object for updating a Pokemon
 * Extends CreatePokemonDto to make all fields optional
 */
import { PartialType } from '@nestjs/mapped-types';
import { CreatePokemonDto } from './create-pokemon.dto';

export class UpdatePokemonDto extends PartialType(CreatePokemonDto) {}
