(function (window) {
  function pageCtrl($scope, $http, $document, $window, $timeout) {
    // LIBRARIES

    // Unit conversion Library
    const convert = $window.convert;
    // Time conversion library
    const DateTime = $window.luxon.DateTime;

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

    // Reservation parameters
    const reserveOptions = {
      user: {
        memberId: null,
        vehicle: null,
      },
      garage: {
        id: null,
        description: null,
        lat: null,
        lon: null,
      },
      from: {
        specifiedDatetime: null,
        garageLocalDatetime: null,
      },
      to: {
        specifiedDatetime: null,
        garageLocalDatetime: null,
      },
      type: null,
      totalPrice: null,
      directionsLink: null,
    };

    // EVENT HANDLERS

    // Handles search form submission
    const handleSearch = async (e) => {
      //e.preventDefault();
      // TODO validate data

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
      user.radius = convert(parseFloat(searchForm.radius), user.radiusUnit).to(
        'meters'
      );

      setMap();
      addGarages();
    };

    // Handle clicking on reserve button in search results
    const handleReserveBtn = (e, index) => {
      const chosenGarage = garages[index] || {};

      reserveOptions.garage.id = chosenGarage.garageId;
      reserveOptions.garage.description = chosenGarage.description;
      reserveOptions.garage.lat = chosenGarage.lat;
      reserveOptions.garage.lon = chosenGarage.lon;
      reserveOptions.directionsLink = `https://www.google.com/maps/dir/?api=1&destination=${chosenGarage.lat},${chosenGarage.lon}`;
      reserveOptions.type = searchForm.type;
      reserveOptions.isMonthly = searchForm.isMonthly;
      reserveOptions.totalPrice = chosenGarage.totalPrice || '$1,000';

      // The rest are only needed if reservation is not monthly/guaranteed
      if (reserveOptions.isMonthly) {
        // Build 'from' date only
        reserveOptions.from.specifiedDatetime = searchForm.from.date;
        reserveOptions.from.specifiedDatetime.setHours(0);

        // Build garage local to and from times
        reserveOptions.from.garageLocalDatetime = toGarageTZ(
          reserveOptions.from.specifiedDatetime,
          chosenGarage.timezone
        );
      } else {
        // Build 'from' date only
        reserveOptions.from.specifiedDatetime = searchForm.from.date;
        reserveOptions.from.specifiedDatetime.setHours(
          parseInt(searchForm.from.hour)
        );
        reserveOptions.from.specifiedDatetime.setMinutes(
          parseInt(searchForm.from.minute)
        );
        // Build 'to' time
        reserveOptions.to.specifiedDatetime = searchForm.to.date;
        reserveOptions.to.specifiedDatetime.setHours(
          parseInt(searchForm.to.hour)
        );
        reserveOptions.to.specifiedDatetime.setMinutes(
          parseInt(searchForm.to.minute)
        );

        // Build garage local to and from times
        reserveOptions.from.garageLocalDatetime = toGarageTZ(
          reserveOptions.from.specifiedDatetime,
          chosenGarage.timezone
        );
        reserveOptions.to.garageLocalDatetime = toGarageTZ(
          reserveOptions.to.specifiedDatetime,
          chosenGarage.timezone
        );
      }
    };

    // Submits the reservation to the backend
    const handleSubmitReservation = async () => {
      $http({
        method: 'POST',
        url: `/reserve/${reserveOptions.isMonthly ? 'guaranteed' : 'single'}`,
        data: {
          // TODO send only needed fields
          ...reserveOptions,
        },
      })
        .then(() => {
          // Modal is closed automatically by html
          // Show status alert
          alert('Reservation successful!');
          // Window reloads after successful reservation
          $window.location.reload();
        })
        .catch((err) => dialog(err.message));
    };

    // FUNCTIONS

    // Checks if all form fields are provided
    const isFormValid = () => {
      const allFields =
        (searchForm.location || searchForm.useGeo) &&
        searchForm.radius &&
        searchForm.radiusUnit &&
        searchForm.type &&
        searchForm.from.date &&
        (searchForm.isMonthly ||
          (searchForm.from.hour &&
            searchForm.from.minute &&
            searchForm.to.date &&
            searchForm.to.hour &&
            searchForm.to.minute));
      return allFields;
    };

    const setInitialMap = () => {
      // Create map, user marker, and array of garage markers
      map = L.map('map').setView([user.lat, user.lon], user.zoom);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
    };

    // Converts the time specified by the user to the garage's local timezone
    // Necessary because user local timezone may be different, and reservations should be set in the garage's zone
    const toGarageTZ = (userDatetime, garageTimezone) => {
      // Break up the user-specified local time
      const datetime = {
        year: userDatetime.getFullYear(),
        month: 1 + userDatetime.getMonth(),
        day: userDatetime.getDate(),
        hour: userDatetime.getHours(),
        minute: userDatetime.getMinutes(),
      };
      // Turn that into the same time, but in the timezone of the garage
      // So that if I reserve a garage at 10pm, that means 10pm at the garage, not 10pm wherever I am
      const garageDatetime = DateTime.fromObject(datetime, {
        zone: garageTimezone,
      });
      // Return as a JS Date object
      console.log(garageDatetime.toJSDate());
      return garageDatetime.toJSDate();
    };

    // Wraps geolocation in a promise
    function getPosition(options) {
      return new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, options)
      );
    }

    // Get coords from user location
    const getGeolocate = async () => {
      try {
        const position = await getPosition();
        return {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          display_name: 'Your location',
        };
      } catch (e) {
        console.error(e.message);
      }
    };

    // Get coords from search string
    const getCoords = async (searchString) => {
      const res = await fetch(
        location.protocol +
          '//nominatim.openstreetmap.org/search?format=json&q=' +
          searchString
      );
      const json = await res.json();

      // Return if nothing was found
      return json[0];
    };

    // Sets isMonthly flag on search to hide certain fields
    const checkType = () => {
      searchForm.isMonthly = searchForm.type == 'monthly';
    };

    // Bring in garage data from backend
    const addGarages = async () => {
      // Clear old garages and markers
      garages.length = 0;
      while (garageMarkers.length > 0) {
        // Remove from map and array simultaneously
        garageMarkers.pop().removeFrom(map);
      }

      // Get garage results from backend
      $http({
        method: 'POST',
        url: `/reserve/search/${
          searchForm.isMonthly ? 'guaranteed' : 'single'
        }`,
        data: {
          name: 'testData',
        },
      })
        .then((results) => {
          // Add new garages
          results?.data?.forEach((garage) => {
            const newGarage = { ...garage };
            // Generate a random position near the user location
            newGarage.lat = parseFloat(user.lat) + (0.5 - Math.random()) * 0.1;
            newGarage.lon = parseFloat(user.lon) + (0.5 - Math.random()) * 0.1;

            // Calculate distance from user
            let from = L.latLng(user.lat, user.lon);
            let to = L.latLng(newGarage.lat, newGarage.lon);
            // Measurements in feet shouldn't be precise to the foot
            if (user.radiusUnit == 'feet')
              newGarage.distance = parseFloat(
                convert(map.distance(from, to), 'meters')
                  .to('feet')
                  .toPrecision(3)
              );
            else
              newGarage.distance = convert(map.distance(from, to), 'meters')
                .to(user.radiusUnit)
                .toFixed(2);

            const pin = L.marker([newGarage.lat, newGarage.lon]);
            pin.addTo(map).bindPopup(newGarage.description);
            garages.push(newGarage);
            garageMarkers.push(pin);
          });
        })
        .catch((err) => console.error(err.message));
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

    // Set the map
    setInitialMap();

    // Return anything needed in the html
    return {
      handleSearch,
      searchForm,
      user,
      garages,
      addGarages,
      checkType,
      handleReserveBtn,
      reserveOptions,
      isFormValid,
      handleSubmitReservation,
    };
  }

  var app = angular.module('pageApp', []);
  app.controller('pageCtrl', [
    '$scope',
    '$http',
    '$document',
    '$window',
    '$timeout',
    pageCtrl,
  ]);
})(window);
