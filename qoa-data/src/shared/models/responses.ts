import { CityData } from './city';

export enum DataResponseStatus {
  SUCCESS = 'success',
  CALL_LIMIT_REACHED = 'call_limit_reached',
  API_KEY_EXPIRED = 'api_key_expired',
  INCORRECT_API_KEY = 'incorrect_api_key',
  IP_LOCATION_FAILED = 'ip_location_failed',
  NO_NEAREST_LOCATION = 'no_nearest_station',
  FEATURE_NOT_AVAILABLE = 'feature_not_available',
  TOO_MANY_REQUESTS = 'too_many_requests'
}

export interface DataResponse<T> {
  status: DataResponseStatus
  data: T;
}

export interface CountriesResponse extends DataResponse<{ country: string }[]>{ }

export interface StatesResponse extends DataResponse<{ state: string }[]>{ }

export interface CitiesResponse extends DataResponse<{ city: string }[]>{ }

export interface CityResponse extends DataResponse<CityData>{ }
