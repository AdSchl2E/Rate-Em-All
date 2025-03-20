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
  @Post(':userId/rate-pokemon/:pokedexId')
  async ratePokemon(
    @Req() req,
    @Param('userId') userId: string,
    @Param('pokedexId') pokedexId: string,
    @Body() body: { rating: number }
  ) {
    // Vérifie que l'utilisateur authentifié ne peut noter que pour lui-même.
    if (+userId !== req.user.id) {
      throw new UnauthorizedException("Vous ne pouvez pas noter pour un autre utilisateur");
    }
    return this.userService.ratePokemon(+userId, +pokedexId, body.rating);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':userId/favorite-pokemon/:pokedexId')
  setFavoritePokemon(@Param('userId') userId: string, @Param('pokedexId') pokedexId: string) {
    return this.userService.setFavoritePokemon(+userId, +pokedexId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId/favorite-pokemon')
  findFavoritePokemons(@Param('userId') userId: string) {
    return this.userService.findFavoritePokemons(+userId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard) // Protège la route avec le guard JWT
  getProfile(@Req() req) {
    return req.user; // `user` est accessible grâce au JwtStrategy
  }
}
