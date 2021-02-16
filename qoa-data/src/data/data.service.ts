import { HttpService, Injectable } from '@nestjs/common';
import { config } from '../config';
import { catchError, map } from 'rxjs/operators';
import {
  CitiesResponse,
  CityResponse,
  CountriesResponse,
  DataResponseStatus,
  StatesResponse
} from '../shared/models/responses';
import { Subject } from 'rxjs';
import { RedisEvent } from '../shared/models/redis-event';
import { RedisService } from '../redis/redis.service';
import { CityData } from '../shared/models/city';

const { apiKey } = config.IQAirVisual;
const key = { key: apiKey };

@Injectable()
export class DataService {

  dataSubscriptions: { [key: string]: number } = { };
  eventSubject = new Subject<RedisEvent>();

  private readonly baseUrl: string;

  constructor(private http: HttpService, private redisService: RedisService) {
    this.baseUrl = config.IQAirVisual.baseUrl;

    this.eventSubject
      .asObservable()
      .subscribe(async ({ id, newData }) => {
        return this.redisService.publish(id, newData);
      });
  }

  async loadCountries(): Promise<string[]> {
    const params = { ...key };
    return this.http
      .get(`${ this.baseUrl }/countries`, { params })
      .pipe(
        map(({ data }: { data: CountriesResponse }) => {
          return (data.status === DataResponseStatus.SUCCESS) ? data.data.map((entry) => entry.country) : [ ];
        }),
      )
      .toPromise();
  }

  async loadStates(country: string): Promise<string[]> {
    const params = { ...key, country };
    return this.http
      .get(`${ this.baseUrl }/states`, { params })
      .pipe(
        map(({ data }: { data: StatesResponse }) => {
          return (data.status === DataResponseStatus.SUCCESS) ? data.data.map((entry) => entry.state) : [ ];
        }),
      )
      .toPromise();
  }

  async loadCities(country: string, state: string): Promise<string[]> {
    const params = { ...key, country, state };
    return this.http
      .get(`${ this.baseUrl }/cities`, { params })
      .pipe(
        map(({ data }: { data: CitiesResponse }) => {
          return (data.status === DataResponseStatus.SUCCESS) ? data.data.map((entry) => entry.city) : [ ]
        }),
        catchError((err) => {
          console.error(err);
          return [ ];
        })
      )
      .toPromise();
  }

  /**
   * Based on IP geolocation / given coordinates (as param)
   */
  async loadNearestCityData(coordinates?: { lat: number, long: number }): Promise<any> {
    const params = { ...key, ...coordinates };
    return this.http
      .get(`${ this.baseUrl }/nearest_city`, { params })
      .pipe(
        map(({ data }: { data: CityResponse }) => {
          return (data.status === DataResponseStatus.SUCCESS) ? data.data : { }
        }),
        catchError((err) => {
          console.error(err);
          return [ ];
        })
      )
      .toPromise();
  }

  async loadSpecificCityData(country: string, state: string, city: string): Promise<any> {
    const params = { ...key, country, state, city };
    const cityData = await this.http
      .get(`${ this.baseUrl }/city`, { params })
      .pipe(
        map(({ data }: { data: CityResponse, status: number, statusText: string }) => {
          return (data.status === DataResponseStatus.SUCCESS) ? data.data : { }
        }),
      )
      .toPromise();

    const id = `${ country }-${ state }-${ city }`;
    if (!this.dataSubscriptions[ id ] || this.dataSubscriptions[ id ] === 0) {
      const interval = setInterval(() => {
        if (this.dataSubscriptions[ id ] === 0) {
          clearInterval(interval);
          return;
        }

        const newData = (() => {
          const newData: CityData = JSON.parse(JSON.stringify(cityData));
          newData.current.weather.wd += Utils.randomNumber(-10, 10, true);
          newData.current.weather.ws += Utils.randomNumber(-0.5, 1, true);
          newData.current.weather.tp += Utils.randomNumber(-1, 1);
          newData.current.weather.hu += Utils.randomNumber(-0.5, 2, true);
          newData.current.weather.ts = new Date();
          return newData;
        })();
        this.eventSubject.next({ id, newData });
        console.log(`Emitted updated value for ${ id }`);
      }, 3000);
    }

    return cityData;
  }

  public subscribeData(id: string) {
    if (!this.dataSubscriptions[ id ]) this.dataSubscriptions[ id ] = 1;
    else this.dataSubscriptions[ id ]++;

    if (this.dataSubscriptions[ id ] === 1) {
      // this.ws.send(JSON.stringify({ type: 'subscribe', id }));
      console.log(`Subscribe sent for ${ id }`);
    }
  }

  public unsubscribeData(id: string) {
    if (this.dataSubscriptions[ id ] == null) return;
    if (this.dataSubscriptions[ id ] > 0) {
      this.dataSubscriptions[ id ]--;
      if (this.dataSubscriptions[ id ] === 0) {
        console.log(`Unsubscribe sent for ${ id }`);
        // this.ws.send(JSON.stringify({ type: 'unsubscribe', id }));
      }
    }
  }
}

class Utils {
  public static randomNumber(min: number, max: number, round: boolean = false) {
    const random = Math.random() * (max - min) + min;
    return round ? Math.floor(random) : random;
  }
}
