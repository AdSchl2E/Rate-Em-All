import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(name: string, pseudo: string, email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.userService.create({
        name, pseudo, email, password: hashedPassword,
        favoritePokemons: []
    });
  }

  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    const payload = { id: user.id, email: user.email, pseudo: user.pseudo };
    return { accessToken: this.jwtService.sign(payload) };
  }
}
