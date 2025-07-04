/**
 * User module
 * Configures dependencies for user-related features
 * Exports the UserService for use in other modules
 */
// backend/src/user/user.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { Pokemon } from '../pokemon/entities/pokemon.entity';
import { UserPokemonRating } from '../pokemon/entities/user-pokemon-rating.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Pokemon, UserPokemonRating]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
