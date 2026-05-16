import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Patch,
  UseGuards,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { JwtGuard } from './guards';
import { GetUser } from './decorators';
import { RegisterDto, LoginDto, ChangePasswordDto } from './types';
import { AppConfigService } from '../app-config/app-config.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private appConfigService: AppConfigService,
  ) {}

  @Post('register')
  public register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  public async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, rawRefreshToken } =
      await this.authService.login(loginDto);

    // Refresh token goes into the cookie — never in the response body
    res.cookie(
      this.appConfigService.authOptions.refreshTokenCookie,
      rawRefreshToken,
      this.appConfigService.authOptions.cookieOptions,
    );

    // Access token goes in the body — frontend stores it in memory
    return { access_token: accessToken };
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  public async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookies = req.cookies as Record<string, string | undefined>;
    const rawRefreshToken =
      cookies[this.appConfigService.authOptions.refreshTokenCookie];

    if (!rawRefreshToken) {
      throw new UnauthorizedException();
    }

    const { accessToken, rawRefreshToken: newRawRefreshToken } =
      await this.authService.refresh(rawRefreshToken);

    // Issue the new rotated refresh token cookie
    res.cookie(
      this.appConfigService.authOptions.refreshTokenCookie,
      newRawRefreshToken,
      this.appConfigService.authOptions.cookieOptions,
    );

    return { access_token: accessToken };
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  // No JwtGuard here — an expired access token must not block logout.
  // The refresh token cookie is the only credential we need.
  public async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookies = req.cookies as Record<string, string | undefined>;
    const rawRefreshToken =
      cookies[this.appConfigService.authOptions.refreshTokenCookie];

    if (rawRefreshToken) {
      await this.authService.logout(rawRefreshToken);
    }

    // path must match COOKIE_OPTIONS.path exactly — mismatched path = browser won't clear it
    res.clearCookie(this.appConfigService.authOptions.refreshTokenCookie, {
      path: this.appConfigService.authOptions.cookieOptions.path,
    });

    return { success: true };
  }

  @Patch('change-password')
  @UseGuards(JwtGuard)
  public async changePassword(
    @GetUser('id') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.authService.changePassword(userId, changePasswordDto);
    return { success: true };
  }
}
