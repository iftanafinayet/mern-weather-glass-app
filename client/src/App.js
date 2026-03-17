import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const apikey = "7deb5f7f30b94f3863cd8c914450404e";

function App() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);

  // Fungsi fetch didefinisikan di luar agar bisa dipanggil berkali-kali
  const fetchWeatherData = async (url) => {
    try {
      const response = await axios.get(url);
      const data = response.data;
      setWeatherData(data);
      saveWeatherData(data);

      // Ambil Forecast Data
      const urlcast = `https://api.openweathermap.org/data/2.5/forecast?q=${data.name}&appid=${apikey}`;
      const resCast = await axios.get(urlcast);
      setForecastData(resCast.data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apikey}`;
        fetchWeatherData(url);
      });
    }
    // Baris di bawah ini penting agar Netlify Build tidak error (exit code 2)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searchByCity = () => {
    if (!city) return;
    const urlsearch = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apikey}`;
    fetchWeatherData(urlsearch);
    setCity('');
  };

  const saveWeatherData = async (data) => {
    try {
      // Mengarah ke Netlify Function via proxy netlify.toml
      await axios.post('/api/weather', {
        city: data.name,
        country: data.sys.country,
        temperature: Math.floor(data.main.temp - 273),
        description: data.weather[0].description,
        icon: data.weather[0].icon,
      });
    } catch (error) {
      console.error('Error saving weather data:', error);
    }
  };

  return (
    <div>
      <div className="header">
        <h1>WEATHER APP</h1>
        <div>
          <input
            type="text"
            id="input"
            placeholder="Enter city name"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button id="search" onClick={searchByCity}>
            Search
          </button>
        </div>
      </div>

      <main>
        <div className="weather">
          <h2 id="city">
            {weatherData ? `${weatherData.name}, ${weatherData.sys.country}` : 'Loading...'}
          </h2>
          <div className="temp-box">
            <img
              src={weatherData ? `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png` : "/weathericon.png"}
              alt=""
              id="img"
            />
            <p id="temperature">
              {weatherData ? `${Math.floor(weatherData.main.temp - 273)} °C` : '-- °C'}
            </p>
          </div>
          <span id="clouds">
            {weatherData ? weatherData.weather[0].description : '---'}
          </span>
        </div>
        <div className="divider1"></div>

        <div className="forecstH">
          <p className="cast-header">Upcoming forecast</p>
          <div className="templist">
            {forecastData && forecastData.list.slice(0, 5).map((item, index) => (
              <div key={index} className="next">
                <div>
                  <p className="time">
                    {new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p>{Math.floor(item.main.temp_max - 273)} °C / {Math.floor(item.main.temp_min - 273)} °C</p>
                </div>
                <p className="desc">{item.weather[0].description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <div className="forecstD">
        <div className="divider2"></div>
        <p className="cast-header"> Next 4 days forecast</p>
        <div className="weekF">
          {forecastData && forecastData.list.filter((_, i) => i % 8 === 0).slice(1, 5).map((item, index) => (
            <div key={index} className="dayF">
              <p className="date">{new Date(item.dt * 1000).toDateString()}</p>
              <p>{Math.floor(item.main.temp_max - 273)} °C / {Math.floor(item.main.temp_min - 273)} °C</p>
              <p className="desc">{item.weather[0].description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;