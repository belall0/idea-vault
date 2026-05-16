import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RefreshTokenDocument = HydratedDocument<RefreshToken>;

/**
 * Each row is one issued refresh token — not one user session.
 * A session is a family of tokens linked by sessionId.
 * When tokens rotate, old rows are marked revoked but kept (for audit and reuse detection).
 * You never delete rows.
 */
@Schema({ timestamps: true })
export class RefreshToken {
  // The SHA-256 hash of the raw token — never store plaintext
  @Prop({ required: true, index: true })
  tokenHash: string;

  // Which user this token belongs to
  @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
  userId: Types.ObjectId;

  // Groups all rotated tokens from one login together.
  // This is what we revoke entirely when we detect reuse.
  @Prop({ required: true, index: true })
  sessionId: string;

  // When this token stops being valid (enforced by our code, not MongoDB)
  @Prop({ required: true })
  expiresAt: Date;

  // Set when this token is rotated or revoked. Null = still active.
  @Prop({ default: null })
  revokedAt: Date | null;

  // After rotation, points to the hash of the token that replaced this one.
  // Purely for audit trail — lets you reconstruct the rotation chain.
  @Prop({ default: null })
  replacedByTokenHash: string | null;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
