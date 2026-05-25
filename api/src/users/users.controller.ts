import { Controller, Get, UseGuards } from '@nestjs/common';

import { JwtGuard } from '../auth/guards/jwt.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import type { AuthenticatedUser } from '../auth/types';

@Controller('users')
@UseGuards(JwtGuard)
export class UsersController {
  constructor() {}

  @Get('me')
  getCurrentUser(@GetUser() user: AuthenticatedUser) {
    return user;
  }
}
