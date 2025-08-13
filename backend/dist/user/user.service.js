"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const pokemon_entity_1 = require("../pokemon/entities/pokemon.entity");
const user_pokemon_rating_entity_1 = require("../pokemon/entities/user-pokemon-rating.entity");
const bcrypt = require("bcrypt");
let UserService = class UserService {
    usersRepository;
    pokemonRepository;
    userPokemonRatingRepository;
    constructor(usersRepository, pokemonRepository, userPokemonRatingRepository) {
        this.usersRepository = usersRepository;
        this.pokemonRepository = pokemonRepository;
        this.userPokemonRatingRepository = userPokemonRatingRepository;
    }
    async create(createUserDto) {
        const user = this.usersRepository.create(createUserDto);
        return await this.usersRepository.save(user);
    }
    async findAll() {
        return await this.usersRepository.find();
    }
    async findOne(id) {
        const numericId = typeof id === 'string' ? parseInt(id) : id;
        if (isNaN(numericId)) {
            console.warn(`Invalid user ID provided: ${id}`);
            return null;
        }
        try {
            return await this.usersRepository.findOne({
                where: { id: numericId },
            });
        }
        catch (error) {
            console.error(`Error finding user with ID ${numericId}:`, error);
            throw error;
        }
    }
    async update(id, updateUserDto) {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) {
            throw new Error('User not found');
        }
        Object.assign(user, updateUserDto);
        return await this.usersRepository.save(user);
    }
    async remove(id) {
        const userRatings = await this.userPokemonRatingRepository.find({
            where: { userId: id },
            relations: ['pokemon'],
        });
        for (const userRating of userRatings) {
            const pokemon = userRating.pokemon;
            const userRatingValue = userRating.rating;
            const currentTotalScore = pokemon.rating * pokemon.numberOfVotes;
            const newNumberOfVotes = pokemon.numberOfVotes - 1;
            if (newNumberOfVotes > 0) {
                pokemon.rating =
                    (currentTotalScore - userRatingValue) / newNumberOfVotes;
                pokemon.numberOfVotes = newNumberOfVotes;
                await this.pokemonRepository.save(pokemon);
            }
            else {
                const hasRatings = await this.userPokemonRatingRepository.findOne({
                    where: { pokemonId: pokemon.id },
                });
                if (!hasRatings) {
                    await this.pokemonRepository.delete(pokemon.id);
                }
                await this.pokemonRepository.remove(pokemon);
            }
        }
        await this.userPokemonRatingRepository.delete({ userId: id });
        await this.usersRepository.delete(id);
        return { id };
    }
    async findByPseudo(pseudo) {
        return await this.usersRepository.findOne({ where: { pseudo } });
    }
    async findRatedPokemons(userId) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }
        return user.ratedPokemons;
    }
    async ratePokemon(userId, pokedexId, rating) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found.`);
        }
        let pokemon = await this.pokemonRepository.findOne({
            where: { pokedexId: pokedexId },
        });
        if (!pokemon) {
            pokemon = this.pokemonRepository.create({
                pokedexId,
                rating,
                numberOfVotes: 0,
            });
            await this.pokemonRepository.save(pokemon);
        }
        const existingRating = await this.userPokemonRatingRepository.findOne({
            where: {
                user: { id: user.id },
                pokemon: { id: pokemon.id },
            },
        });
        const ratedPokemonIndex = user.ratedPokemons.indexOf(pokedexId);
        if (existingRating) {
            const totalBefore = pokemon.rating * pokemon.numberOfVotes;
            const newTotal = totalBefore - existingRating.rating + rating;
            pokemon.rating = newTotal / pokemon.numberOfVotes;
            await this.pokemonRepository.save(pokemon);
            existingRating.rating = rating;
            await this.userPokemonRatingRepository.save(existingRating);
            return {
                message: 'Rating updated',
                pokemon,
                userRating: existingRating,
                updatedRating: pokemon.rating,
                numberOfVotes: pokemon.numberOfVotes,
            };
        }
        else {
            const totalBefore = pokemon.rating * pokemon.numberOfVotes;
            pokemon.numberOfVotes++;
            pokemon.rating = (totalBefore + rating) / pokemon.numberOfVotes;
            await this.pokemonRepository.save(pokemon);
            const newRatingRecord = this.userPokemonRatingRepository.create({
                user,
                pokemon,
                rating,
            });
            await this.userPokemonRatingRepository.save(newRatingRecord);
            if (ratedPokemonIndex === -1) {
                user.ratedPokemons.push(pokedexId);
                await this.usersRepository.save(user);
            }
            return {
                message: 'Rating created',
                pokemon,
                userRating: newRatingRecord,
                updatedRating: pokemon.rating,
                numberOfVotes: pokemon.numberOfVotes,
            };
        }
    }
    async setFavoritePokemon(userId, pokedexId) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }
        const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokedexId}`);
        const pokemonData = await pokemonResponse.json();
        const pokemonName = pokemonData.name;
        const index = user.favoritePokemons.indexOf(pokedexId);
        const isFavorite = index === -1;
        if (index !== -1) {
            user.favoritePokemons.splice(index, 1);
        }
        else {
            user.favoritePokemons.push(pokedexId);
        }
        await this.usersRepository.save(user);
        return {
            isFavorite: isFavorite,
            pokemonName,
        };
    }
    async findFavoritePokemons(userId) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }
        return user.favoritePokemons;
    }
    async getUserRatings(userId) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found.`);
        }
        const ratings = await this.userPokemonRatingRepository.find({
            where: { user: { id: userId } },
            relations: ['pokemon'],
        });
        return ratings.map((rating) => ({
            pokemonId: rating.pokemon.pokedexId,
            rating: rating.rating,
        }));
    }
    async checkIsFavorite(userId, pokedexId) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found.`);
        }
        return user.favoritePokemons.includes(pokedexId);
    }
    async toggleFavoritePokemon(userId, pokedexId) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found.`);
        }
        if (!Array.isArray(user.favoritePokemons)) {
            user.favoritePokemons = [];
        }
        const index = user.favoritePokemons.indexOf(pokedexId);
        let isFavorite = false;
        if (index > -1) {
            user.favoritePokemons.splice(index, 1);
            isFavorite = false;
        }
        else {
            user.favoritePokemons.push(pokedexId);
            isFavorite = true;
        }
        await this.usersRepository.save(user);
        console.log(`User ${userId} favorites updated: ${user.favoritePokemons}`);
        return { isFavorite };
    }
    async getUserFavoritePokemons(userId) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found.`);
        }
        return user.favoritePokemons || [];
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found.`);
        }
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Current password is incorrect');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await this.usersRepository.save(user);
        return { success: true };
    }
    async findByUsername(username) {
        if (!username)
            return null;
        try {
            return await this.usersRepository.findOne({
                where: { pseudo: username },
            });
        }
        catch (error) {
            console.error(`Error finding user with username ${username}:`, error);
            return null;
        }
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(pokemon_entity_1.Pokemon)),
    __param(2, (0, typeorm_1.InjectRepository)(user_pokemon_rating_entity_1.UserPokemonRating)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UserService);
//# sourceMappingURL=user.service.js.map