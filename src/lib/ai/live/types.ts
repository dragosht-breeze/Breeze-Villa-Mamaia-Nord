export type LiveWeatherSnapshot = {
  location: string;
  timezone: string;
  fetchedAt: string;
  current: {
    temperatureC: number;
    feelsLikeC: number;
    weatherCode: number;
    condition: string;
    windKmh: number;
    windGustKmh: number;
    isDay: boolean;
    precipitationProbability: number | null;
    uvIndex: number | null;
  };
  today: {
    date: string;
    minTemperatureC: number;
    maxTemperatureC: number;
    precipitationProbabilityMax: number;
    uvIndexMax: number;
    windSpeedMaxKmh: number;
    sunrise: string;
    sunset: string;
    condition: string;
  };
  tomorrow: {
    date: string;
    minTemperatureC: number;
    maxTemperatureC: number;
    precipitationProbabilityMax: number;
    uvIndexMax: number;
    windSpeedMaxKmh: number;
    sunrise: string;
    sunset: string;
    condition: string;
  } | null;
};

export type LiveWeatherResult =
  | { ok: true; data: LiveWeatherSnapshot }
  | { ok: false; reason: string };
