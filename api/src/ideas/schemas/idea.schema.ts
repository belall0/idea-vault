import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type IdeaDocument = HydratedDocument<Idea>;

@Schema({ timestamps: true })
export class Idea {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  summary: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: mongoose.Types.ObjectId;
}

export const IdeaSchema = SchemaFactory.createForClass(Idea);

IdeaSchema.index({ userId: 1 });
