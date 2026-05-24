import { Injectable, UnauthorizedException } from '@nestjs/common';
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
  public constructor(
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshTokenDocument>,
  ) {}

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

    return { rawToken, sessionId };
  }

  public async validateRefreshToken(
    rawToken: string,
  ): Promise<RefreshTokenDocument> {
    const tokenHash = this.hash(rawToken);
    const record = await this.refreshTokenModel.findOne({ tokenHash });

    if (!record) {
      throw new UnauthorizedException();
    }

    if (record.revokedAt !== null) {
      // Reuse detection
      await this.revokeEntireSession(record.sessionId);
      throw new UnauthorizedException();
    }

    if (record.expiresAt < new Date()) {
      throw new UnauthorizedException();
    }

    return record;
  }

  public async rotateRefreshToken(
    oldRecord: RefreshTokenDocument,
  ): Promise<string> {
    const rawToken = this.generateRawToken();
    const newTokenHash = this.hash(rawToken);

    const updatedOldRecord = await this.refreshTokenModel.findOneAndUpdate(
      { _id: oldRecord._id, revokedAt: null },
      {
        revokedAt: new Date(),
        replacedByTokenHash: newTokenHash,
      },
      { returnDocument: 'after' },
    );

    if (!updatedOldRecord) {
      await this.revokeEntireSession(oldRecord.sessionId); // Concurrent reuse detection
      throw new UnauthorizedException();
    }

    await this.refreshTokenModel.create({
      tokenHash: newTokenHash,
      userId: oldRecord.userId,
      sessionId: oldRecord.sessionId,
      expiresAt: this.sevenDaysFromNow(),
      revokedAt: null,
      replacedByTokenHash: null,
    });

    return rawToken;
  }

  public async revokeEntireSession(sessionId: string): Promise<void> {
    await this.refreshTokenModel.updateMany(
      { sessionId, revokedAt: null },
      { revokedAt: new Date() },
    );
  }

  public async revokeAllUserSessions(userId: string): Promise<void> {
    await this.refreshTokenModel.updateMany(
      { userId: new Types.ObjectId(userId), revokedAt: null },
      { revokedAt: new Date() },
    );
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
