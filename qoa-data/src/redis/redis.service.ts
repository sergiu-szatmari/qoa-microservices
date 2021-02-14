import { Inject, Injectable } from '@nestjs/common';
import { RedisClient } from './redis.module';
import { CityData } from '../shared/models/city';

@Injectable()
export class RedisService {

  constructor(@Inject('REDIS_PUBLISHER') private publisherClient: RedisClient) { }

  public async publish(id: string, newData: CityData): Promise<number> {
    return new Promise<number>((onResolve, onReject) => {
      return this.publisherClient.publish(
        'data',
        JSON.stringify({ id, newData }),
        (error, reply) => {
          if (error) return onReject(error);
          return onResolve(reply);
        })
    })
  }
}
