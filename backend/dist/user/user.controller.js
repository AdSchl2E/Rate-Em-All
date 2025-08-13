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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
const create_user_dto_1 = require("./dto/create-user.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let UserController = class UserController {
    userService;
    constructor(userService) {
        this.userService = userService;
    }
    create(createUserDto) {
        return this.userService.create(createUserDto);
    }
    findAll() {
        return this.userService.findAll();
    }
    getProfile(req) {
        return req.user;
    }
    async checkUsername(username, userIdParam) {
        if (!username) {
            throw new common_1.BadRequestException('Username is required');
        }
        let userId = null;
        if (userIdParam) {
            userId = parseInt(userIdParam);
            if (isNaN(userId)) {
                console.warn(`Invalid user ID received: ${userIdParam}`);
                userId = null;
            }
        }
        console.log(`Checking username availability: ${username}, User ID: ${userId}`);
        const existingUser = await this.userService.findByUsername(username);
        const available = !existingUser || (userId !== null && existingUser.id === userId);
        return { available };
    }
    findByPseudo(pseudo) {
        return this.userService.findByPseudo(pseudo);
    }
    findOne(id) {
        console.log(`Finding user with ID: ${id}`);
        return this.userService.findOne(+id);
    }
    update(id, updateUserDto) {
        return this.userService.update(+id, updateUserDto);
    }
    remove(id) {
        return this.userService.remove(+id);
    }
    findRatedPokemons(userId) {
        return this.userService.findRatedPokemons(+userId);
    }
    async ratePokemon(req, userId, pokedexId, body) {
        if (+userId !== req.user.id) {
            throw new common_1.UnauthorizedException('You cannot rate for another user');
        }
        return this.userService.ratePokemon(+userId, +pokedexId, body.rating);
    }
    async setFavoritePokemon(userId, pokedexId) {
        const pokemonData = await this.userService.setFavoritePokemon(+userId, +pokedexId);
        return {
            isFavorite: pokemonData.isFavorite,
            pokemonName: pokemonData.pokemonName,
        };
    }
    async getUserFavoritePokemons(req, userId) {
        if (+userId !== req.user.id) {
            throw new common_1.UnauthorizedException("You cannot access another user's favorites");
        }
        const favorites = await this.userService.getUserFavoritePokemons(+userId);
        return { favorites: Array.isArray(favorites) ? favorites : [] };
    }
    async getUserRatings(req, userId) {
        if (+userId !== req.user.id) {
            throw new common_1.UnauthorizedException("You cannot access another user's ratings");
        }
        const ratings = await this.userService.getUserRatings(+userId);
        return { ratings };
    }
    async checkIsFavorite(req, userId, pokedexId) {
        if (+userId !== req.user.id) {
            throw new common_1.UnauthorizedException("You cannot access another user's favorites");
        }
        const isFavorite = await this.userService.checkIsFavorite(+userId, +pokedexId);
        return { isFavorite };
    }
    async toggleFavoritePokemon(userId, pokedexId) {
        try {
            return await this.userService.toggleFavoritePokemon(userId, pokedexId);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Error updating favorite');
        }
    }
    async changePassword(req, userIdParam, body) {
        const userId = parseInt(userIdParam);
        if (isNaN(userId)) {
            throw new common_1.BadRequestException('Invalid user ID');
        }
        if (userId !== req.user.id) {
            throw new common_1.UnauthorizedException("You cannot change another user's password");
        }
        try {
            return await this.userService.changePassword(userId, body.currentPassword, body.newPassword);
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            console.error('Error changing password:', error);
            throw new common_1.InternalServerErrorException('Error changing password');
        }
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UserController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)('check-username'),
    __param(0, (0, common_1.Query)('username')),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "checkUsername", null);
__decorate([
    (0, common_1.Get)('pseudo/:pseudo'),
    __param(0, (0, common_1.Param)('pseudo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "findByPseudo", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':userId/rated-pokemons'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "findRatedPokemons", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':userId/rate-pokemon/:pokedexId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Param)('pokedexId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "ratePokemon", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':userId/favorite-pokemon/:pokedexId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('pokedexId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "setFavoritePokemon", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':userId/favorite-pokemon'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUserFavoritePokemons", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':userId/ratings'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUserRatings", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':userId/favorite-pokemon/:pokedexId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Param)('pokedexId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "checkIsFavorite", null);
__decorate([
    (0, common_1.Post)(':id/favorite-pokemon/:pokedexId'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('pokedexId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "toggleFavoritePokemon", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':userId/change-password'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "changePassword", null);
exports.UserController = UserController = __decorate([
    (0, common_1.Controller)('user'),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
//# sourceMappingURL=user.controller.js.map