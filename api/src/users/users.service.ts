import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto, EditUserDto } from './types';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  public async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    try {
      const createdUser = new this.userModel(createUserDto);
      return await createdUser.save();
    } catch (error) {
      const duplicateKeyErrorCode = 11000;

      if ((error as { code?: number }).code === duplicateKeyErrorCode) {
        const duplicatedField = Object.keys(
          (error as { keyPattern: Record<string, unknown> }).keyPattern,
        )[0];

        throw new ConflictException(`${duplicatedField} already exists`);
      }

      throw new InternalServerErrorException();
    }
  }

  public async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  public async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ _id: id }).exec();
  }

  public async update(
    id: string,
    editUserDto: EditUserDto,
  ): Promise<UserDocument | null> {
    if (editUserDto.email) {
      const existingUser = await this.findByEmail(editUserDto.email);
      if (existingUser && existingUser._id.toString() !== id) {
        throw new ConflictException('email already exists');
      }
    }

    return this.userModel
      .findOneAndUpdate({ _id: id }, editUserDto, {
        returnDocument: 'after',
      })
      .exec();
  }

  public async delete(id: string): Promise<void> {
    await this.userModel.findOneAndDelete({ _id: id }).exec();
  }

  public async updateHash(id: string, hash: string): Promise<void> {
    await this.userModel.findOneAndUpdate({ _id: id }, { hash }).exec();
  }
}
