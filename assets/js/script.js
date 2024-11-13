// DOM elements
const testInput = document.querySelector('#input-field');
const searchButton = document.querySelector('#search-button');
const parksDisplay = document.querySelector('.parkresults');
const weatherDisplay = document.querySelector('.weather-content');

function getLocation() {
  parksDisplay.innerHTML = "";
  const testLocation = testInput.value.trim();
  
  if (!testLocation) {
    alert('Please enter a location');
    return;
  }

  fetch(`https://www.mapquestapi.com/geocoding/v1/address?key=${MAPQUEST_API_KEY}&maxResults=1&location=${testLocation}`)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      if (data.results[0].locations.length !== 1) {
        throw new Error('Invalid location');
      }
      const { lng: userLon, lat: userLat } = data.results[0].locations[0].latLng;
      getParks(userLon, userLat);
      getWeather(userLon, userLat);
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Please enter a valid location');
    });
}

function getWeather(lon, lat) {
  weatherDisplay.innerHTML = '<div class="animate-pulse">Loading weather...</div>';
  
  fetch(`https://api.weatherbit.io/v2.0/current?&lat=${lat}&lon=${lon}&units=I&key=b5c97ec4269348f59f7363c259205e69`)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      const weather = data.data[0];
      weatherDisplay.innerHTML = `
        <div class="flex items-center justify-between">
          <div>
            <p class="font-semibold">${parseInt(weather.temp)}°F</p>
            <p class="text-sm text-gray-600">Wind: ${parseInt(weather.wind_spd)} MPH</p>
            <p class="text-sm text-gray-600">Humidity: ${parseInt(weather.rh)}%</p>
          </div>
          <img 
            src="https://www.weatherbit.io/static/img/icons/${weather.weather.icon}.png"
            alt="Weather icon"
            class="w-16 h-16"
          />
        </div>
      `;
    })
    .catch(error => {
      console.error('Error:', error);
      weatherDisplay.innerHTML = '<p class="text-red-500">Unable to load weather data</p>';
    });
}

function getParks(lon, lat) {
  parksDisplay.innerHTML = '<div class="col-span-full text-center">Searching for parks...</div>';
  
  fetch(`https://www.mapquestapi.com/search/v4/place?location=${lon}%2C${lat}&sort=relevance&feedback=false&key=${MAPQUEST_API_KEY}&pageSize=6&q=parks`)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      parksDisplay.innerHTML = '';
      
      if (data.results.length === 0) {
        parksDisplay.innerHTML = '<div class="col-span-full text-center text-lg">No parks found in this area</div>';
        return;
      }

      data.results.forEach(result => {
        const { coordinates } = result.place.geometry;
        const parkLat = coordinates[1];
        const parkLon = coordinates[0];

        const parkCard = document.createElement('div');
        parkCard.className = 'card p-4';
        parkCard.innerHTML = `
          <h3 class="text-xl font-semibold mb-3">${result.name}</h3>
          <img 
            src="https://www.mapquestapi.com/staticmap/v5/map?key=${MAPQUEST_API_KEY}&center=${parkLat},${parkLon}&size=400,200&zoom=14&locations=${parkLat},${parkLon}|marker-sm-1"
            alt="Map of ${result.name}"
            class="mb-3"
            loading="lazy"
          />
          ${result.place.properties.street ? `
            <p class="text-gray-600">
              ${result.place.properties.street},
              ${result.place.properties.city},
              ${result.place.properties.stateCode}
            </p>
          ` : ''}
        `;
        parksDisplay.appendChild(parkCard);
      });
    })
    .catch(error => {
      console.error('Error:', error);
      parksDisplay.innerHTML = '<div class="col-span-full text-center text-red-500">Error loading parks data</div>';
    });
}

searchButton.addEventListener('click', getLocation);
testInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') getLocation();
});