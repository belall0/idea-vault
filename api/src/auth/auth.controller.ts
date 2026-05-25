import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';

import { AuthService } from './auth.service';
import { AppConfigService } from '../app-config/app-config.service';
import { RegisterDto, LoginDto } from './types';

@Throttle({ default: { limit: 10, ttl: 60000 } })
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private config: AppConfigService,
  ) {}

  @Post('register')
  public register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  public async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, rawRefreshToken } =
      await this.authService.login(loginDto);

    res.cookie(
      this.config.authOptions.refreshTokenCookie,
      rawRefreshToken,
      this.config.authOptions.cookieOptions,
    );

    return { access_token: accessToken };
  }

  @Throttle({ default: { limit: 100, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  public async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookies = req.cookies as Record<string, string | undefined>;
    const rawRefreshToken = cookies[this.config.authOptions.refreshTokenCookie];

    if (!rawRefreshToken) {
      throw new UnauthorizedException();
    }

    const { accessToken, rawRefreshToken: newRawRefreshToken } =
      await this.authService.refresh(rawRefreshToken);

    res.cookie(
      this.config.authOptions.refreshTokenCookie,
      newRawRefreshToken,
      this.config.authOptions.cookieOptions,
    );

    return { access_token: accessToken };
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  public async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookies = req.cookies as Record<string, string | undefined>;
    const rawRefreshToken = cookies[this.config.authOptions.refreshTokenCookie];

    if (rawRefreshToken) {
      await this.authService.logout(rawRefreshToken);
    }

    res.clearCookie(this.config.authOptions.refreshTokenCookie, {
      path: this.config.authOptions.cookieOptions.path,
    });

    return { success: true };
  }
}
