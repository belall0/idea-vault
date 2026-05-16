import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AppConfigModule } from '../app-config/app-config.module';
import { AppConfigService } from '../app-config/app-config.service';
import { IdeasModule } from '../ideas/ideas.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (appConfigService: AppConfigService) => {
        return {
          uri: appConfigService.appOptions.dbUrl,
        };
      },
    }),
    AppConfigModule,
    IdeasModule,
  ],
})
export class AppModule {}
