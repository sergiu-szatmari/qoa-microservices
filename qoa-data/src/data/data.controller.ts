import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { DataService } from './data.service';

@Controller('data')
export class DataController {

  constructor(private dataService: DataService) { }

  @MessagePattern({ cmd: 'get-countries' })
  async getCountries() {
    return this.dataService.loadCountries();
  }

  @MessagePattern({ cmd: 'get-nearest' })
  async getNearestCity(coordinates: string) {
    const coords = coordinates === '' ? undefined : JSON.parse(coordinates);
    return this.dataService.loadNearestCityData(coords);
  }

  @MessagePattern({ cmd: 'get-states' })
  async getStates(country: string) {
    return this.dataService.loadStates(country);
  }

  @MessagePattern({ cmd: 'get-cities' })
  async getCities(data: string) {
    const { country, state } = JSON.parse(data);
    return this.dataService.loadCities(country, state);
  }

  @MessagePattern({ cmd: 'get-city-data' })
  async getCityData(data: string) {
    const { country, state, city } = JSON.parse(data);
    return this.dataService.loadSpecificCityData(country, state, city);
  }
}
