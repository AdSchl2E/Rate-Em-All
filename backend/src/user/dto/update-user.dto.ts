/**
 * Data Transfer Object for updating a User
 * Extends CreateUserDto to make all fields optional
 */
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
