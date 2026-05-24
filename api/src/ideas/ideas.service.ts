import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Idea, IdeaDocument } from './schemas/idea.schema';
import { CreateIdeaDto } from './types/dtos/create-idea.dto';
import { UpdateIdeaDto } from './types/dtos/update-idea.dto';

@Injectable()
export class IdeasService {
  constructor(@InjectModel(Idea.name) private ideaModel: Model<IdeaDocument>) {}

  async create(createIdeaDto: CreateIdeaDto): Promise<IdeaDocument> {
    const idea = new this.ideaModel(createIdeaDto);
    return idea.save();
  }

  async findAll(): Promise<IdeaDocument[]> {
    return this.ideaModel.find().exec();
  }

  async findOne(id: string): Promise<IdeaDocument> {
    const idea = await this.ideaModel.findById(id).exec();
    if (!idea) {
      throw new NotFoundException(`Idea #${id} not found`);
    }
    return idea;
  }

  async update(
    id: string,
    updateIdeaDto: UpdateIdeaDto,
  ): Promise<IdeaDocument> {
    const updated = await this.ideaModel
      .findByIdAndUpdate(id, updateIdeaDto, { returnDocument: 'after' })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Idea #${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.ideaModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Idea #${id} not found`);
    }
    return { deleted: true };
  }
}
