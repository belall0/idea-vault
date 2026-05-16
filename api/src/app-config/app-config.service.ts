import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  private getOptions<T>(key: string): T {
    return this.configService.getOrThrow<T>(key);
  }
}
