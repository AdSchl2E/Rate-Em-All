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
exports.PokemonController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_pokemon_rating_entity_1 = require("./entities/user-pokemon-rating.entity");
const pokemon_service_1 = require("./pokemon.service");
const create_pokemon_dto_1 = require("./dto/create-pokemon.dto");
const update_pokemon_dto_1 = require("./dto/update-pokemon.dto");
let PokemonController = class PokemonController {
    pokemonService;
    userPokemonRatingRepository;
    constructor(pokemonService, userPokemonRatingRepository) {
        this.pokemonService = pokemonService;
        this.userPokemonRatingRepository = userPokemonRatingRepository;
    }
    create(createPokemonDto) {
        return this.pokemonService.create(createPokemonDto);
    }
    findAll() {
        return this.pokemonService.findAll();
    }
    async getTopRated(limit = 10) {
        return this.pokemonService.getTopRated(limit);
    }
    async getTrending(limit = 4) {
        return this.pokemonService.getTrending(limit);
    }
    async findByPokedexId(pokedexId, userId) {
        const parsedId = parseInt(pokedexId, 10);
        if (isNaN(parsedId)) {
            throw new common_1.BadRequestException(`The pokedexId '${pokedexId}' is not a valid number`);
        }
        const pokemon = await this.pokemonService.findByPokedexId(parsedId);
        if (userId) {
            try {
                const userRating = await this.userPokemonRatingRepository.findOne({
                    where: {
                        user: { id: userId },
                        pokemon: { pokedexId: parsedId },
                    },
                });
                if (userRating) {
                    return { ...pokemon, userRating: userRating.rating };
                }
            }
            catch (error) {
                console.error(`Error fetching user rating: ${error.message}`);
            }
        }
        return pokemon;
    }
    async getPokemon(id) {
        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId)) {
            throw new common_1.BadRequestException(`L'ID '${id}' n'est pas un nombre valide`);
        }
        return this.pokemonService.findOne(parsedId);
    }
    update(id, updatePokemonDto) {
        return this.pokemonService.update(+id, updatePokemonDto);
    }
    remove(id) {
        return this.pokemonService.remove(+id);
    }
    async ratePokemon(id, body) {
        const pokemonId = parseInt(id, 10);
        return await this.pokemonService.ratePokemon(pokemonId, body.rating);
    }
    async getBatchRatings(idsParam) {
        if (!idsParam) {
            return {};
        }
        try {
            const ids = idsParam
                .split(',')
                .map((id) => parseInt(id, 10))
                .filter((id) => !isNaN(id));
            if (ids.length === 0) {
                return {};
            }
            const pokemons = await Promise.all(ids.map(async (id) => {
                try {
                    const pokemon = await this.pokemonService.findByPokedexId(id);
                    return { id, pokemon };
                }
                catch (error) {
                    console.error(`Error fetching pokemon ${id}:`, error);
                    return { id, pokemon: null };
                }
            }));
            const result = {};
            pokemons.forEach(({ id, pokemon }) => {
                if (pokemon) {
                    result[id] = {
                        rating: pokemon.rating || 0,
                        numberOfVotes: pokemon.numberOfVotes || 0,
                    };
                }
                else {
                    result[id] = { rating: 0, numberOfVotes: 0 };
                }
            });
            return result;
        }
        catch (error) {
            console.error('Error in batch ratings:', error);
            return {};
        }
    }
};
exports.PokemonController = PokemonController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_pokemon_dto_1.CreatePokemonDto]),
    __metadata("design:returntype", void 0)
], PokemonController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PokemonController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('top-rated'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PokemonController.prototype, "getTopRated", null);
__decorate([
    (0, common_1.Get)('trending'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PokemonController.prototype, "getTrending", null);
__decorate([
    (0, common_1.Get)('pokedexId/:pokedexId'),
    __param(0, (0, common_1.Param)('pokedexId')),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], PokemonController.prototype, "findByPokedexId", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PokemonController.prototype, "getPokemon", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_pokemon_dto_1.UpdatePokemonDto]),
    __metadata("design:returntype", void 0)
], PokemonController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PokemonController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/rate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PokemonController.prototype, "ratePokemon", null);
__decorate([
    (0, common_1.Get)('ratings/batch'),
    __param(0, (0, common_1.Query)('ids')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PokemonController.prototype, "getBatchRatings", null);
exports.PokemonController = PokemonController = __decorate([
    (0, common_1.Controller)('pokemons'),
    __param(1, (0, typeorm_1.InjectRepository)(user_pokemon_rating_entity_1.UserPokemonRating)),
    __metadata("design:paramtypes", [pokemon_service_1.PokemonService,
        typeorm_2.Repository])
], PokemonController);
//# sourceMappingURL=pokemon.controller.js.map