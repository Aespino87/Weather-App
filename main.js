const owApiKey = "12a98ba1cc4edfe7faf813a716888b78";

$(document).ready(async function() {

    // Bind submit city click.
    $("#submitCity").click(async function() {
        cityName = $("#cityNameInput").val();
        try {
            let wxCurrentData = await getCurrentWeatherByCity(cityName);
            let uvCurrentData = await getCurrentUv(wxCurrentData.coord.lat, wxCurrentData.coord.lon);
            let wxForecastData = await getForecastByCity(cityName);
            let uvForecastData = await getUvForecast(wxCurrentData.coord.lat, wxCurrentData.coord.lon);
            renderCurrentWeather(wxCurrentData, uvCurrentData);
            renderForecast(wxForecastData, uvForecastData)

            renderSearchHistory();
        } catch(error) {
            console.log(error);
        }
    });

    let initialCity = localStorage.getItem("lastSearchedCity");
    let wxCurrentData;
    let uvCurrentData;
    let wxForecastData;
    let uvForecastData;

    try {

        if(initialCity != undefined) {

            wxCurrentData = await getCurrentWeatherByCity(initialCity);
            wxForecastData = await getForecastByCity(initialCity);
        
        } else {

            // Try to get local coordinates
            if (navigator.geolocation) {

                let position = await getCurrentLocation();

                if (position != undefined) {

                    console.log("Latitude/Longitude: " + position.coords.latitude + "/" + position.coords.longitude);
                    wxCurrentData = await getCurrentWeatherByCoords(position.coords.latitude, position.coords.longitude);
                    wxForecastData = await getForecastByCoords(position.coords.latitude, position.coords.longitude);

                } else {

                    wxCurrentData = await getCurrentWeatherByCity("Chicago");
                    wxForecastData = await getForecastByCity("Chicago");

                }

            } else {

                wxCurrentData = await getCurrentWeatherByCity("Chicago");
                wxForecastData = await getForecastByCity("Chicago");

            }
        }

        uvCurrentData = await getCurrentUv(wxCurrentData.coord.lat, wxCurrentData.coord.lon);
        uvForecastData =  await getUvForecast(wxCurrentData.coord.lat, wxCurrentData.coord.lon);

        renderCurrentWeather(wxCurrentData, uvCurrentData);
        renderForecast(wxForecastData, uvForecastData)

        renderSearchHistory();
    } catch(error) {
        console.log(error);
    }
});

// Fetches the current weather.
function getCurrentWeatherByCity (cityName) {

    // Build API URL
    let owApiUrl = "https://api.openweathermap.org/data/2.5/weather?q=";
    owApiUrl += encodeURI(cityName);
    owApiUrl += "&units=imperial&appid=";
    owApiUrl += owApiKey;

    return new Promise(function(resolve, reject) {

        $.ajax({
            url: owApiUrl,
            success: function (wxData) {
                console.log(wxData);

                // Add this city to the search history and flag it as being the last one searched.
                addToSearchHistory(wxData.name);
                localStorage.setItem("lastSearchedCity", wxData.name);
                resolve(wxData);
            },  
            error: function (error) {  
                reject(error);
            }  
        });
    });

}

// Fetches the current weather by coordinates.
function getCurrentWeatherByCoords (lat, lon) {

    // Build API URL
    let owApiUrl = "https://api.openweathermap.org/data/2.5/weather?lat=";
    owApiUrl += lat;
    owApiUrl += "&lon=";
    owApiUrl += lon;
    owApiUrl += "&units=imperial&appid=";
    owApiUrl += owApiKey;

    return new Promise(function(resolve, reject) {

        $.ajax({
            url: owApiUrl,
            success: function (wxData) {
                console.log(wxData);

                // Add this city to the search history and flag it as being the last one searched.
                addToSearchHistory(wxData.name);
                localStorage.setItem("lastSearchedCity", wxData.name);
                resolve(wxData);
            },  
            error: function (error) {  
                reject(error);
            }  
        });
    });

}

function getCurrentUv (lat, lon) {

    let owUvApiUrl = "https://api.openweathermap.org/data/2.5/uvi?appid=";
            owUvApiUrl += owApiKey;
            owUvApiUrl += "&lat=";
            owUvApiUrl += lat;
            owUvApiUrl += "&lon=";
            owUvApiUrl += lon;

    return new Promise(function(resolve, reject) {

        $.ajax({
            url: owUvApiUrl,
            success: function (uvData) {
                console.log(uvData);
                resolve(uvData);
            },
            error: function (error) {  
                reject(error);
            }  
        });

    });
}

// Fetches the forecast by city
function getForecastByCity (cityName) {

    // Build API URL
    let owApiUrl = "https://api.openweathermap.org/data/2.5/forecast?q=";
    owApiUrl += encodeURI(cityName);
    owApiUrl += "&units=imperial&appid=";
    owApiUrl += owApiKey;

    return new Promise(function (resolve, reject) {

        $.ajax({
            url: owApiUrl,
            success: function (wxForecastData) {

                console.log(wxForecastData);
                resolve(wxForecastData);

            },  
            error: function (error) {  
                reject(error);
            }  
        });

    });
}

// Fetches the forecast by coordinates
function getForecastByCoords (lat, lon) {

    // Build API URL
    let owApiUrl = "https://api.openweathermap.org/data/2.5/forecast?lat=";
    owApiUrl += lat;
    owApiUrl += "&lon=";
    owApiUrl += lon;
    owApiUrl += "&units=imperial&appid=";
    owApiUrl += owApiKey;

    return new Promise(function (resolve, reject) {

        $.ajax({
            url: owApiUrl,
            success: function (wxForecastData) {

                console.log(wxForecastData);
                resolve(wxForecastData);

            },  
            error: function (error) {  
                reject(error);
            }  
        });

    });
}

function getUvForecast (lat, lon) {

    let owUvApiUrl = "https://api.openweathermap.org/data/2.5/uvi/forecast?appid=";
    owUvApiUrl += owApiKey;
    owUvApiUrl += "&lat=";
    owUvApiUrl += lat;
    owUvApiUrl += "&lon=";
    owUvApiUrl += lon;

    return new Promise(function (resolve, reject) {

        $.ajax({
            url: owUvApiUrl,
            success: function (uvForecastData) {
                console.log(uvForecastData);
                resolve(uvForecastData);
            },
            error: function (error) {  
                console.log(error);
                reject(error);
            }  
        });
    });

}

// Renders the search history
function renderSearchHistory () {

    let searchHistoryContainer = $("#searchHistoryContainer");
    searchHistoryContainer.empty();
    let searchHistory = getSearchHistory();

    for (let i=0; i<searchHistory.length; i++) {
        let cityName = searchHistory[i];

        let searchButtonCol = $("<div></div>");
        searchButtonCol.addClass("col-md-6 col-lg-3 my-2");

        let searchButton = $("<button></button>")
        searchButton.addClass("btn btn-secondary btn-block");
        searchButton.html("<i class='fas fa-city'></i> " + cityName);

        searchButton.click(async function () {
            try {
                let wxCurrentData = await getCurrentWeatherByCity(cityName);
                let uvCurrentData = await getCurrentUv(wxCurrentData.coord.lat, wxCurrentData.coord.lon);
                let wxForecastData = await getForecastByCity(cityName);
                let uvForecastData = await getUvForecast(wxCurrentData.coord.lat, wxCurrentData.coord.lon);
                renderCurrentWeather(wxCurrentData, uvCurrentData);
                renderForecast(wxForecastData, uvForecastData)
    
                renderSearchHistory();
            } catch(error) {
                console.log(error);
            }
        });

        searchButtonCol.append(searchButton);
        searchHistoryContainer.append(searchButtonCol);
    }

}

// Renders the current weather to output.
function renderCurrentWeather (wxCurrentData, uvCurrentData) {

    let currentDate = moment.unix(wxCurrentData.dt);

    $("#currentCity").html(wxCurrentData.name);
    $("#currentIcon").html("<img src='http://openweathermap.org/img/wn/" + wxCurrentData.weather[0].icon + "@2x.png'/>");
    $("#currentTemperature").html(wxCurrentData.main.temp);
    $("#currentHumidity").html(wxCurrentData.main.humidity);
    $("#currentWindSpeed").html(wxCurrentData.wind.speed);
    $("#currentUvIndex").html(uvCurrentData.value);
    $("#currentLastUpdatedDt").html(currentDate.format("dddd, MMMM Do, YYYY h:mm A"));

}

function renderForecast (wxForecastData, uvForecastData) {

    $("#forecastCity").html(wxForecastData.city.name);

    for (let i=0; i<5; i++) {

        // Get forecast for specific day.
        let dayNumber = i + 1;
        let forecastItem = getNoonForecast(wxForecastData, dayNumber);
        let forecastDate = moment.unix(forecastItem.dt);
        let uvItem = uvForecastData[i];

        $("#forecastDt"+dayNumber).html(forecastDate.format("dddd, MMMM Do, YYYY"));
        $("#forecastIcon"+dayNumber).html("<img src='http://openweathermap.org/img/wn/" + forecastItem.weather[0].icon + "@2x.png'/>");
        $("#forecastTemperature"+dayNumber).html(forecastItem.main.temp);
        $("#forecastHumidity"+dayNumber).html(forecastItem.main.humidity);
        $("#forecastUvIndex"+dayNumber).html(uvItem.value);

    }

}

// Gets the search history
function getSearchHistory () {

    let searchHistoryJson = localStorage.getItem("searchHistory");
    if (searchHistoryJson != undefined) {
        return JSON.parse(searchHistoryJson);
    } else {
        return [];
    }

}

// Sets the search history
function setSearchHistory (searchHistory) {

    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));

}

// Adds an item to the search history (if it is not already there)
function addToSearchHistory (cityName) {

    let searchHistory = getSearchHistory();

    if(!searchHistory.includes(cityName)) {
        searchHistory.push(cityName);
        setSearchHistory(searchHistory);
    }

}

// Get the current location
// Returns undefined if location is blocked
async function getCurrentLocation () {
    return new Promise(function (resolve, reject) {
        navigator.geolocation.getCurrentPosition(function (position) {
            console.log("Latitude/Longitude: " + position.coords.latitude + "/" + position.coords.longitude);
            resolve(position);
        },
        function () {
            console.log("Unable to retrieve your location.");
            resolve(undefined);
        });
    });
}

// Get the noon forecast for a given day in the future
function getNoonForecast (wxForecastData, daysInFuture) {

    // Create target date
    let targetDate = moment();             // Today's date/time
    targetDate.set({                       // Set to 12 noon
        "hour": 12,
        "minute": 0,
        "second": 0,
        "millisecond": 0
    });
    targetDate.add(daysInFuture, 'days');  // Set to the date in the future

    // Loop through the data and find the matching date
    for (let i=0; i<wxForecastData.list.length; i++) {
        let forecastDate = moment.unix(wxForecastData.list[i].dt);
        if (forecastDate.isSame(targetDate)) {
            return wxForecastData.list[i];
        }
    }

    // If we get here, it is because noon for 5 days out hasn't been set yet.
    // So, just return the last item in the list.
    return wxForecastData.list[wxForecastData.list.length-1];

}
