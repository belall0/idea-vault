import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AppOptions } from '../app/types';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  public get appOptions(): AppOptions {
    return this.getOptions<AppOptions>('appOptions');
  }

  private getOptions<T>(key: string): T {
    return this.configService.getOrThrow<T>(key);
  }
}
