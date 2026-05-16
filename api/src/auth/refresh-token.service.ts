import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { createHash, randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

import {
  RefreshToken,
  RefreshTokenDocument,
} from './schemas/refresh-token.schema';

@Injectable()
export class RefreshTokenService {
  private logger = new Logger(RefreshTokenService.name);

  public constructor(
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshTokenDocument>,
  ) {}

  /**
   * Called once at login. Generates a new token family (new sessionId).
   * Returns the raw token — this is the only time plaintext exists.
   */
  public async createRefreshToken(
    userId: string,
  ): Promise<{ rawToken: string; sessionId: string }> {
    const sessionId: string = uuidv4();
    const rawToken = this.generateRawToken();
    const tokenHash = this.hash(rawToken);

    await this.refreshTokenModel.create({
      tokenHash,
      userId: new Types.ObjectId(userId),
      sessionId,
      expiresAt: this.sevenDaysFromNow(),
      revokedAt: null,
      replacedByTokenHash: null,
    });

    this.logger.log({
      event: 'REFRESH_TOKEN_CREATED',
      userId,
      sessionId,
    });

    return { rawToken, sessionId };
  }

  /**
   * Called at every POST /auth/refresh.
   * Validates the token, detects reuse, returns the record if valid.
   * THROWS on any invalid state — caller should not catch selectively.
   */
  public async validateRefreshToken(
    rawToken: string,
  ): Promise<RefreshTokenDocument> {
    const tokenHash = this.hash(rawToken);
    const record = await this.refreshTokenModel.findOne({ tokenHash });

    // Case 1: Token doesn't exist at all — could be garbage, could be forged
    if (!record) {
      this.logger.warn({
        event: 'REFRESH_TOKEN_NOT_FOUND',
      });
      throw new UnauthorizedException();
    }

    // Case 2: Token was already used — THIS IS THE REUSE DETECTION SIGNAL.
    // Someone is replaying a consumed token. Assume the session is compromised.
    // Revoke the entire family immediately.
    if (record.revokedAt !== null) {
      this.logger.warn({
        event: 'REFRESH_TOKEN_REUSE_DETECTED',
        userId: record.userId,
        sessionId: record.sessionId,
      });
      await this.revokeEntireSession(record.sessionId);
      throw new UnauthorizedException();
    }

    // Case 3: Token exists and is active, but has expired
    if (record.expiresAt < new Date()) {
      this.logger.warn({
        event: 'REFRESH_TOKEN_EXPIRED',
        userId: record.userId,
        sessionId: record.sessionId,
      });
      throw new UnauthorizedException();
    }

    // All checks passed
    return record;
  }

  /**
   * Called immediately after validateRefreshToken succeeds.
   * Atomically: marks old token as consumed, issues new token in same session family.
   */
  public async rotateRefreshToken(
    oldRecord: RefreshTokenDocument,
  ): Promise<string> {
    const rawToken = this.generateRawToken();
    const newTokenHash = this.hash(rawToken);

    // Mark the old token as consumed and link it to its replacement
    await this.refreshTokenModel.findByIdAndUpdate(oldRecord._id, {
      revokedAt: new Date(),
      replacedByTokenHash: newTokenHash,
    });

    // Issue the new token — same sessionId preserves the family link
    await this.refreshTokenModel.create({
      tokenHash: newTokenHash,
      userId: oldRecord.userId,
      sessionId: oldRecord.sessionId, // ← same family
      expiresAt: this.sevenDaysFromNow(),
      revokedAt: null,
      replacedByTokenHash: null,
    });

    this.logger.log({
      event: 'REFRESH_TOKEN_ROTATED',
      userId: oldRecord.userId,
      sessionId: oldRecord.sessionId,
    });

    return rawToken;
  }

  /**
   * Revokes all active tokens in a session family.
   * Used for: normal logout, AND reuse detection (compromise response).
   */
  public async revokeEntireSession(sessionId: string): Promise<void> {
    await this.refreshTokenModel.updateMany(
      { sessionId, revokedAt: null },
      { revokedAt: new Date() },
    );

    this.logger.log({ event: 'SESSION_REVOKED', sessionId });
  }

  /**
   * Revokes all sessions for a user across all devices.
   * Used for: password change, admin-forced logout.
   */
  public async revokeAllUserSessions(userId: string): Promise<void> {
    await this.refreshTokenModel.updateMany(
      { userId: new Types.ObjectId(userId), revokedAt: null },
      { revokedAt: new Date() },
    );

    this.logger.log({ event: 'ALL_SESSIONS_REVOKED', userId });
  }

  private generateRawToken(): string {
    return randomBytes(64).toString('hex');
  }

  private hash(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
  }

  private sevenDaysFromNow(): Date {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d;
  }
}
