import { Controller, Get, Inject, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../shared/guards/auth.guard';
import { ClientProxy } from '@nestjs/microservices';

@Controller()
@UseGuards(AuthGuard)
export class DataController {

  constructor(@Inject('DATA_SERVICE') private dataClient: ClientProxy) { }

  @Get('countries')
  public async getCountries(): Promise<string[]> {
    return this.dataClient.send({ cmd: 'get-countries' }, '').toPromise();
  }

  @Get('nearest')
  public async getNearestCity(
    @Query('lat') lat?: number,
    @Query('long') long?: number
  ): Promise<any> {
    const coordinates = (!!lat && !!long) ? JSON.stringify({ lat, long }) : '';
    return this.dataClient.send({ cmd: 'get-nearest' }, coordinates).toPromise();
  }

  @Get(':country')
  public async getStates(@Param('country') country: string): Promise<string[]> {
    return this.dataClient.send({ cmd: 'get-states' }, country).toPromise();
  }

  @Get(':country/:state')
  public async getCities(
    @Param('country') country: string,
    @Param('state') state: string
  ): Promise<string[]> {
    return this.dataClient.send({ cmd: 'get-cities' }, JSON.stringify({ country, state })).toPromise();
  }

  @Get(':country/:state/:city')
  public async getCityData(
    @Param('country') country: string,
    @Param('state') state: string,
    @Param('city') city: string
  ): Promise<any> {
    return this.dataClient.send({ cmd: 'get-city-data' }, JSON.stringify({ country, state, city })).toPromise();
  }
}
