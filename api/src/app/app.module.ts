import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IdeasModule } from 'src/ideas/ideas.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/ideavault'),
    IdeasModule,
  ],
})
export class AppModule {}
