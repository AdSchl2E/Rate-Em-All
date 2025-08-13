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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPokemonRating = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../user/entities/user.entity");
const pokemon_entity_1 = require("./pokemon.entity");
let UserPokemonRating = class UserPokemonRating {
    id;
    userId;
    pokemonId;
    rating;
    user;
    pokemon;
};
exports.UserPokemonRating = UserPokemonRating;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UserPokemonRating.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], UserPokemonRating.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], UserPokemonRating.prototype, "pokemonId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float' }),
    __metadata("design:type", Number)
], UserPokemonRating.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], UserPokemonRating.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => pokemon_entity_1.Pokemon),
    (0, typeorm_1.JoinColumn)({ name: 'pokemonId' }),
    __metadata("design:type", pokemon_entity_1.Pokemon)
], UserPokemonRating.prototype, "pokemon", void 0);
exports.UserPokemonRating = UserPokemonRating = __decorate([
    (0, typeorm_1.Entity)('user_pokemon_ratings')
], UserPokemonRating);
//# sourceMappingURL=user-pokemon-rating.entity.js.map