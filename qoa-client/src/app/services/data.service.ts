import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@auth0/auth0-angular';
import { CityData } from '../models/city-data';
import { Subject } from 'rxjs';
import * as io from 'socket.io-client';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  subjects: { [data: string]: Subject<CityData> } = { };
  socket: SocketIOClient.Socket;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  async connectSocket() {
    const token = await this.authService.getAccessTokenSilently().toPromise();

    this.socket = io(environment.socketEndpoint, {
      transports: [ 'websocket' ],
      query: { token }
    });

    this.socket.on('connect', () => { console.log('[ Socket ] Connected to server'); });
    this.socket.on('error', (err => { console.error(err); }));
    this.socket.on('message', ({ id, data }: { id: string, data: CityData }) => {
      if (this.subjects[ id ]) this.subjects[ id ].next(data);
    });
  }

  async disconnectSocket() {
    this.socket?.disconnect();
    delete this.socket;
  }

  async subscribeToData(country: string, state: string, city: string) {
    const id = `${ country }-${ state }-${ city }`;

    if (this.subjects[ id ]) return this.subjects[ id ].asObservable();

    const dataSubject = new Subject<CityData>();
    this.subjects[ id ] = dataSubject;

    // Subscribe to API for data
    this.socket?.emit('subscribe', { country, state, city });

    return dataSubject.asObservable();
  }

  async unsubscribeFromData(country: string, state: string, city: string) {
    const id = `${ country }-${ state }-${ city }`;
    this.subjects[ id ]?.complete();
    delete this.subjects[ id ];

    // Unsubscribe from API for data
    this.socket?.emit('unsubscribe', { country, state, city });
  }

  async getCountries(): Promise<string[]> {
    return this.http
      .get<string[]>(`countries`)
      .toPromise();
  }

  async getStates(country: string): Promise<string[]> {
    try {
      return this.http
        .get<string[]>(`${ country }`)
        .toPromise();
    } catch (err) {
      return [];
    }
  }

  async getCities(country: string, state: string): Promise<string[]> {
    try {
      return this.http
        .get<string[]>(`${ country }/${ state }`)
        .toPromise();
    } catch (err) {
      return [];
    }
  }

  async getCityData(country: string, state: string, city: string): Promise<CityData> {
    return this.http
      .get<CityData>(`${ country }/${ state }/${ city }`)
      .toPromise();
  }

  async getNearest(): Promise<CityData> {
    return this.http
      .get<CityData>(`nearest`)
      .toPromise();
  }
}
