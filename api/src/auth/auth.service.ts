import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import * as argon from 'argon2';

import { UsersService } from '../users/users.service';
import { AppConfigService } from '../app-config/app-config.service';
import { RefreshTokenService } from './refresh-token.service';
import { RegisterDto, LoginDto } from './types';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private appConfigService: AppConfigService,
    private refreshTokenService: RefreshTokenService,
  ) {}

  public async register(registerDto: RegisterDto) {
    const { name, email, password } = registerDto;
    const hash = await argon.hash(password);

    const user = await this.usersService.create({ name, email, hash });

    return {
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  public async login(
    loginDto: LoginDto,
  ): Promise<{ accessToken: string; rawRefreshToken: string }> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const pwMatches = await argon.verify(user.hash, loginDto.password);
    if (!pwMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userId = user._id.toString();
    const accessToken = await this.signToken(userId);

    const { rawToken: rawRefreshToken } =
      await this.refreshTokenService.createRefreshToken(userId);

    return { accessToken, rawRefreshToken };
  }

  public async refresh(
    rawRefreshToken: string,
  ): Promise<{ accessToken: string; rawRefreshToken: string }> {
    const record =
      await this.refreshTokenService.validateRefreshToken(rawRefreshToken);

    const newRawRefreshToken =
      await this.refreshTokenService.rotateRefreshToken(record);

    const accessToken = await this.signToken(record.userId.toString());

    return { accessToken, rawRefreshToken: newRawRefreshToken };
  }

  public async logout(rawRefreshToken: string): Promise<void> {
    try {
      const record =
        await this.refreshTokenService.validateRefreshToken(rawRefreshToken);
      await this.refreshTokenService.revokeEntireSession(record.sessionId);
    } catch {
      // Ignore if token already invalid/expired
    }
  }

  private signToken(userId: string): Promise<string> {
    const payload = { sub: userId };
    const options: JwtSignOptions = {
      secret: this.appConfigService.authOptions.jwtSecret,
      expiresIn: this.appConfigService.authOptions.expiresIn,
    };
    return this.jwtService.signAsync(payload, options);
  }
}
