export interface CityData {
  city: string;
  state: string;
  country: string;
  location: {
    type: 'Point' | string;
    coordinates: [ number, number ];
  },
  current: {
    weather: {
      ts: Date,         // Timestamp
      tp: number,       // Temperature (celsius degrees)
      pr: number,       // Atmospheric pressure in hPa
      hu: number,       // Humidity (%)
      ws: number,       // Wind speed (m/s)
      wd: number,       // Wind direction, angle of 360degrees (N = 0, E = 90, S = 180, W = 270)
      ic: string        // Weather icon code
    },
    pollution: {
      ts: Date,         // Timestamp
      aqius: number,    // Air Quality Index (based on US EPA Standard)
      mainus: string,   // Main pollutant for US AQI
      aqicn: number,    // Air Quality Index (based on China MEP Standard)
      maincn: string    // Main pollutant fot Chinese AQI
    }
  }
}
