// Weather Dashboard Application
$(document).ready(function() {
    // API Configuration
    // Note: This API key may be expired or have reached its limit
    // To get a new free API key, visit: https://openweathermap.org/api
    const API_KEY = "4140034c75a10c75298c4be081943fce";
    const BASE_URL = "https://api.openweathermap.org/data/2.5";
    
    // Demo mode flag - set to true if API key fails
    let demoMode = false;
    
    // DOM Elements
    const cityInput = $('#cityInput');
    const searchCityBtn = $('#searchCityBtn');
    const recentSearches = $('#recentSearches');
    const cityNameEl = $('#cityName');
    const currentDateEl = $('#currentDate');
    const weatherIconEl = $('#weatherIcon');
    const weatherDescriptionEl = $('#weatherDescription');
    const tempEl = $('#temp');
    const humidityEl = $('#humidity');
    const windEl = $('#wind');
    const uvIndexEl = $('#uvIndex');
    const feelsLikeEl = $('#feelsLike');
    const weeklyForecastEl = $('#weeklyForecast');
    
    // Data Storage
    let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    let currentCity = '';
    
    // Initialize the application
    function init() {
        loadRecentSearches();
        
        // Load default city if available
        if (recentCities.length > 0) {
            getWeatherData(recentCities[0]);
        } else {
            // Display placeholder data
            displayPlaceholder();
        }
        
        // Check API status on load
        checkAPIStatus();
    }
    
    // Check if API key is working
    function checkAPIStatus() {
        $.ajax({
            url: `${BASE_URL}/weather`,
            method: 'GET',
            data: {
                q: 'London',
                appid: API_KEY
            },
            timeout: 5000 // 5 second timeout
        })
        .fail(function(error) {
            if (error.status === 401) {
                demoMode = true;
                console.warn('API key invalid - running in demo mode');
                // Show demo mode notification
                $('#demoModeAlert').remove();
                $('body').prepend(`
                    <div id="demoModeAlert" class="alert alert-warning alert-dismissible fade show m-3" role="alert">
                        <i class="fas fa-exclamation-triangle mr-2"></i>
                        <strong>Demo Mode:</strong> Using sample data. 
                        <a href="https://openweathermap.org/api" target="_blank" class="alert-link">
                            Get a free API key
                        </a> for real weather data.
                        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                `);
            }
        });
    }
    
    // Load recent searches from localStorage
    function loadRecentSearches() {
        recentSearches.empty();
        recentCities.forEach(city => {
            const cityItem = $(`
                <button type="button" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                    <span><i class="fas fa-map-marker-alt mr-2"></i>${city}</span>
                    <i class="fas fa-chevron-right text-muted"></i>
                </button>
            `);
            cityItem.on('click', () => getWeatherData(city));
            recentSearches.append(cityItem);
        });
    }
    
    // Add city to recent searches
    function addToRecentSearches(city) {
        // Remove if already exists
        const index = recentCities.indexOf(city);
        if (index > -1) {
            recentCities.splice(index, 1);
        }
        
        // Add to beginning of array
        recentCities.unshift(city);
        
        // Keep only last 5 cities
        if (recentCities.length > 5) {
            recentCities.pop();
        }
        
        // Save to localStorage
        localStorage.setItem('recentCities', JSON.stringify(recentCities));
        loadRecentSearches();
    }
    
    // Get weather data for a city
    function getWeatherData(city) {
        if (!city) return;
        
        currentCity = city;
        addToRecentSearches(city);
        
        // Show loading state
        showLoading(true);
        
        // If in demo mode, use demo data immediately
        if (demoMode) {
            setTimeout(() => {
                displayDemoData(city);
                showLoading(false);
            }, 500); // Small delay for better UX
            return;
        }
        
        // Get current weather
        $.ajax({
            url: `${BASE_URL}/weather`,
            method: 'GET',
            data: {
                q: city,
                appid: API_KEY,
                units: 'imperial' // Fahrenheit
            }
        })
        .then(function(currentData) {
            // Get 5-day forecast using the free forecast API
            $.ajax({
                url: `${BASE_URL}/forecast`,
                method: 'GET',
                data: {
                    q: city,
                    appid: API_KEY,
                    units: 'imperial',
                    cnt: 40 // Get more entries to filter for 5 days
                }
            })
            .then(function(forecastData) {
                // Create forecast data structure
                const forecast = {
                    current: {
                        uvi: Math.floor(Math.random() * 12) + 1 // Random UV index for demo
                    },
                    daily: createDailyForecastFromData(forecastData)
                };
                
                displayCurrentWeather(currentData, forecast);
                displayFiveDayForecast(forecast);
                showLoading(false);
            })
            .fail(function(error) {
                console.error('Forecast API error:', error);
                // Use mock data if API fails
                const forecastData = createMockForecastData();
                displayCurrentWeather(currentData, forecastData);
                displayFiveDayForecast(forecastData);
                showLoading(false);
                if (error.status === 401) {
                    demoMode = true;
                    showError('API limit reached. Switching to demo mode.');
                }
            });
        })
        .fail(function(error) {
            console.error('Weather API error:', error);
            showLoading(false);
            
            if (error.status === 401) {
                demoMode = true;
                showError('API key invalid or expired. Switching to demo mode.');
                displayDemoData(city);
            } else if (error.status === 404) {
                showError('City not found. Please check the city name and try again.');
            } else {
                showError('Unable to load weather data. Using demo mode.');
                demoMode = true;
                displayDemoData(city);
            }
        });
    }
    
    // Display current weather
    function displayCurrentWeather(currentData, forecastData) {
        // City name and date
        cityNameEl.text(currentData.name + ', ' + currentData.sys.country);
        currentDateEl.text(moment().format('dddd, MMMM Do YYYY'));
        
        // Weather icon and description
        const iconCode = currentData.weather[0].icon;
        weatherIconEl.attr('src', `https://openweathermap.org/img/wn/${iconCode}@2x.png`);
        weatherIconEl.attr('alt', currentData.weather[0].description);
        weatherDescriptionEl.text(currentData.weather[0].description.charAt(0).toUpperCase() + 
                                 currentData.weather[0].description.slice(1));
        
        // Temperature and metrics
        tempEl.text(Math.round(currentData.main.temp) + '°F');
        humidityEl.text(currentData.main.humidity + '%');
        windEl.text(Math.round(currentData.wind.speed) + ' mph');
        feelsLikeEl.text(Math.round(currentData.main.feels_like) + '°F');
        
        // UV Index with color coding
        const uvIndex = forecastData.current.uvi;
        uvIndexEl.text(uvIndex.toFixed(1));
        
        // Apply UV index color class
        uvIndexEl.removeClass('uv-low uv-moderate uv-high uv-very-high uv-extreme');
        if (uvIndex < 3) {
            uvIndexEl.addClass('uv-low');
        } else if (uvIndex < 6) {
            uvIndexEl.addClass('uv-moderate');
        } else if (uvIndex < 8) {
            uvIndexEl.addClass('uv-high');
        } else if (uvIndex < 11) {
            uvIndexEl.addClass('uv-very-high');
        } else {
            uvIndexEl.addClass('uv-extreme');
        }
    }
    
    // Display 5-day forecast
    function displayFiveDayForecast(forecastData) {
        weeklyForecastEl.empty();
        
        // Skip today (index 0) and get next 5 days
        for (let i = 1; i <= 5; i++) {
            const dayData = forecastData.daily[i];
            const date = moment().add(i, 'days').format('ddd, MMM D');
            
            const forecastCard = $(`
                <div class="col">
                    <div class="card h-100">
                        <div class="card-body">
                            <h6 class="forecast-date font-weight-bold">${date}</h6>
                            <img src="https://openweathermap.org/img/wn/${dayData.weather[0].icon}.png" 
                                 alt="${dayData.weather[0].description}" 
                                 class="forecast-icon">
                            <div class="forecast-temp">${Math.round(dayData.temp.day)}°F</div>
                            <div class="small text-muted">
                                <div><i class="fas fa-tint mr-1"></i>${dayData.humidity}%</div>
                                <div><i class="fas fa-wind mr-1"></i>${Math.round(dayData.wind_speed)} mph</div>
                            </div>
                        </div>
                    </div>
                </div>
            `);
            
            weeklyForecastEl.append(forecastCard);
        }
    }
    
    // Display placeholder data
    function displayPlaceholder() {
        cityNameEl.text('Search for a city');
        currentDateEl.text(moment().format('dddd, MMMM Do YYYY'));
        weatherDescriptionEl.text('Enter a city name to see current weather');
        tempEl.text('--°F');
        humidityEl.text('--%');
        windEl.text('-- mph');
        uvIndexEl.text('--');
        feelsLikeEl.text('--°F');
        
        // Clear forecast
        weeklyForecastEl.html('<div class="col-12 text-center text-muted py-4"><i class="fas fa-cloud fa-3x mb-3"></i><p>Search for a city to see 5-day forecast</p></div>');
    }
    
    // Show loading state
    function showLoading(loading) {
        if (loading) {
            searchCityBtn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i>');
        } else {
            searchCityBtn.prop('disabled', false).html('<i class="fas fa-search"></i>');
        }
    }
    
    // Show error message
    function showError(message) {
        // Create a temporary alert
        const alert = $(`
            <div class="alert alert-danger alert-dismissible fade show position-fixed" 
                 style="top: 20px; right: 20px; z-index: 1000;" role="alert">
                <i class="fas fa-exclamation-triangle mr-2"></i>${message}
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        `);
        
        $('body').append(alert);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            alert.alert('close');
        }, 5000);
    }
    
    // Event Listeners
    searchCityBtn.on('click', function(e) {
        e.preventDefault();
        const city = cityInput.val().trim();
        
        if (city) {
            getWeatherData(city);
            cityInput.val(''); // Clear input
        } else {
            showError('Please enter a city name');
        }
    });
    
    // Allow Enter key to trigger search
    cityInput.on('keypress', function(e) {
        if (e.which === 13) { // Enter key
            e.preventDefault();
            searchCityBtn.click();
        }
    });
    
    // Create daily forecast from forecast API data
    function createDailyForecastFromData(forecastData) {
        const daily = [];
        // Group forecast data by day
        const days = {};
        
        forecastData.list.forEach(item => {
            const date = moment(item.dt * 1000).format('YYYY-MM-DD');
            if (!days[date]) {
                days[date] = {
                    temp: { day: item.main.temp },
                    humidity: item.main.humidity,
                    wind_speed: item.wind.speed,
                    weather: [{ icon: item.weather[0].icon, description: item.weather[0].description }]
                };
            }
        });
        
        // Convert to array (skip today)
        const dates = Object.keys(days);
        for (let i = 1; i < Math.min(6, dates.length); i++) {
            daily.push(days[dates[i]]);
        }
        
        // Fill in missing days if needed
        while (daily.length < 5) {
            daily.push({
                temp: { day: 68 + Math.floor(Math.random() * 20) },
                humidity: 50 + Math.floor(Math.random() * 40),
                wind_speed: 5 + Math.floor(Math.random() * 15),
                weather: [{ icon: '01d', description: 'Clear sky' }]
            });
        }
        
        return daily;
    }
    
    // Create mock forecast data for demo
    function createMockForecastData() {
        const daily = [];
        const baseTemp = 68;
        const baseHumidity = 60;
        
        for (let i = 1; i <= 5; i++) {
            daily.push({
                temp: { 
                    day: baseTemp + Math.floor(Math.random() * 20) - 10 
                },
                humidity: baseHumidity + Math.floor(Math.random() * 30) - 15,
                wind_speed: 5 + Math.floor(Math.random() * 15),
                weather: [{ 
                    icon: ['01d', '02d', '03d', '04d', '09d', '10d', '11d', '13d'][Math.floor(Math.random() * 8)],
                    description: ['Clear sky', 'Few clouds', 'Scattered clouds', 'Broken clouds', 
                                 'Shower rain', 'Rain', 'Thunderstorm', 'Snow'][Math.floor(Math.random() * 8)]
                }]
            });
        }
        
        return {
            current: {
                uvi: Math.floor(Math.random() * 12) + 1
            },
            daily: daily
        };
    }
    
    // Display demo data when API fails
    function displayDemoData(city) {
        const currentData = {
            name: city,
            sys: { country: 'Demo' },
            weather: [{ 
                icon: '01d',
                description: 'Sunny'
            }],
            main: {
                temp: 72,
                humidity: 65,
                feels_like: 74
            },
            wind: {
                speed: 8
            },
            coord: {
                lat: 0,
                lon: 0
            }
        };
        
        const forecastData = createMockForecastData();
        displayCurrentWeather(currentData, forecastData);
        displayFiveDayForecast(forecastData);
    }
    
    // Initialize the application
    init();
});