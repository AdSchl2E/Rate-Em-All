import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    signup(body: {
        pseudo: string;
        password: string;
    }): Promise<import("../user/entities/user.entity").User>;
    login(body: {
        pseudo: string;
        password: string;
    }): Promise<{
        accessToken: string;
        id: number;
        pseudo: string;
        createdAt: Date;
        updatedAt: Date;
        ratedPokemons: number[];
        favoritePokemons: number[];
    }>;
}
