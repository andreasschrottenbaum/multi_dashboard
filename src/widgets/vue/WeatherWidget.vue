<template>
  <div class="widget-flipper">
    <div class="widget-flip-inner" :class="{ flipped: isFlipped }">
      <div class="widget-flip-front">
        <div class="weather-widget">
          <div class="weather-input">
            <input
              v-model="location"
              type="text"
              placeholder="Enter city name or coordinates"
              @keyup.enter="searchWeather"
            />
            <button @click="searchWeather" class="btn-search active">Search</button>
            <button @click="getLocalWeather" class="btn-local accent">📍 Local Weather</button>
          </div>

          <div v-if="loading" class="weather-loading">Loading weather...</div>
          <div v-if="error" class="weather-error">{{ error }}</div>

          <div v-if="weather" class="weather-display">
            <h3>{{ currentLocation }}</h3>
            <div class="weather-main">
              <div class="weather-temp">{{ Math.round(weather.temperature) }}°C</div>
              <div class="weather-condition">{{ getWeatherDescription(weather.weatherCode) }}</div>
            </div>
            <div class="weather-details">
              <div class="detail">
                <span class="label">Humidity</span>
                <span class="value">{{ weather.humidity }}%</span>
              </div>
              <div class="detail">
                <span class="label">Wind</span>
                <span class="value">{{ Math.round(weather.windSpeed) }} km/h</span>
              </div>
              <div class="detail">
                <span class="label">Pressure</span>
                <span class="value">{{ weather.pressure }} hPa</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="widget-flip-back">
        <div>
          <p><strong>Description:</strong> Real-time weather information for any city using Open-Meteo API.</p>
          <p><strong>Features:</strong> City search, local weather via geolocation, temperature, humidity, wind, and pressure data.</p>
          <p><strong>Data Source:</strong> Open-Meteo API (free, no authentication required)</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

interface WeatherData {
  temperature: number
  humidity: number
  windSpeed: number
  pressure: number
  weatherCode: number
}

export default defineComponent({
  name: 'WeatherWidget',
  data() {
    return {
      location: 'Berlin',
      weather: null as WeatherData | null,
      currentLocation: 'Berlin',
      loading: false,
      error: null as string | null,
      isFlipped: false,
    }
  },
  mounted() {
    window.addEventListener('toggle-flip-vue', () => {
      this.isFlipped = !this.isFlipped
    })
    // Load initial weather for default location
    this.searchWeather()

    // Listen for reset event from dashboard
    window.addEventListener('reset-widgets', () => {
      this.location = 'Berlin'
      this.searchWeather()
    })
  },
  methods: {
    async searchWeather() {
      if (!this.location.trim()) return
      this.loading = true
      this.error = null
      try {
        // Geocode the location
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(this.location)}&count=1&language=en&format=json`
        )
        const geoData = await geoRes.json()
        if (!geoData.results || geoData.results.length === 0) {
          this.error = 'Location not found'
          return
        }
        const { latitude, longitude, name, country } = geoData.results[0]
        this.currentLocation = `${name}, ${country}`
        await this.fetchWeather(latitude, longitude)
      } catch (err) {
        this.error = 'Failed to fetch location data'
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    async getLocalWeather() {
      this.loading = true
      this.error = null
      try {
        const position = await new Promise<GeolocationCoordinates>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve(pos.coords),
            (err) => reject(err)
          )
        })
        this.currentLocation = `${Math.round(position.latitude * 100) / 100}, ${Math.round(position.longitude * 100) / 100}`
        await this.fetchWeather(position.latitude, position.longitude)
      } catch (err) {
        this.error = 'Could not get your location. Please enable geolocation.'
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    async fetchWeather(latitude: number, longitude: number) {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,pressure_msl&temperature_unit=celsius&timezone=auto`
        )
        const data = await res.json()
        const current = data.current
        this.weather = {
          temperature: current.temperature_2m,
          humidity: current.relative_humidity_2m,
          windSpeed: current.wind_speed_10m,
          pressure: current.pressure_msl,
          weatherCode: current.weather_code,
        }
      } catch (err) {
        this.error = 'Failed to fetch weather data'
        console.error(err)
      }
    },

    getWeatherDescription(code: number): string {
      // WMO Weather interpretation codes
      const descriptions: Record<number, string> = {
        0: '☀️ Clear sky',
        1: '🌤️ Mainly clear',
        2: '⛅ Partly cloudy',
        3: '☁️ Overcast',
        45: '🌫️ Foggy',
        48: '🌫️ Depositing rime fog',
        51: '🌧️ Light drizzle',
        53: '🌧️ Moderate drizzle',
        55: '🌧️ Dense drizzle',
        61: '🌧️ Slight rain',
        63: '🌧️ Moderate rain',
        65: '⛈️ Heavy rain',
        71: '❄️ Slight snow',
        73: '❄️ Moderate snow',
        75: '❄️ Heavy snow',
        77: '❄️ Snow grains',
        80: '🌧️ Slight rain showers',
        81: '🌧️ Moderate rain showers',
        82: '⛈️ Violent rain showers',
        85: '❄️ Slight snow showers',
        86: '❄️ Heavy snow showers',
        95: '⛈️ Thunderstorm',
        96: '⛈️ Thunderstorm with hail',
        99: '⛈️ Thunderstorm with hail',
      }
      return descriptions[code] || '🌡️ Unknown'
    },
  },

  beforeUnmount() {
    window.removeEventListener('reset-widgets', () => {
      this.location = 'Berlin'
      this.searchWeather()
    })
  },
})
</script>

<style scoped>
  .weather-input {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 1em;
  }

  .weather-main {
    background: linear-gradient(135deg, #2563eb, #1e40af);
    color: #fff;
    padding: 1.5rem;
    border-radius: 8px;
    text-align: center;
    margin-bottom: 1rem;

    .weather-temp {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: .5rem;
    }

    .weather-condition {
      font-size: 1.1rem;
      opacity: .95;
    }
  }

  .weather-details {
    display: flex;
    gap: 1.5rem;
    margin-top: 1rem;
    justify-content: center;

    .detail {
      text-align: center;
      background: var(--border-color);
      color: var(--secondary-text-color);
      padding: 0.5rem 1rem;
      border-radius: 6px;
    }

    .value {
      display: block;
      font-weight: 700;
      font-size: 1.2rem;
    }
  }
</style>