import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
export declare class AuthService {
    private readonly userService;
    private readonly jwtService;
    constructor(userService: UserService, jwtService: JwtService);
    signup(pseudo: string, password: string): Promise<import("../user/entities/user.entity").User>;
    login(pseudo: string, password: string): Promise<{
        accessToken: string;
        id: number;
        pseudo: string;
        createdAt: Date;
        updatedAt: Date;
        ratedPokemons: number[];
        favoritePokemons: number[];
    }>;
}
