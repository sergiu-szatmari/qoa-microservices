import { HttpModule, Module } from '@nestjs/common';
import { DataController } from './data.controller';
import { DataService } from './data.service';
import { RedisModule } from '../redis/redis.module';

@Module({
  controllers: [ DataController ],
  imports: [ HttpModule, RedisModule ],
  providers: [ DataService ]
})
export class DataModule {}
