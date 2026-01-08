<template>
  <div class="weather-widget">
    <div class="weather-input">
      <input
        v-model="location"
        type="text"
        placeholder="Enter city name or coordinates"
        @keyup.enter="searchWeather"
      />
      <button @click="searchWeather" class="btn-search">Search</button>
      <button @click="getLocalWeather" class="btn-local">📍 Local Weather</button>
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
    }
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

  mounted() {
    // Load initial weather for default location
    this.searchWeather()

    // Listen for reset event from dashboard
    window.addEventListener('reset-widgets', () => {
      this.location = 'Berlin'
      this.searchWeather()
    })
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
.weather-widget {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.weather-input {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.weather-input input {
  flex: 1;
  min-width: 150px;
  padding: 0.6rem 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: border-color 0.2s;
}

.weather-input input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.btn-search,
.btn-local {
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  white-space: nowrap;
}

.btn-search {
  background: #2563eb;
  color: white;
}

.btn-search:hover {
  background: #1d4ed8;
}

.btn-local {
  background: #10b981;
  color: white;
}

.btn-local:hover {
  background: #059669;
}

.btn-search:active,
.btn-local:active {
  transform: scale(0.98);
}

.weather-loading,
.weather-error {
  text-align: center;
  padding: 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.weather-loading {
  color: #6b7280;
  background: #f9fafb;
}

.weather-error {
  color: #ef4444;
  background: #fee;
}

.weather-display h3 {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  color: #1f2937;
}

.weather-main {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 1rem;
}

.weather-temp {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.weather-condition {
  font-size: 1.1rem;
  opacity: 0.95;
}

.weather-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.detail {
  display: flex;
  flex-direction: column;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 4px;
  text-align: center;
}

.detail .label {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
}

.detail .value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
}

@media (max-width: 480px) {
  .weather-input {
    flex-direction: column;
  }

  .weather-input input,
  .btn-search,
  .btn-local {
    width: 100%;
  }

  .weather-details {
    grid-template-columns: 1fr;
  }
}
</style>
