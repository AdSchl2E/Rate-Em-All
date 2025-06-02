// backend/src/pokemon/pokemon.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PokemonService } from './pokemon.service';
import { PokemonController } from './pokemon.controller';
import { Pokemon } from './entities/pokemon.entity';
import { UserPokemonRating } from './entities/user-pokemon-rating.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pokemon, UserPokemonRating]),
  ],
  controllers: [PokemonController],
  providers: [PokemonService],
  exports: [PokemonService],
})
export class PokemonModule {}
