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
var PokemonService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PokemonService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const pokemon_entity_1 = require("./entities/pokemon.entity");
let PokemonService = PokemonService_1 = class PokemonService {
    pokemonRepository;
    logger = new common_1.Logger(PokemonService_1.name);
    constructor(pokemonRepository) {
        this.pokemonRepository = pokemonRepository;
    }
    async create(createPokemonDto) {
        const pokemon = this.pokemonRepository.create(createPokemonDto);
        return await this.pokemonRepository.save(pokemon);
    }
    async findAll() {
        return await this.pokemonRepository.find();
    }
    async findOne(id) {
        return await this.pokemonRepository.findOne({ where: { id } });
    }
    async update(id, updatePokemonDto) {
        const pokemon = await this.pokemonRepository.findOne({ where: { id } });
        if (!pokemon) {
            throw new Error('Pokemon not found');
        }
        Object.assign(pokemon, updatePokemonDto);
        return await this.pokemonRepository.save(pokemon);
    }
    async remove(id) {
        await this.pokemonRepository.delete(id);
        return { id };
    }
    async findByPokedexId(pokedexId) {
        const pokemon = await this.pokemonRepository.findOne({
            where: { pokedexId },
        });
        if (!pokemon) {
            return { rating: 0, numberOfVotes: 0 };
        }
        return pokemon;
    }
    async ratePokemon(pokemonId, rating) {
        let pokemon = await this.pokemonRepository.findOne({
            where: { pokedexId: pokemonId },
        });
        console.log(pokemon);
        if (!pokemon) {
            pokemon = this.pokemonRepository.create({
                pokedexId: pokemonId,
                rating,
                numberOfVotes: 1,
            });
            return await this.pokemonRepository.save(pokemon);
        }
        else {
            const newRating = (pokemon.rating * pokemon.numberOfVotes + rating) /
                (pokemon.numberOfVotes + 1);
            pokemon.rating = newRating;
            pokemon.numberOfVotes++;
            return await this.pokemonRepository.save(pokemon);
        }
    }
    async getTopRated(limit = 10) {
        try {
            const pokemons = await this.pokemonRepository.find({
                where: { numberOfVotes: (0, typeorm_2.MoreThan)(0) },
                order: { rating: 'DESC' },
                take: limit,
            });
            this.logger.log(`Retrieving ${pokemons.length} top rated Pokemon`);
            return pokemons;
        }
        catch (error) {
            this.logger.error(`Error retrieving top rated Pokemon: ${error.message}`);
            return [];
        }
    }
    async getTrending(limit = 4) {
        try {
            const pokemons = await this.pokemonRepository.find({
                where: { numberOfVotes: (0, typeorm_2.MoreThan)(0) },
                order: { numberOfVotes: 'DESC', rating: 'DESC' },
                take: limit,
            });
            this.logger.log(`Retrieving ${pokemons.length} trending Pokemon`);
            return pokemons;
        }
        catch (error) {
            this.logger.error(`Error retrieving trending Pokemon: ${error.message}`);
            return [];
        }
    }
};
exports.PokemonService = PokemonService;
exports.PokemonService = PokemonService = PokemonService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(pokemon_entity_1.Pokemon)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PokemonService);
//# sourceMappingURL=pokemon.service.js.map