import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @Get('email/:email')
  findByEmail(@Param('email') email: string) {
    return this.userService.findByEmail(email);
  }

  @Get('pseudo/:pseudo')
  findByPseudo(@Param('pseudo') pseudo: string) {
    return this.userService.findByPseudo(pseudo);
  }

  @Get(':userId/rated-pokemons')
  findRatedPokemons(@Param('userId') userId: string) {
    return this.userService.findRatedPokemons(+userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':userId/rate-pokemon/:pokemonId')
  async ratePokemon(
    @Req() req,
    @Param('userId') userId: string,
    @Param('pokemonId') pokemonId: string,
    @Body() body: { rating: number }
  ) {
    // Vérifie que l'utilisateur authentifié ne peut noter que pour lui-même.
    console.log(req.user.id, userId, "il est là");
    if (+userId !== req.user.id) {
      throw new UnauthorizedException("Vous ne pouvez pas noter pour un autre utilisateur");
    }
    return this.userService.ratePokemon(+userId, +pokemonId, body.rating);
  }

  @Post(':userId/favorite-pokemon/:pokemonId')
  addFavoritePokemon(@Param('userId') userId: string, @Param('pokemonId') pokemonId: string) {
    return this.userService.addFavoritePokemon(+userId, +pokemonId);
  }

  @Delete(':userId/favorite-pokemon/:pokemonId')
  removeFavoritePokemon(@Param('userId') userId: string, @Param('pokemonId') pokemonId: string) {
    return this.userService.removeFavoritePokemon(+userId, +pokemonId);
  }

  @Get(':userId/favorite-pokemons')
  findFavoritePokemons(@Param('userId') userId: string) {
    return this.userService.findFavoritePokemons(+userId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard) // Protège la route avec le guard JWT
  getProfile(@Req() req) {
    return req.user; // `user` est accessible grâce au JwtStrategy
  }
}
