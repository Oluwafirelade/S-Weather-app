let cityInput = document.getElementById('city_input'),
    searchBtn = document.getElementById('searchBtn'),
    locationBtn = document.getElementById('locationBtn');

const apiKey = '60ec5cf61f2d4299c3ee2068ceb6c208';

// Helper: format Unix time to readable format
function formatTime(timestamp, type = 'time') {
    const date = new Date(timestamp * 1000);
    if (type === 'time') return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (type === 'date') return date.toDateString();
}

// Fetch weather by city name
async function getWeatherByCity(city) {
    try {
        const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        const currentData = await currentRes.json();

        const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
        const forecastData = await forecastRes.json();

        const airRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${currentData.coord.lat}&lon=${currentData.coord.lon}&appid=${apiKey}`);
        const airData = await airRes.json();

        updateUI(currentData, forecastData, airData);
    } catch (err) {
        alert("City not found or network error!");
    }
}

// Fetch weather by coordinates
function getWeatherByLocation() {
    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;

        const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`);
        const currentData = await currentRes.json();

        const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`);
        const forecastData = await forecastRes.json();

        const airRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${apiKey}`);
        const airData = await airRes.json();

        updateUI(currentData, forecastData, airData);
    }, () => {
        alert("Location permission denied!");
    });
}

// Update UI with data
function updateUI(current, forecast, air) {
    // Current weather
    document.querySelector('.current-weather h2').innerHTML = `${Math.round(current.main.temp)}&deg;C`;
    document.querySelector('.current-weather .details p:last-child').textContent = current.weather[0].description;
    document.querySelector('.weather-icon img').src = `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`;
    document.querySelector('.card-footer p:nth-child(1)').innerHTML = `<i class="fa-light fa-calendar"></i> ${formatTime(current.dt, 'date')}`;
    document.querySelector('.card-footer p:nth-child(2)').innerHTML = `<i class="fa-light fa-location-dot"></i> ${current.name}, ${current.sys.country}`;

    // Highlights
    document.getElementById('humidityVal').textContent = `${current.main.humidity}%`;
    document.getElementById('pressureVal').textContent = `${current.main.pressure} hPa`;
    document.getElementById('visibilityVal').textContent = `${current.visibility / 1000} km`;
    document.getElementById('windSpeedVal').textContent = `${current.wind.speed} m/s`;
    document.getElementById('feelsVal').innerHTML = `${Math.round(current.main.feels_like)}&deg;C`;

    document.querySelector('.sunrise-sunset .item:nth-child(1) h2').textContent = formatTime(current.sys.sunrise);
    document.querySelector('.sunrise-sunset .item:nth-child(2) h2').textContent = formatTime(current.sys.sunset);

    // Air Quality
    const airValues = air.list[0].components;
    const aqiText = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];
    const aqiClass = ["aqi-1", "aqi-2", "aqi-3", "aqi-4", "aqi-5"];
    const aqi = air.list[0].main.aqi;
    const airIndexEl = document.querySelector('.air-index');
    airIndexEl.textContent = aqiText[aqi - 1];
    airIndexEl.className = `air-index ${aqiClass[aqi - 1]}`;

    const airItems = document.querySelectorAll('.air-indices .item h2');
    airItems[0].textContent = airValues.pm2_5;
    airItems[1].textContent = airValues.pm10;
    airItems[2].textContent = airValues.so2;
    airItems[3].textContent = airValues.co;
    airItems[4].textContent = airValues.no;
    airItems[5].textContent = airValues.no2;
    airItems[6].textContent = airValues.nh3;
    airItems[7].textContent = airValues.o3;

    // 5-day Forecast (4 items only)
    const dailyItems = document.querySelectorAll('.forecast-item');
    for (let i = 0; i < 4; i++) {
        const dayData = forecast.list[i * 8]; // approx every 24 hrs
        dailyItems[i].querySelector('img').src = `https://openweathermap.org/img/wn/${dayData.weather[0].icon}@2x.png`;
        dailyItems[i].querySelector('span').innerHTML = `${Math.round(dayData.main.temp)}&deg;C`;
        dailyItems[i].querySelectorAll('p')[0].textContent = dayData.weather[0].main;
        dailyItems[i].querySelectorAll('p')[1].textContent = formatTime(dayData.dt, 'date');
    }

    // Hourly forecast (next 8)
    const hourlyCards = document.querySelectorAll('.hourly-forecast .card');
    for (let i = 0; i < 8; i++) {
        const hourData = forecast.list[i];
        hourlyCards[i].querySelector('p').textContent = formatTime(hourData.dt);
        hourlyCards[i].querySelector('img').src = `https://openweathermap.org/img/wn/${hourData.weather[0].icon}.png`;
        hourlyCards[i].querySelectorAll('p')[1].innerHTML = `${Math.round(hourData.main.temp)}&deg;C`;
    }
}

// Event listeners
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) getWeatherByCity(city);
});

locationBtn.addEventListener('click', getWeatherByLocation);

// Optional: Fetch weather for default city on load
getWeatherByCity('Lagos');
