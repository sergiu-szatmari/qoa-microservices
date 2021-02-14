import { CityData } from './city';

export interface RedisEvent {
  id: string;
  newData: CityData;
}
