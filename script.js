const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const weatherInfo = document.getElementById('weather-info');
const loadingState = document.getElementById('loading');
const errorMessage = document.getElementById('error');

const locationName = document.getElementById('location-name');
const currentDate = document.getElementById('current-date');
const tempValue = document.getElementById('temp-value');
const windSpeedValue = document.getElementById('wind-speed');
const weatherCodeValue = document.getElementById('weather-code');
const currentTimeValue = document.getElementById('current-time');
const weatherIconMain = document.getElementById('weather-icon-main');
const hourlyContainer = document.getElementById('hourly-container');

// Weather Code mapping for Open-Meteo
const weatherDescriptions = {
    0: 'Clear Sky',
    1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Freezing Fog',
    51: 'Light Drizzle', 53: 'Moderate Drizzle', 55: 'Dense Drizzle',
    61: 'Light Rain', 63: 'Moderate Rain', 65: 'Heavy Rain',
    71: 'Light Snow', 73: 'Moderate Snow', 75: 'Heavy Snow',
    95: 'Thunderstorm', 96: 'Thunderstorm (Slight Hail)', 99: 'Thunderstorm (Heavy Hail)'
};

function getWeatherIcon(code, isDay = 1, size = 60) {
    let iconSvg = '';
    
    if (code === 0 || code === 1) {
        iconSvg = isDay ? 
        `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>` 
        : 
        `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    } else if (code === 2 || code === 3 || code === 45 || code === 48) {
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#E2E8F0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>`;
    } else if ((code >= 51 && code <= 65) || (code >= 80 && code <= 82)) {
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path><line x1="16" y1="13" x2="16" y2="21"></line><line x1="8" y1="13" x2="8" y2="21"></line><line x1="12" y1="15" x2="12" y2="23"></line></svg>`;
    } else if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path><line x1="8" y1="14" x2="8.01" y2="14"></line><line x1="16" y1="14" x2="16.01" y2="14"></line><line x1="12" y1="18" x2="12.01" y2="18"></line><line x1="8" y1="20" x2="8.01" y2="20"></line><line x1="16" y1="20" x2="16.01" y2="20"></line></svg>`;
    } else if (code >= 95 && code <= 99) {
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path><polygon points="13 11 9 17 15 17 11 23"></polygon></svg>`;
    } else {
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#E2E8F0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>`;
    }
    
    return iconSvg;
}

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeatherByCity(city);
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            fetchWeatherByCity(city);
        }
    }
});

async function fetchWeatherByCity(city) {
    showLoading();
    
    try {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
        const geoData = await geoRes.json();
        
        if (!geoData.results || geoData.results.length === 0) {
            throw new Error('City not found');
        }
        
        const { latitude, longitude, name, timezone } = geoData.results[0];
        
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weathercode&current_weather=true&timezone=${timezone || 'auto'}`;
        
        const weatherRes = await fetch(weatherUrl);
        const weatherData = await weatherRes.json();
        
        updateUI(weatherData, name);
        
    } catch (error) {
        showError();
        console.error('Error fetching weather:', error);
    }
}

function updateUI(data, location) {
    hideLoading();
    
    locationName.textContent = location;
    
    // Set current date
    const dateOpts = { weekday: 'long', month: 'long', day: 'numeric' };
    currentDate.textContent = new Date().toLocaleDateString('en-US', dateOpts);
    
    // Process current weather
    const current = data.current_weather;
    tempValue.textContent = Math.round(current.temperature);
    windSpeedValue.textContent = `${Math.round(current.windspeed)} km/h`;
    
    // Set time 
    const timeStr = current.time; 
    const isDay = current.is_day !== undefined ? current.is_day : 1;
    
    const curDateObj = new Date(timeStr);
    currentTimeValue.textContent = curDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const code = current.weathercode;
    weatherCodeValue.textContent = weatherDescriptions[code] || 'Unknown';
    
    // Large centered icon
    weatherIconMain.innerHTML = getWeatherIcon(code, isDay, 100);
    
    // Render hourly forecast
    hourlyContainer.innerHTML = '';
    
    let startIndex = 0;
    if (current.time && data.hourly.time) {
        const foundIndex = data.hourly.time.findIndex(t => t === current.time);
        if (foundIndex !== -1) {
            startIndex = foundIndex;
        }
    }
    
    // Render next 24 hours (every 1 hour)
    const endIndex = Math.min(startIndex + 24, data.hourly.time.length);
    
    for (let i = startIndex; i < endIndex; i += 1) {
        const hourTimeStr = data.hourly.time[i];
        const temp = data.hourly.temperature_2m[i];
        const hourCode = data.hourly.weathercode[i];
        
        const dateObj = new Date(hourTimeStr);
        const timeFormatted = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Accurate day/night estimation
        const hr = dateObj.getHours();
        const hrIsDay = (hr >= 6 && hr <= 18) ? 1 : 0;
        
        const item = document.createElement('div');
        item.className = 'hourly-item' + (i === startIndex ? ' active' : '');
        
        const displayTime = (i === startIndex) ? 'Now' : timeFormatted;
        
        // Pass hourIsDay dynamically so moon shows up at night or sun during the day
        const hourlyIconSvg = getWeatherIcon(hourCode, hrIsDay, 32);

        // Adjust SVG color specifically for the active "Now" block so it stands out white
        const iconProcessed = (i === startIndex) 
            ? hourlyIconSvg.replace(/stroke="#[A-Z0-9]+"/gi, 'stroke="#FFFFFF"') 
            : hourlyIconSvg;
        
        item.innerHTML = `
            <span class="hourly-time">${displayTime}</span>
            <div class="hourly-icon">${iconProcessed}</div>
            <span class="hourly-temp">${Math.round(temp)}°</span>
        `;
        
        hourlyContainer.appendChild(item);
    }
    
    weatherInfo.style.display = 'block';
}

function showLoading() {
    weatherInfo.style.display = 'none';
    errorMessage.style.display = 'none';
    loadingState.style.display = 'block';
}

function hideLoading() {
    loadingState.style.display = 'none';
}

function showError() {
    hideLoading();
    weatherInfo.style.display = 'none';
    errorMessage.style.display = 'block';
}

// Initial fetch
fetchWeatherByCity('New York');
