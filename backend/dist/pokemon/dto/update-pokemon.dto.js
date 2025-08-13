"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePokemonDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_pokemon_dto_1 = require("./create-pokemon.dto");
class UpdatePokemonDto extends (0, mapped_types_1.PartialType)(create_pokemon_dto_1.CreatePokemonDto) {
}
exports.UpdatePokemonDto = UpdatePokemonDto;
//# sourceMappingURL=update-pokemon.dto.js.map