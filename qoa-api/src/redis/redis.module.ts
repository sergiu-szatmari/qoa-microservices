import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import * as Redis from 'ioredis';
import { config } from '../config';

export type RedisClient = Redis.Redis;

@Module({
  providers: [
    {
      useFactory: (): RedisClient => {
        return new Redis({
          host: config.redis.host,
          port: config.redis.port
        });
      },
      provide: 'REDIS_SUBSCRIBER'
    },
    RedisService
  ],
  exports: [ RedisService ]
})
export class RedisModule {}
