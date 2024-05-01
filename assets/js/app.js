getCurrentDay = () => {
  var currentDayEl = $(".today-date");

  // Use moment.js to format the current date
  var currentDay = moment(new Date()).format("ddd Do MMMM");

  // Set the text of the element to the current day
  currentDayEl.text(currentDay);

  currentDayEl.hide();

  animationEntrance(currentDayEl);
};

getWeatherData = (location, latitude, longitude) => {
  var apiKey = "a3a1179d4cb7b4ca24713bc14a6d33a2";
  var baseURL = "https://api.openweathermap.org/data/2.5/";
  var currentURL = baseURL + `weather?appid=${apiKey}&units=metric&`;
  var forecastURL = baseURL + `forecast?appid=${apiKey}&units=metric&`;

  if (location) {
    // Make a request to the OpenWeatherMap API using the city name
    $.get(currentURL + `q=${location}`).then(function (currentData) {
      displayCurrentWeather(currentData);
      displayCurrentIcon(currentData);
      saveCities(currentData);
      printCities(currentData);
      displayNightTheme(currentData);

      $.get(forecastURL + `lat=${currentData.coord.lat}&lon=${currentData.coord.lon}`).then(function (forecastData) {
        displayForecast(forecastData);
        displayForecastIcons(forecastData);
      });
    });
  } else if (latitude && longitude) {
    // Make a request to the OpenWeatherMap API using the latitude and longitude
    $.get(currentURL + `lat=${latitude}&lon=${longitude}`).then(function (currentData) {
      displayCurrentWeather(currentData);
      displayCurrentIcon(currentData);
      saveCities(currentData);
      printCities(currentData);
      displayNightTheme(currentData);

      $.get(forecastURL + `lat=${latitude}&lon=${longitude}`).then(function (forecastData) {
        displayForecast(forecastData);
        displayForecastIcons(forecastData);
      });
    });
  }
};

getCurrentLocation = () => {
  // Check if the browser supports the Geolocation API
  if (navigator.geolocation) {
    // Get the user's current position
    navigator.geolocation.getCurrentPosition((position) => {
      // Get the latitude and longitude of the user's current location
      var latitude = position.coords.latitude;
      var longitude = position.coords.longitude;

      // Pass the latitude and longitude to the getWeatherData function
      getWeatherData(null, latitude, longitude);
    });
  } else {
    console.error("Geolocation is not supported by this browser.");
  }
};

displayCurrentWeather = (currentData) => {
  var currentWeatherEl = $("#today");
  var currentWindSpeed = Math.round(currentData.wind.speed);
  var currentTemp = Math.round(currentData.main.temp);
  var highTemp = Math.round(currentData.main.temp_max);
  var lowTemp = Math.round(currentData.main.temp_min);
  var feelsLike = Math.round(currentData.main.feels_like);
  var currentHumidity = currentData.main.humidity;
  var currentDescription = currentData.weather[0].main;
  var cityName = $("h1");

  currentWeatherEl.hide();
  cityName.hide();

  cityName.text(currentData.name + ", " + currentData.sys.country);

  // Remove all existing content from the element
  currentWeatherEl.empty();

  // Append new content to the element
  currentWeatherEl.append(
    $(`
              
              <div class="icon-wrapper text-center">
                <img class="icon changingIcon" src="" alt="Weather Icon" />
                <p class="today-temp">${currentTemp}&#176;</p>
                <p class="today-weather-desc">${currentDescription}</p>
                <p class="high-low-wrapper"><span class="high">H:${highTemp}&#176;</span> <span class"low">L:${lowTemp}&#176;</span></p>
              </div>
              <div class="details-wrapper">
                <div class="today-wind-wrapper text-center">
                  <img class="icon" src="assets/icons/windy.png" alt="Wind Icon" />
                  <p class="today-wind">Wind: ${currentWindSpeed}kph</p>
                </div>
                <div class="feels-like-wrapper text-center">
                  <p class="feels-like-text">Feels like:</p>
                  <p class="feels-like">${feelsLike}&#176;</p>
                </div>
                <div class="today-humid-wrapper text-center">
                  <img class="icon" src="assets/icons/rainy-cloudy.png" alt="Humidity Icon" />
                  <p class="today-humid">Humidity: ${currentHumidity}%</p>
                </div>
              </div>`)
  );

  // Animate the elements to fade in
  animationEntrance(cityName);
  animationEntrance(currentWeatherEl);
};

displayForecast = (forecastData) => {
  var forecastEl = $("#forecast");

  // Filter the forecast data to only include data for the 12pm forecast
  var noonForecastData = forecastData.list.filter((day) => day.dt_txt.endsWith("12:00:00"));

  forecastEl.hide();
  forecastEl.empty();

  // Iterate over the forecast data
  noonForecastData.forEach((day) => {
    var forecastTemp = Math.round(day.main.temp);
    var forecastWind = Math.round(day.wind.speed);
    var forecastHumid = day.main.humidity;
    var date = day.dt_txt;
    var dayOfWeek = moment(date, "YYYY-MM-DD HH:mm:ss").format("ddd");

    var currentDayOfWeek = moment().format("ddd");
    var tomorrow = moment().add(1, "day").format("ddd");

    if (dayOfWeek === currentDayOfWeek) {
      dayOfWeek = "Today";
    } else if (dayOfWeek === tomorrow) {
      dayOfWeek = "Tomorrow";
    }

    // Append new content to the element
    forecastEl.append(
      `<div class="forecast-day-wrap">
         <p class="forecast-day">${dayOfWeek}</p>
         <img class="forecast-icon forecast-changing-icon" src="" alt="Weather Icon" />
         <div class="forecast-temp">${forecastTemp}&#176;</div>
         <div class="forecast-wind">Wind: ${forecastWind}kph</div>
         <div class="forecast-humid">Humidity: ${forecastHumid}%</div>
       </div>
       <hr />`
    );
  });

  // Animate the element to fade in
  animationEntrance(forecastEl);
};

saveCities = (currentData) => {
  // Get the name of the city from API
  cityName = currentData.name;

  // Get the stored cities from local storage, or an empty array if none are found
  var storedCities = JSON.parse(localStorage.getItem("Cities")) || [];

  // Check if the new city name is already in the array
  if (storedCities.includes(cityName)) {
    // If it is, remove it from its current position
    var index = storedCities.indexOf(cityName);
    storedCities.splice(index, 1);
  }

  // Add the city name to the beginning of the array
  storedCities.unshift(cityName);

  // Keep only the first 5 elements of the array
  storedCities = storedCities.slice(0, 5);

  // Save the modified array to local storage
  localStorage.setItem("Cities", JSON.stringify(storedCities));
};

printCities = () => {
  var noSearchHistory = $(".no-search-text");

  // Get the saved cities from local storage
  var savedCities = JSON.parse(localStorage.getItem("Cities"));

  // Remove all existing content from the element
  $(".saved-city").empty();

  // If there are no saved cities, show the "No search history" text and return
  if (!savedCities) {
    return noSearchHistory.show();
  }

  // Otherwise, hide the "No search history" text
  noSearchHistory.hide();

  // Iterate over the saved cities
  savedCities.forEach((city) => {
    // Append a list item element with the city name to the element
    $("ul").append(`<a class='day-saved-city night-saved-city' href=''><li class='saved-city'>${city}</li></a>`);
    // Remove empty list items
    $("li:empty").remove();
    // Remove empty anchor elements
    $("a:empty").remove();
  });
};

var iconUrlMap = {
  "01d": "assets/icons/clear-sky.png",
  "02d": "assets/icons/few-clouds.png",
  "03d": "assets/icons/scattered-clouds.png",
  "04d": "assets/icons/broken-clouds.png",
  "09d": "assets/icons/shower-rain.png",
  "10d": "assets/icons/rain.png",
  "11d": "assets/icons/thunderstorm.png",
  "13d": "assets/icons/snow.png",
  "50d": "assets/icons/mist.png",
  "01n": "assets/icons/night-clear-sky.png",
  "02n": "assets/icons/night-few-clouds.png",
  "03n": "assets/icons/scattered-clouds.png",
  "04n": "assets/icons/broken-clouds.png",
  "09n": "assets/icons/night-rain.png",
  "10n": "assets/icons/night-rain.png",
  "11n": "assets/icons/thunderstorm.png",
  "13n": "assets/icons/night-snow.png",
  "50n": "assets/icons/night-mist.png",
};

// This function maps the icon code to the corresponding icon URL
var getIconUrl = (icon) => {
  // If there is no mapping for the icon code, return the sunrise icon URL as a default
  return iconUrlMap[icon] || "assets/icons/sunrise.png";
};

displayCurrentIcon = (currentData) => {
  // Get the icon code for the current weather
  var icon = currentData.weather[0].icon;

  // Generate the URL for the icon image based on the icon code
  var iconUrl = getIconUrl(icon);

  // Select the element with the class "changingIcon"
  var iconElement = $(".changingIcon");

  // Set the src attribute of the element to the icon URL
  iconElement.attr("src", iconUrl);
};

displayForecastIcons = (forecastData) => {
  // Find the day objects with a dt_txt property ending in "12:00:00"
  var noonForecastData = forecastData.list.filter((day) => day.dt_txt.endsWith("12:00:00"));

  var iconElements = $(".forecast-changing-icon");

  // Iterate over the noon forecast data and the icon elements
  noonForecastData.forEach((day, index) => {
    // Get the icon for the current day
    var icon = day.weather[0].icon;

    // Replace "n" with "d" in the icon name to fix bug with timezone displaying night icon for noon
    icon = icon.replace("n", "d");

    // Get the URL for the icon
    var iconUrl = getIconUrl(icon);

    // Set the src attribute for the corresponding iconElement
    $(iconElements[index]).attr("src", iconUrl);
  });
};

// Function to animate elements onto the page
animationEntrance = (element) => {
  element.fadeIn({
    duration: 1500,
    easing: "swing",
  });
};

displayNightTheme = (currentData) => {
  // Get the current time
  var currentTime = Date.now() / 1000;

  // Get the sunset and sunrise times
  var sunset = currentData.sys.sunset;
  var sunrise = currentData.sys.sunrise;

  // If the current hour is within the night period (between 18 and 6), apply the night theme
  if (currentTime < sunrise || currentTime > sunset) {
    applyNightTheme();
  } else removeNightTheme();
};

applyNightTheme = () => {
  // Set the colors to be used for the night theme
  var bgNightColor = "linear-gradient(var(--dark-primary), var(--dark-secondary))";
  var nightPrimary = "var(--dark-primary)";
  var bgNightHeading = "#060d26";
  var hlNightHeading = "#55a7de";

  $("body").css({
    backgroundImage: bgNightColor,
    backgroundColor: nightPrimary,
  });

  $("header").css({
    backgroundColor: bgNightHeading,
  });

  $("h1").css({
    color: "white",
  });

  $(".today-date").css({
    color: "white",
  });

  $(".container").css({
    backgroundColor: bgNightHeading,
  });

  $(".saved-city").css({
    color: hlNightHeading,
  });

  $(".weather-search").css({
    borderColor: hlNightHeading,
    color: hlNightHeading,
  });
};

removeNightTheme = () => {
  // Reset the styles of the elements to their default values
  $("body").css({
    backgroundImage: "",
    backgroundColor: "",
  });

  $("header").css({
    backgroundColor: "",
  });

  $("h1").css({
    color: "",
  });

  $(".today-date").css({
    color: "",
  });

  $(".container").css({
    backgroundColor: "",
  });
  $(".saved-city").css({
    color: "",
  });

  $(".weather-search").css({
    borderColor: "",
    color: "",
  });
};

init = () => {
  // Display weather forecast for current location on page load
  getCurrentLocation();

  // Print the list of previously searched cities on page load
  printCities();

  $("#search-form").on("submit", function (event) {
    event.preventDefault();

    // Get the city name from the search input
    var cityName = $("#search-input").val().trim();

    // Call the getWeatherData function and pass in the city name
    getWeatherData(cityName);

    $("#search-input").val("");
  });

  $("ul").on("click", "a", function (event) {
    event.preventDefault();

    // Get the city name from the text content of the clicked li element
    var cityName = $(this).text();

    $("#search-input").val("");

    // Get the weather data for the city name
    getWeatherData(cityName);
  });

  // Set an interval to update the current day every hour
  setInterval(() => {
    getCurrentDay();
  }, 3600000);

  // Update the current day
  getCurrentDay();
};

// Call the function to initialize the page
init();
