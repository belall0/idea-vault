import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';

import { JwtGuard } from '../auth/guards/jwt.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UsersService } from './users.service';
import type { AuthenticatedUser } from '../auth/types';
import { EditUserDto } from './types';

@Controller('users')
@UseGuards(JwtGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  getCurrentUser(@GetUser() user: AuthenticatedUser) {
    return user;
  }

  @Patch('me')
  editUser(@GetUser('id') userId: string, @Body() editUserDto: EditUserDto) {
    return this.usersService.update(userId, editUserDto);
  }

  @Delete('me')
  async deleteUser(@GetUser('id') userId: string) {
    await this.usersService.delete(userId);
    return { success: true };
  }
}
