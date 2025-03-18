export class CreateUserDto {
    name: string;
    pseudo: string;
    email: string;
    password: string;
    ratedPokemons: number[];
    favoritePokemons: number[];
}
