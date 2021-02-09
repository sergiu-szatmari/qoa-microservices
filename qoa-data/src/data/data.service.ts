import { HttpService, Injectable } from '@nestjs/common';
import { config } from '../config';
import { map } from 'rxjs/operators';
import {
  CitiesResponse,
  CityResponse,
  CountriesResponse,
  DataResponseStatus,
  StatesResponse
} from '../shared/models/responses';

const { apiKey } = config.IQAirVisual;
const key = { key: apiKey };

@Injectable()
export class DataService {

  private readonly baseUrl: string;

  constructor(private http: HttpService) {
    this.baseUrl = config.IQAirVisual.baseUrl;
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
        })
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
        })
      )
      .toPromise();
  }

  async loadSpecificCityData(country: string, state: string, city: string): Promise<any> {
    const params = { ...key, country, state, city };
    return this.http
      .get(`${ this.baseUrl }/city`, { params })
      .pipe(
        map(({ data }: { data: CityResponse }) => {
          return (data.status === DataResponseStatus.SUCCESS) ? data.data : { }
        })
      )
      .toPromise();
  }
}
