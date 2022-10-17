(function (window) {
  function pageCtrl($scope, $http, $document, $window) {
    // Conversion Library
    const convert = $window.convert;

    // DATA
    let map, userMarker, radiusCircle;
    let garages = [];
    let garageMarkers = [];

    // Track position and pins
    // Defaults to view of continental USA
    const user = {
      lat: 39.5,
      lon: -98.35,
      zoom: 4,
      description: null,
      radius: 0,
      unit: 'miles',
      useGeo: false,
    };

    // Form fields
    const searchForm = {
      location: '',
      radius: 2,
      radiusUnit: 'miles',
      useGeo: false,
      type: 'single',
      isMonthly: false,
      from: {
        date: null,
        hour: '12',
        minute: '00',
      },
      to: {
        date: null,
        hour: '13',
        minute: '00',
      },
    };

    // Create map, user marker, and array of garage markers
    map = L.map('map').setView([user.lat, user.lon], user.zoom);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Wraps geolocation in a promise
    function getPosition(options) {
      return new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, options));
    }

    // Get coords from user location
    const getGeolocate = async () => {
      try {
        const position = await getPosition();
        return { lat: position.coords.latitude, lon: position.coords.longitude, display_name: 'Your location' };
      } catch (e) {
        console.error(e.message);
      }
    };

    // Get coords from search string
    const getCoords = async (searchString) => {
      const res = await fetch(location.protocol + '//nominatim.openstreetmap.org/search?format=json&q=' + searchString);
      const json = await res.json();
      // Return if nothing was found
      return json[0];
    };

    // Handles search form submission
    const handleSearch = async (e) => {
      e.preventDefault();

      // Get user coords by geo or search string
      let location;
      if (searchForm.useGeo) location = await getGeolocate();
      else location = await getCoords(searchForm.location);

      // TODO return error if no location found
      if (!location) return;

      // Set data in user object
      user.lat = location.lat;
      user.lon = location.lon;
      user.description = location.display_name;
      user.zoom = 12;

      // Convert radius from meters to user-specified units
      user.radiusUnit = searchForm.radiusUnit;
      user.radius = convert(parseFloat(searchForm.radius), user.radiusUnit).to('meters');

      setMap();
      addGarages();
    };

    const checkType = () => {
      searchForm.isMonthly = searchForm.type == 'monthly';
    };

    // TODO bring in real data
    const addGarages = () => {
      // Clear old garages and markers
      garages.length = 0;
      while (garageMarkers.length > 0) {
        // Remove from map and array simultaneously
        garageMarkers.pop().removeFrom(map);
      }

      // Add new garages
      fakeGarages.forEach((garage) => {
        const newGarage = { ...garage };
        newGarage.lat = parseFloat(user.lat) + (0.5 - Math.random()) * 0.1;
        newGarage.lon = parseFloat(user.lon) + (0.5 - Math.random()) * 0.1;

        // Calculate distance from user
        let from = L.latLng(user.lat, user.lon);
        let to = L.latLng(newGarage.lat, newGarage.lon);
        // Measurements in feet shouldn't be precise to the foot
        if (user.radiusUnit == 'feet') newGarage.distance = parseFloat(convert(map.distance(from, to), 'meters').to('feet').toPrecision(3));
        else newGarage.distance = convert(map.distance(from, to), 'meters').to(user.radiusUnit).toFixed(2);

        const pin = L.marker([newGarage.lat, newGarage.lon]);
        pin.addTo(map).bindPopup(newGarage.description);
        garages.push(newGarage);
        garageMarkers.push(pin);
      });
    };

    // Sets map from user object
    const setMap = () => {
      // Recenter map
      map.setView([user.lat, user.lon], user.zoom);

      // Clear previous marker and circle
      if (userMarker) userMarker.removeFrom(map);
      if (radiusCircle) radiusCircle.removeFrom(map);

      // Set a marker
      userMarker = L.marker([user.lat, user.lon]);
      userMarker.addTo(map);
      // Set a label with the placename
      userMarker.bindPopup(user.description).openPopup();
      // Set the search radius circle
      radiusCircle = L.circle([user.lat, user.lon], {
        color: 'black',
        fillColor: '#000',
        fillOpacity: 0.2,
        radius: user.radius,
      });
      radiusCircle.addTo(map);
    };

    // TODO replace with real data
    const fakeGarages = [
      {
        description: 'Garage 1',
        address: 'Main Street',
        lat: 0,
        lon: 0,
        price: 16.75,
        rate: 'hour',
      },
      {
        description: 'Garage 2',
        address: 'Broad Street',
        lat: 1,
        lon: 1,
        price: 12.5,
        rate: '30 min',
      },
      {
        description: 'Garage 3',
        address: 'Wall Street',
        lat: -1,
        lon: 1,
        price: 10,
        rate: 'day',
      },
    ];

    // Return anything needed in the html
    return {
      handleSearch,
      searchForm,
      user,
      fakeGarages,
      garages,
      addGarages,
      checkType,
    };
  }

  var app = angular.module('pageApp', []);
  app.controller('pageCtrl', ['$scope', '$http', '$document', '$window', pageCtrl]);
})(window);
