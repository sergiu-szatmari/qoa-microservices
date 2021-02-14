import { Module } from '@nestjs/common';
import { DataModule } from './data/data.module';
import { SharedModule } from './shared/shared.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [ DataModule, SharedModule, RedisModule ],
  controllers: [ ],
  providers: [ ],
})
export class AppModule {}
