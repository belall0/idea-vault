import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import * as argon from 'argon2';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AppConfigService } from '../app-config/app-config.service';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './types';

@Injectable()
export class UsersService implements OnApplicationBootstrap {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private appConfigService: AppConfigService,
  ) {}

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
        // TODO: Handle duplicate key errors for all unique fields and return the appropriate conflict message.
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

  private async createDefaultAdmin(): Promise<void> {
    const isProduction =
      this.appConfigService.appOptions.nodeEnv === 'production';
    const shouldCreate = this.appConfigService.appOptions.createDefaultAdmin;

    if (isProduction || !shouldCreate) {
      return;
    }

    const defaultAdmin = {
      name: 'Belal Muhammad',
      email: 'belal@gmail.com',
      password: 'Idea@2026',
    };

    try {
      const existingAdmin = await this.findByEmail(defaultAdmin.email);
      if (existingAdmin) {
        return;
      }

      const hash = await argon.hash(defaultAdmin.password);
      const adminUser = new this.userModel({
        name: defaultAdmin.name,
        email: defaultAdmin.email,
        hash,
      });
      await adminUser.save();
    } catch (error) {
      console.error('[Startup] Failed to create default admin account:', error);
    }
  }
}
