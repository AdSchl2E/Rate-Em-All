import { Injectable, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService)) // 🔥 Utilisation de forwardRef pour casser la boucle
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) { }

  async signup(name: string, pseudo: string, email: string, password: string) {
    // Hachage du mot de passe avant de le sauvegarder
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création de l'utilisateur avec le mot de passe haché
    return this.userService.create({
      name,
      pseudo,
      email,
      password: hashedPassword,  // Utilisation du mot de passe haché
      favoritePokemons: [],
    });
  }


  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    const payload = { id: user.id, email: user.email, pseudo: user.pseudo };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      id: user.id,
      name: user.name,
      email: user.email,
      pseudo: user.pseudo,
      favoritePokemons: user.favoritePokemons,
    };
  }

}
