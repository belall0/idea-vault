import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserRole } from '../types';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ required: true })
  hash: string;

  @Prop({
    type: String,
    enum: UserRole,
    default: UserRole.MEMBER,
    required: true,
  })
  role: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.set('toJSON', {
  transform: (_doc, ret: Record<string, any>) => {
    delete ret.hash;
    delete ret.__v;
    return ret;
  },
});
