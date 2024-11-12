// Test URLs using environment variable
const testSearchUrl = `https://www.mapquestapi.com/search/v4/place?location=-74.95590458465354%2C40.26624146333869&sort=relevance&feedback=false&key=${MAPQUEST_API_KEY}&pageSize=5&q=parks`;
const testLocationUrl = `https://www.mapquestapi.com/geocoding/v1/address?key=${MAPQUEST_API_KEY}&location=philadelphia,pa`;

// DOM elements
const testInput = document.querySelector('#input-field');
const searchButton = document.querySelector('#search-button');
const parksDisplay = document.querySelector('.parkresults');
const weatherDisplay = document.querySelector('.weather-card');

// Get coordinates based on city, state or zip
function getLocation(){
  // Reset parks display
  parksDisplay.innerHTML = "";
  
  const testLocation = testInput.value.replace(/\s+/g, '');
  fetch(`https://www.mapquestapi.com/geocoding/v1/address?key=${MAPQUEST_API_KEY}&maxResults=1&location=${testLocation}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if(data.results[0].locations.length !== 1){
        alert('enter a city name');
        location.reload();
      }
      const userLon = data.results[0].locations[0].latLng.lng;
      const userLat = data.results[0].locations[0].latLng.lat;
      
      getParks(userLon, userLat);
      getWeather(userLon, userLat);
    })
    .catch(error => {
      console.error('Error:', error);
      alert('There was a problem getting the location. Please try again.');
    });
}

function getWeather(lon, lat) {
  weatherDisplay.innerHTML = "";
  fetch(`https://api.weatherbit.io/v2.0/current?&lat=${lat}&lon=${lon}&units=I&key=b5c97ec4269348f59f7363c259205e69`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      const weatherElements = [
        { label: 'Temperature', value: `${parseInt(data.data[0].temp)}°F` },
        { label: 'Wind', value: `${parseInt(data.data[0].wind_spd)}MPH` },
        { label: 'Humidity', value: `${parseInt(data.data[0].rh)}%` },
        { label: 'UV', value: parseInt(data.data[0].uv) },
        { label: 'Precipitation', value: parseInt(data.data[0].precip) }
      ];

      weatherElements.forEach(element => {
        const p = document.createElement('p');
        p.textContent = `${element.label}: ${element.value}`;
        weatherDisplay.appendChild(p);
      });

      const curImg = document.createElement('img');
      curImg.src = `https://www.weatherbit.io/static/img/icons/${data.data[0].weather.icon}.png`;
      weatherDisplay.appendChild(curImg);
    })
    .catch(error => {
      console.error('Error:', error);
      alert('There was a problem getting the weather data. Please try again.');
    });
}


  function getParks(lon, lat) {
    fetch(`https://www.mapquestapi.com/search/v4/place?location=${lon}%2C${lat}&sort=relevance&feedback=false&key=${MAPQUEST_API_KEY}&pageSize=5&q=parks`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log(data);
        parksDisplay.innerHTML = ''; 
        
        data.results.forEach(result => {
          const parkCard = document.createElement('div');
          parkCard.className = 'card my-3';
          
          const parkContent = document.createElement('div');
          parkContent.className = 'card-content';
          
          const parkName = document.createElement('p');
          parkName.className = 'title is-4';
          parkName.textContent = result.name;
          
          const mapImage = document.createElement('img');
          const parkLat = result.place.geometry.coordinates[1];
          const parkLon = result.place.geometry.coordinates[0];
          mapImage.src = `https://www.mapquestapi.com/staticmap/v5/map?key=${MAPQUEST_API_KEY}&center=${parkLat},${parkLon}&size=400,200&zoom=14&locations=${parkLat},${parkLon}|marker-sm-1`;
          mapImage.alt = `Map of ${result.name}`;
          mapImage.className = 'mb-3';
          
          parkContent.appendChild(parkName);
          parkContent.appendChild(mapImage);
          
          if (result.place.properties.street) {
            const parkAddress = document.createElement('p');
            parkAddress.className = 'subtitle is-6';
            parkAddress.textContent = `${result.place.properties.street}, ${result.place.properties.city}, ${result.place.properties.stateCode}`;
            parkContent.appendChild(parkAddress);
          }
          
          parkCard.appendChild(parkContent);
          parksDisplay.appendChild(parkCard);
        });
      })
      .catch(error => {
        console.error('Error:', error);
        alert('There was a problem getting the parks data. Please try again.');
      });
  }

searchButton.addEventListener('click', getLocation);