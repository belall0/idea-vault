import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
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
    UsersModule,
    AuthModule,
    AppConfigModule,
    IdeasModule,
  ],
})
export class AppModule {}
