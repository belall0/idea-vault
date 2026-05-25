import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Idea, IdeaDocument } from './schemas/idea.schema';
import { CreateIdeaDto } from './types/dtos/create-idea.dto';
import { UpdateIdeaDto } from './types/dtos/update-idea.dto';

@Injectable()
export class IdeasService {
  constructor(@InjectModel(Idea.name) private ideaModel: Model<IdeaDocument>) {}

  async create(
    userId: string,
    createIdeaDto: CreateIdeaDto,
  ): Promise<IdeaDocument> {
    const idea = new this.ideaModel({ ...createIdeaDto, userId });
    return idea.save();
  }

  async findAll(userId?: string): Promise<IdeaDocument[]> {
    const filter: mongoose.QueryFilter<Idea> = userId ? { userId } : {};
    return this.ideaModel.find(filter).exec();
  }

  async findOne(id: string): Promise<IdeaDocument> {
    const idea = await this.ideaModel.findById(id).exec();
    if (!idea) {
      throw new NotFoundException(`Idea #${id} not found`);
    }
    return idea;
  }

  async update(
    userId: string,
    id: string,
    updateIdeaDto: UpdateIdeaDto,
  ): Promise<IdeaDocument> {
    const filter: mongoose.QueryFilter<Idea> = { _id: id, userId };
    const updated = await this.ideaModel
      .findOneAndUpdate(filter, updateIdeaDto, { returnDocument: 'after' })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Idea #${id} not found`);
    }
    return updated;
  }

  async remove(userId: string, id: string): Promise<{ deleted: boolean }> {
    const filter: mongoose.QueryFilter<Idea> = { _id: id, userId };
    const result = await this.ideaModel.findOneAndDelete(filter).exec();
    if (!result) {
      throw new NotFoundException(`Idea #${id} not found`);
    }
    return { deleted: true };
  }
}
