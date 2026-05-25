import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import * as argon from 'argon2';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto, EditUserDto, UserRole } from './types';
import { DefaultAdmin } from './types/constants/default-admin.constant';

@Injectable()
export class UsersService implements OnApplicationBootstrap {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  public async onApplicationBootstrap(): Promise<void> {
    await this.createDefaultAdmin();
  }

  public async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    try {
      const createdUser = new this.userModel(createUserDto);
      return await createdUser.save();
    } catch (error) {
      const duplicateKeyErrorCode = 11000;

      if ((error as { code?: number }).code === duplicateKeyErrorCode) {
        throw new ConflictException('Email already registered');
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
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (editUserDto.email && editUserDto.email !== user.email) {
      if (!editUserDto.currentPassword) {
        throw new BadRequestException(
          'Password confirmation required to change email',
        );
      }

      const pwMatches = await argon.verify(
        user.hash,
        editUserDto.currentPassword,
      );
      if (!pwMatches) {
        throw new UnauthorizedException('Incorrect password');
      }

      const existingUser = await this.findByEmail(editUserDto.email);
      if (existingUser && existingUser._id.toString() !== id) {
        throw new ConflictException('email already exists');
      }
    }

    const { currentPassword: _, ...updateData } = editUserDto;

    return this.userModel
      .findOneAndUpdate({ _id: id }, updateData, {
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

  private async createDefaultAdmin(): Promise<void> {
    const { name, email, password } = DefaultAdmin;

    try {
      const existingAdmin = await this.findByEmail(email);

      if (!existingAdmin) {
        const hash = await argon.hash(password);
        const adminUser = new this.userModel({
          name,
          email,
          hash,
          role: UserRole.ADMIN,
        });
        await adminUser.save();
      }
    } catch (error) {
      console.error('[Startup] Failed to create default admin account:', error);
    }
  }
}
