import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import * as argon from 'argon2';

import { UsersService } from '../users/users.service';
import { AppConfigService } from '../app-config/app-config.service';
import { RefreshTokenService } from './refresh-token.service';
import { RegisterDto, LoginDto, ChangePasswordDto } from './types';

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
    const accessToken = await this.signToken(userId, user.email);

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

    const accessToken = await this.signToken(
      record.userId.toString(),
      (await this.usersService.findById(record.userId.toString()))!.email,
    );

    return { accessToken, rawRefreshToken: newRawRefreshToken };
  }

  public async logout(rawRefreshToken: string): Promise<void> {
    try {
      const record =
        await this.refreshTokenService.validateRefreshToken(rawRefreshToken);
      await this.refreshTokenService.revokeEntireSession(record.sessionId);
    } catch {
      // Token already expired, revoked, or not found — logout is still successful
    }
  }

  public async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const pwMatches = await argon.verify(user.hash, dto.oldPassword);
    if (!pwMatches) {
      throw new UnauthorizedException('Incorrect old password');
    }

    const hash = await argon.hash(dto.newPassword);
    await this.usersService.updateHash(userId, hash);

    // Critical: a password change must kill all existing sessions.
    // Any device still holding a refresh token from before this moment
    // should be forced to re-authenticate.
    await this.refreshTokenService.revokeAllUserSessions(userId);
  }

  private signToken(userId: string, email: string): Promise<string> {
    const payload = { sub: userId, email };
    const options: JwtSignOptions = {
      secret: this.appConfigService.authOptions.jwtSecret,
      expiresIn: this.appConfigService.authOptions.expiresIn,
    };
    return this.jwtService.signAsync(payload, options);
  }
}
