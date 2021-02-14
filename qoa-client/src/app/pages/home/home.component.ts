import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../../services/data.service';
import { GoogleMap } from '@angular/google-maps';
import { CityData } from '../../models/city-data';
import { DatePipe } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  @ViewChild(GoogleMap, { static: false }) map;
  googleMapZoom = 16;
  googleMapCenter: google.maps.LatLngLiteral;
  googleMapOptions: google.maps.MapOptions = {
    mapTypeId: google.maps.MapTypeId.ROADMAP,
  };
  mapMarkerOptions = { animation: google.maps.Animation.DROP };

  unsubscribe$ = new Subject();

  countries: string[];
  selectedCountry: string;

  states: string[];
  selectedState: string;
  statesError: boolean = false;

  cities: string[];
  selectedCity: string;
  citiesError: boolean = false;

  cityData: CityData;

  displayedColumns = [ 'name', 'value' ];
  weatherData: { code: string, name: string; value: any }[] = [
    { code: 'ts', name: 'Last updated',           value: '-' },
    { code: 'tp', name: 'Temperature',            value: '-' },
    { code: 'pr', name: 'Atmospheric pressure',   value: '-' },
    { code: 'hu', name: 'Humidity',               value: '-' },
    { code: 'ws', name: 'Wind speed',             value: '-' },
    { code: 'wd', name: 'Wind direction',         value: '-' },
    { code: 'ic', name: 'Weather',                value: '-' },
  ];

  pollutionData: { code: string, name: string, value: any }[] = [
    { code: 'ts',     name: 'Last updated',                   value: '-' },
    { code: 'aqius',  name: 'Air Quality Index (US EPA)',     value: '-' },
    { code: 'mainus', name: 'Main pollutant (US AQI)',        value: '-' },
    { code: 'aqicn',  name: 'Air Quality Index (China MEP)',  value: '-' },
    { code: 'maincn', name: 'Main pollutant (China AQI)',     value: '-' },
  ];

  constructor(
    private dataService: DataService,
    private datePipe: DatePipe,
  ) { }

  ngOnInit(): void {
    this.loadData().then();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    if (this.selectedCountry && this.selectedState && this.selectedCity) {
      this.dataService.unsubscribeFromData(this.selectedCountry, this.selectedState, this.selectedCity).then();
    }
  }


  async loadData() {
    this.countries = await this.dataService.getCountries();
    // this.countries = [ 'a' ];
    // this.cityData = await this.dataService.getCityData('Romania', 'Brasov', 'Brasov');
    // this.cityData = {
    //   city: 'Brasov',
    //   state: 'Brasov',
    //   country: 'Romania',
    //   location: { type: 'Point', coordinates: [ 23.557522, 46.089795 ] },
    //   current: {
    //     weather: { ts: new Date(), tp: 10.0, pr: 1, hu: 20, ws: 5, wd: 122, ic: '02n' },
    //     pollution: { ts: new Date(), aqius: 55, mainus: 'asd', aqicn: 122, maincn: 'asd' }
    //   }
    // }
    // await Promise.all([
    //   this.initMap(),
    //   this.mapTableProperties()
    // ]);
  }

  async onCountrySelected(country: string) {
    this.selectedCountry = country;
    this.states = await this.dataService.getStates(this.selectedCountry);
    if (!this.states || this.states.length === 0) this.statesError = true;
  }

  async onStateSelected(state: string) {
    this.selectedState = state;
    this.cities = await this.dataService.getCities(this.selectedCountry, this.selectedState);
    if (!this.cities || this.cities.length === 0) this.citiesError = true;
  }

  async onCitySelected(city: string) {
    this.selectedCity = city;
    this.cityData = await this.dataService.getCityData(this.selectedCountry, this.selectedState, this.selectedCity);

    await this.dataService.connectSocket();
    const [ , , dataSubject ] = await Promise.all([
      this.initMap(),
      this.mapTableProperties(),
      this.dataService.subscribeToData(this.selectedCountry, this.selectedState, this.selectedCity)
    ]);

    dataSubject
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(async (newData) => {
        this.cityData = newData;
        await this.mapTableProperties();
      });
  }

  async initMap() {
    this.googleMapCenter = { lat: this.cityData?.location.coordinates[1], lng: this.cityData?.location.coordinates[0] };
  }

  async mapTableProperties() {
    const code = (e, c) => e.code === c;
    const { weather, pollution } = this.cityData.current;
    this.weatherData.find(e => code(e, 'ts')).value = this.datePipe.transform(weather.ts, 'medium');
    this.weatherData.find(e => code(e, 'tp')).value = `${ weather.tp.toFixed(1) }° C`;
    this.weatherData.find(e => code(e, 'pr')).value = `${ weather.pr } hPa`;
    this.weatherData.find(e => code(e, 'hu')).value = `${ weather.hu } %`;
    this.weatherData.find(e => code(e, 'ws')).value = `${ this.windSpeed() } km/h`;
    this.weatherData.find(e => code(e, 'ic')).value = this.icon(weather.ic);

    this.pollutionData.find(e => code(e, 'ts')).value = this.datePipe.transform(pollution.ts, 'medium');
    this.pollutionData.find(e => code(e, 'aqius')).value = pollution.aqius;
    this.pollutionData.find(e => code(e, 'mainus')).value = pollution.mainus;
    this.pollutionData.find(e => code(e, 'aqicn')).value = pollution.aqicn;
    this.pollutionData.find(e => code(e, 'maincn')).value = pollution.maincn;
  }

  async clear(field: 'country' | 'state' | 'city') {
    this.cityData = undefined;
    await this.dataService.unsubscribeFromData(this.selectedCountry, this.selectedState, this.selectedCity);
    await this.dataService.disconnectSocket();
    switch (field) {
      case 'country':
        this.selectedCountry = undefined;
      case 'state':
        this.selectedState = undefined;
        this.states = undefined;
        this.statesError = false;
      case 'city':
        this.selectedCity = undefined;
        this.cities = undefined;
        this.citiesError = false;
      default:
        if (this.selectedCountry) this.states = await this.dataService.getStates(this.selectedCountry);
        if (this.selectedCountry && this.selectedState) this.cities = await this.dataService.getCities(this.selectedCountry, this.selectedState);
    }
  }

  /* UI Utils */
  icon(iconName: string) {
    if ([ '01d', '01n', '02d', '02n', '03d', '03n', '04d', '09d', '10d', '10n' ].includes(iconName)) return iconName;
    return '03d';
  };

  windSpeed() {
    return Number(this.cityData.current.weather.ws * 3.6).toFixed(2).toString();
  }

  aqi(value: number): string {
    if (value < 50) return 'aqi-1';
    if (value < 100) return 'aqi-2';
    if (value < 150) return 'aqi-3';
    if (value < 200) return 'aqi-4';
    if (value < 300) return 'aqi-5';
    return 'aqi-6';
  }

  aqiExplained(value: number): string {
    const aqiName = this.aqiName(value).toUpperCase();
    const text = (() => {
      if (value < 50) return 'Air quality is satisfactory, and air pollution poses little or no risk.';
      if (value < 100) return 'Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.';
      if (value < 150) return 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.';
      if (value < 200) return 'Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.';
      if (value < 300) return 'Health alert: The risk of health effects is increased for everyone.';
      return 'Health warning of emergency conditions: everyone is more likely to be affected.';
    })();
    return `${ aqiName } - ${ text }`;
  }

  aqiName(value: number): string {
    if (value < 50) return 'Good';
    if (value < 100) return 'Moderate';
    if (value < 150) return 'Unhealthy for Sensitive Groups';
    if (value < 200) return 'Unhealthy';
    if (value < 300) return 'Very Unhealthy';
    return 'Hazardous';
  }

  weatherImg(picName: string): string {
    return `/assets/images/${ picName }.png`;
  }
  /* -- UI Utils -- */
}
