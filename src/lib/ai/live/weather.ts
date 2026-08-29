import { breezeConciergeKnowledge } from "@/lib/ai/breeze-knowledge-base";
import type {
  LiveWeatherResult,
  LiveWeatherSnapshot,
} from "@/lib/ai/live/types";

const CACHE_TTL_MS = 15 * 60 * 1_000;
const REQUEST_TIMEOUT_MS = 6_000;
const WEATHER_LOCATION = "Breeze Villa, Mamaia Nord";
const WEATHER_TIMEZONE = "Europe/Bucharest";

type CacheEntry = {
  expiresAt: number;
  value: LiveWeatherResult;
};

let weatherCache: CacheEntry | null = null;

type OpenMeteoResponse = {
  timezone?: string;
  current?: {
    time?: string;
    temperature_2m?: number;
    apparent_temperature?: number;
    weather_code?: number;
    wind_speed_10m?: number;
    wind_gusts_10m?: number;
    is_day?: number;
  };
  hourly?: {
    time?: string[];
    precipitation_probability?: number[];
    uv_index?: number[];
  };
  daily?: {
    time?: string[];
    weather_code?: number[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_probability_max?: number[];
    uv_index_max?: number[];
    wind_speed_10m_max?: number[];
    sunrise?: string[];
    sunset?: string[];
  };
  error?: boolean;
  reason?: string;
};

function finiteNumber(
  value: unknown,
  fallback = 0
) {
  return typeof value === "number" &&
    Number.isFinite(value)
    ? value
    : fallback;
}

function roundOne(value: unknown) {
  return (
    Math.round(
      finiteNumber(value) * 10
    ) / 10
  );
}

function formatClock(
  value: string | undefined
) {
  if (!value) return "indisponibil";

  const match = value.match(
    /T(\d{2}:\d{2})/
  );

  return match?.[1] ?? value;
}

function weatherCodeLabel(code: number) {
  if (code === 0) return "senin";
  if (code === 1) return "mai mult senin";
  if (code === 2) return "parțial noros";
  if (code === 3) return "acoperit";

  if (code === 45 || code === 48) {
    return "ceață";
  }

  if (
    [51, 53, 55, 56, 57].includes(code)
  ) {
    return "burniță";
  }

  if (
    [
      61,
      63,
      65,
      66,
      67,
      80,
      81,
      82,
    ].includes(code)
  ) {
    return "ploaie";
  }

  if (
    [71, 73, 75, 77, 85, 86].includes(
      code
    )
  ) {
    return "ninsoare";
  }

  if ([95, 96, 99].includes(code)) {
    return "furtuni";
  }

  return "condiții variabile";
}

function nearestHourlyIndex(
  times: string[],
  currentTime: string | undefined
) {
  if (times.length === 0) return -1;
  if (!currentTime) return 0;

  const exactIndex =
    times.indexOf(currentTime);

  if (exactIndex >= 0) {
    return exactIndex;
  }

  const currentMs =
    Date.parse(currentTime);

  if (!Number.isFinite(currentMs)) {
    return 0;
  }

  let bestIndex = 0;

  let bestDistance =
    Number.POSITIVE_INFINITY;

  times.forEach((time, index) => {
    const value = Date.parse(time);

    if (!Number.isFinite(value)) {
      return;
    }

    const distance = Math.abs(
      value - currentMs
    );

    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });

  return bestIndex;
}

function buildDailySnapshot(
  data: OpenMeteoResponse,
  index: number
) {
  const daily = data.daily;

  const date =
    daily?.time?.[index];

  if (!daily || !date) {
    return null;
  }

  const code = finiteNumber(
    daily.weather_code?.[index]
  );

  return {
    date,

    minTemperatureC: roundOne(
      daily.temperature_2m_min?.[index]
    ),

    maxTemperatureC: roundOne(
      daily.temperature_2m_max?.[index]
    ),

    precipitationProbabilityMax:
      Math.round(
        finiteNumber(
          daily
            .precipitation_probability_max?.[
            index
          ]
        )
      ),

    uvIndexMax: roundOne(
      daily.uv_index_max?.[index]
    ),

    windSpeedMaxKmh: roundOne(
      daily.wind_speed_10m_max?.[index]
    ),

    sunrise: formatClock(
      daily.sunrise?.[index]
    ),

    sunset: formatClock(
      daily.sunset?.[index]
    ),

    condition:
      weatherCodeLabel(code),
  };
}

function parseWeatherResponse(
  data: OpenMeteoResponse
): LiveWeatherSnapshot {
  if (
    !data.current ||
    !data.daily?.time?.[0]
  ) {
    throw new Error(
      "Răspunsul meteo nu conține datele necesare."
    );
  }

  const currentCode =
    finiteNumber(
      data.current.weather_code
    );

  const hourlyTimes =
    data.hourly?.time ?? [];

  const hourlyIndex =
    nearestHourlyIndex(
      hourlyTimes,
      data.current.time
    );

  const precipitationProbability =
    hourlyIndex >= 0
      ? data.hourly
          ?.precipitation_probability?.[
          hourlyIndex
        ]
      : undefined;

  const uvIndex =
    hourlyIndex >= 0
      ? data.hourly?.uv_index?.[
          hourlyIndex
        ]
      : undefined;

  const today =
    buildDailySnapshot(data, 0);

  if (!today) {
    throw new Error(
      "Prognoza zilnică nu este disponibilă."
    );
  }

  return {
    location: WEATHER_LOCATION,

    timezone:
      data.timezone ??
      WEATHER_TIMEZONE,

    fetchedAt:
      new Date().toISOString(),

    current: {
      temperatureC: roundOne(
        data.current.temperature_2m
      ),

      feelsLikeC: roundOne(
        data.current.apparent_temperature
      ),

      weatherCode: currentCode,

      condition:
        weatherCodeLabel(currentCode),

      windKmh: roundOne(
        data.current.wind_speed_10m
      ),

      windGustKmh: roundOne(
        data.current.wind_gusts_10m
      ),

      isDay:
        data.current.is_day === 1,

      precipitationProbability:
        typeof precipitationProbability ===
        "number"
          ? Math.round(
              precipitationProbability
            )
          : null,

      uvIndex:
        typeof uvIndex === "number"
          ? roundOne(uvIndex)
          : null,
    },

    today,

    tomorrow:
      buildDailySnapshot(data, 1),
  };
}

function buildWeatherUrl() {
  const {
    latitude,
    longitude,
  } =
    breezeConciergeKnowledge.identity
      .coordinates;

  const url = new URL(
    "https://api.open-meteo.com/v1/forecast"
  );

  url.searchParams.set(
    "latitude",
    String(latitude)
  );

  url.searchParams.set(
    "longitude",
    String(longitude)
  );

  url.searchParams.set(
    "current",
    [
      "temperature_2m",
      "apparent_temperature",
      "weather_code",
      "wind_speed_10m",
      "wind_gusts_10m",
      "is_day",
    ].join(",")
  );

  url.searchParams.set(
    "hourly",
    [
      "precipitation_probability",
      "uv_index",
    ].join(",")
  );

  url.searchParams.set(
    "daily",
    [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "uv_index_max",
      "wind_speed_10m_max",
      "sunrise",
      "sunset",
    ].join(",")
  );

  url.searchParams.set(
    "timezone",
    WEATHER_TIMEZONE
  );

  url.searchParams.set(
    "forecast_days",
    "3"
  );

  return url;
}

export function conversationNeedsLiveWeather(
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }>
) {
  const latestUserMessage = [
    ...messages,
  ]
    .reverse()
    .find(
      (message) =>
        message.role === "user"
    )?.content;

  if (!latestUserMessage) {
    return false;
  }

  const normalized =
    latestUserMessage
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .toLowerCase();

  return /(vreme|meteo|temperatur|grade|plou|ploaie|furtun|noros|senin|vant|briza|uv|canicul|cald|frig|rasarit|rasare|rasari|apus|apune|plaja azi|plaja maine|piscina azi|ce facem azi|ce facem maine|activitati azi|activitati maine|mergem la plaja|e buna vremea)/i.test(
    normalized
  );
}

export async function getLiveWeather(
  signal?: AbortSignal
): Promise<LiveWeatherResult> {
  const now = Date.now();

  if (
    weatherCache &&
    weatherCache.expiresAt > now
  ) {
    return weatherCache.value;
  }

  const timeoutController =
    new AbortController();

  const timeoutId = setTimeout(
    () =>
      timeoutController.abort(),
    REQUEST_TIMEOUT_MS
  );

  const abortHandler = () =>
    timeoutController.abort();

  signal?.addEventListener(
    "abort",
    abortHandler,
    { once: true }
  );

  let result: LiveWeatherResult;

  try {
    const response = await fetch(
      buildWeatherUrl(),
      {
        headers: {
          Accept:
            "application/json",

          "User-Agent":
            "BreezeVilla-AI-Concierge/1.0",
        },

        cache: "no-store",

        signal:
          timeoutController.signal,
      }
    );

    const data =
      (await response.json()) as OpenMeteoResponse;

    if (
      !response.ok ||
      data.error
    ) {
      throw new Error(
        data.reason ??
          `Open-Meteo ${response.status}`
      );
    }

    result = {
      ok: true,
      data:
        parseWeatherResponse(data),
    };
  } catch (error) {
    const reason =
      error instanceof Error
        ? error.message
        : "Serviciul meteo nu răspunde.";

    result = {
      ok: false,
      reason,
    };
  } finally {
    clearTimeout(timeoutId);

    signal?.removeEventListener(
      "abort",
      abortHandler
    );
  }

  weatherCache = {
    expiresAt:
      now +
      (result.ok
        ? CACHE_TTL_MS
        : 60_000),

    value: result,
  };

  return result;
}

function buildAdvice(
  snapshot: LiveWeatherSnapshot
) {
  const advice: string[] = [];

  const currentUv =
    snapshot.current.uvIndex ??
    snapshot.today.uvIndexMax;

  if (
    currentUv >= 6 ||
    snapshot.today.uvIndexMax >= 7
  ) {
    advice.push(
      "Indicele UV este ridicat: pentru copii, recomandă plaja dimineața sau după ora 17 și protecție solară."
    );
  }

  if (
    snapshot.current.feelsLikeC >=
      33 ||
    snapshot.today.maxTemperatureC >=
      34
  ) {
    advice.push(
      "Este foarte cald: recomandă evitarea expunerii prelungite între 12:00 și 16:00 și hidratare."
    );
  }

  if (
    snapshot.current
      .precipitationProbability !==
      null &&
    snapshot.current
      .precipitationProbability >=
      50
  ) {
    advice.push(
      "Există probabilitate relevantă de ploaie în ora curentă: prioritizează variante indoor."
    );
  } else if (
    snapshot.today
      .precipitationProbabilityMax >=
    55
  ) {
    advice.push(
      "Astăzi există risc de ploaie: menționează că ora exactă trebuie verificată și oferă alternative indoor."
    );
  }

  if (
    snapshot.current.windKmh >= 30 ||
    snapshot.today
      .windSpeedMaxKmh >= 35
  ) {
    advice.push(
      "Vântul poate face plaja mai puțin confortabilă. Nu afirma starea mării; recomandă verificarea steagului și indicațiilor salvamarului."
    );
  }

  return advice;
}

export function buildLiveWeatherContext(
  result: LiveWeatherResult
) {
  if (!result.ok) {
    return `DATE METEO LIVE
- Serviciul meteo nu a putut fi verificat acum.
- Nu inventa vremea. Spune pe scurt că datele live sunt temporar indisponibile și oferă recomandări generale prudente.`;
  }

  const weather = result.data;

  const tomorrow =
    weather.tomorrow
      ? `
MÂINE (${weather.tomorrow.date})
- Condiții estimate: ${weather.tomorrow.condition}.
- Temperatură: ${weather.tomorrow.minTemperatureC}–${weather.tomorrow.maxTemperatureC}°C.
- Probabilitate maximă de precipitații: ${weather.tomorrow.precipitationProbabilityMax}%.
- UV maxim: ${weather.tomorrow.uvIndexMax}.
- Vânt maxim: ${weather.tomorrow.windSpeedMaxKmh} km/h.
- Răsărit: ${weather.tomorrow.sunrise}; apus: ${weather.tomorrow.sunset}.`
      : "";

  const advice =
    buildAdvice(weather);

  return `DATE METEO LIVE — ${weather.location}
- Date actualizate la: ${weather.fetchedAt}.
- Fus orar: ${weather.timezone}.

ACUM
- Condiții: ${weather.current.condition}.
- Temperatură: ${weather.current.temperatureC}°C; resimțită: ${weather.current.feelsLikeC}°C.
- Vânt: ${weather.current.windKmh} km/h; rafale: ${weather.current.windGustKmh} km/h.
- Probabilitate precipitații în ora apropiată: ${
    weather.current
      .precipitationProbability ??
    "indisponibil"
  }${
    weather.current
      .precipitationProbability ===
    null
      ? ""
      : "%"
  }.
- Indice UV curent: ${
    weather.current.uvIndex ??
    "indisponibil"
  }.

ASTĂZI (${weather.today.date})
- Condiții generale: ${weather.today.condition}.
- Temperatură: ${weather.today.minTemperatureC}–${weather.today.maxTemperatureC}°C.
- Probabilitate maximă de precipitații: ${weather.today.precipitationProbabilityMax}%.
- UV maxim: ${weather.today.uvIndexMax}.
- Vânt maxim: ${weather.today.windSpeedMaxKmh} km/h.
- Răsărit: ${weather.today.sunrise}; apus: ${weather.today.sunset}.${tomorrow}

RECOMANDĂRI INTERNE
${
  advice.length > 0
    ? advice
        .map(
          (item) => `- ${item}`
        )
        .join("\n")
    : "- Condițiile nu impun o avertizare specială; răspunde proporțional cu întrebarea."
}

REGULI METEO
- Spune că datele sunt prognoze, nu garanții.
- Nu inventa temperatura mării, valurile sau culoarea steagului de pe plajă.
- Pentru siguranța în apă, recomandă verificarea steagului și respectarea salvamarului.
- Pentru întrebări simple, răspunde în 2–4 propoziții; nu enumera toate valorile dacă nu sunt cerute.
- Folosește numai datele de mai sus pentru vremea actuală și prognoză.`;
}