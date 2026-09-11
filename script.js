var cityListEl = document.querySelector('#cityList');
var weeklyForecast = document.querySelector('#weeklyForecast');
var currentWeatherDiv = document.querySelector('.center');
var cityTemp = document.querySelector('#temp');
var cityHumidity = document.querySelector('#humidity');
var cityWind = document.querySelector('#wind');
var cityUvIndex = document.querySelector('#uvIndex');
var cityList = [];
var cityName;
var APPKEY = "4140034c75a10c75298c4be081943fce";
var cityInputVal = document.querySelector('#cityName');
var icon = document.querySelector('#icon');

searchCityBtn.addEventListener("click", function(event){
    event.preventDefault();
    var cityInputVal = document.getElementById('cityName').value.trim();
    console.log(cityInputVal);
    if(cityInputVal === ""){
        alert("Please enter a city to look up")

    }else if (cityList.length >= 5){  
        cityList.shift();
        cityList.push(cityInputVal);

    }
    // else{
    // cityList.push(cityInputVal);
    // }

    // displayWeather();
    // displayFiveDayForecast();

    var city;
    var currentWeather = document.querySelector(".card-body");
function displayWeather(data) {
  
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityInputVal + "&appid=4140034c75a10c75298c4be081943fce"
    // currentWeather.empty();
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (data){
        var cityNameEl = document.querySelector('#cityName');
        var presentDay = moment().format('MMM/DD/YYYY');
            cityNameEl.textContent = cityName + presentDay;
        var iconCode= data.weather[0].icon;
        var iconURL = "http://openweathermap.org/img/w/" + iconCode + ".png";
            icon.textContent = iconURL;
        var getTemp = data.main.temp;
            cityTemp.textContent = ("Temperature: " +getTemp+ " °F");
        var getHumidity = data.main.humidity;
            cityHumidity.textContent = ("Humidity: " +getHumidity+ " %");
        var getWindSpeed = data.wind.speed;
            cityWind.textContent = ("Wind Speed: " +getWindSpeed+ " MPH");
        // var getUvIndex = data.current.uvi;
        //     cityUvIndex.textContent = ("UV Index:  " +getUvIndex);
        
    })
    var getLon = data.coord.lon;
        var getLat = data.coord.lat;
    console.log(queryURL);
};   
    displayWeather();


    var getLon = data.coord.lon;
    var getLat = data.coord.lat;
function displayFiveDayForecast(data) {
    
    var queryURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" +getLat+ "&lon" +getLon+ "&appid=4140034c75a10c75298c4be081943fce";
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (data){
        console.log(data);
         console.log(response);
      for (i=0; i<5;i++){
          var forecastCard = document.createElement("div");
          forecastCard.classList.add('card', 'text-dark', 'text-center')  
          
          var resultBody = document.createElement("div");
          resultBody.classList.add('card-body');
          forecastCard.append(resultBody);

          var bodyContentEl = document.createElement('p');
          var cityDate = moment().format("MM/DD/YYYY");
          bodyContentEl.innerHTML = cityDate + '<br>'
          
          var getTemp = data.list[i].daily.temp;
          bodyContentEl.innerHTML = 'Temperature: ' +getTemp+ '° F' + '<br>';

          var getHumidity = data.list[i].daily.humidity;
          bodyContentEl.innerHTML = 'Humidity: ' +getHumidity+ '%' + '<br>';
        }
        resultBody.append(bodyContentEl);
        weeklyForecast.append(forecastCard);
    })
    displayFiveDayForecast();

};  console.log(displayFiveDayForecast);
}); 


// // Trying to search for a city 
// // shows name of city (appends from search) and the date (need moment format)
// // Then it shows the towns temp (need calculations for farheit) humidity (response), wind speed, 
// // uv (separate api for UV also need if for difference in UV - color the box) another "GET"
// // then it shows 5-day forecast temp, humidity and icon ()
