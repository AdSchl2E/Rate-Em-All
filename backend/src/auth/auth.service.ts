import { Injectable, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { race } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) { }

  async signup(pseudo: string, password: string) {
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with hashed password
    return this.userService.create({
      pseudo,
      password: hashedPassword,
      ratedPokemons: [],
      favoritePokemons: [],
    });
  }

  async login(pseudo: string, password: string) {
    const user = await this.userService.findByPseudo(pseudo);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    const payload = { id: user.id, pseudo: user.pseudo };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      id: user.id,
      pseudo: user.pseudo,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      ratedPokemons: user.ratedPokemons,
      favoritePokemons: user.favoritePokemons,
    };
  }
}
