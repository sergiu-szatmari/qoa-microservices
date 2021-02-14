import { Inject, Injectable } from '@nestjs/common';
import { RedisClient } from './redis.module';
import { Observable, Observer } from 'rxjs';
import { filter, map } from 'rxjs/operators';

interface Tmp {
  channel: string;
  message: string;
}

@Injectable()
export class RedisService {

  constructor(@Inject('REDIS_SUBSCRIBER') private subscriberClient: RedisClient) { }

  public fromEvent<T>(eventName: string): Observable<T> {
    this.subscriberClient.subscribe(eventName).then();

    const observable = new Observable(
      (observer: Observer<Tmp>) => {
        return this.subscriberClient.on(
          'message',
          (channel, message) => observer.next({ channel, message })
        );
      }
    );

    return observable.pipe(
      filter((value: Tmp) => value.channel === eventName),
      map((value: Tmp) => JSON.parse(value.message))
    );
  }
}
