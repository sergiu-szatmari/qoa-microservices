import { Module } from '@nestjs/common';
import { SharedModule } from './shared/shared.module';
import { DataModule } from './data/data.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [ SharedModule, DataModule, RedisModule ],
  controllers: [ ],
  providers: [ ],
})
export class AppModule { }
