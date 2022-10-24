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

    // Form fields
    const searchForm = {
      location: '',
      lat: 39.5,
      lon: -98.35,
      zoom: 4,
      description: null,
      radius: 2,
      radiusMeters: null,
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

      // Set user coords by geo or search string
      await setLocation();

      // Convert radius from user-specified units to meters
      searchForm.radiusMeters = convert(
        parseFloat(searchForm.radius),
        searchForm.radiusUnit
      ).to('meters');

      // Get matching garages with availability
      await getResults();
      // Set the map with search location and garage pins and radius circle
      await setMap();
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
          memberId: reserveOptions.user.memberId,
          vehicleId: reserveOptions.user.vehicleId,
          garageId: reserveOptions.garage.id,
          reservationTypeId: reserveOptions.type,
          startDateTime: reserveOptions.from.garageLocalDatetime,
          endDateTime: reserveOptions.to.garageLocalDatetime,
        },
      })
        .then(() => {
          // Modal is closed automatically by html
          // Show status alert
          alert('Reservation successful!');
          // Window reloads after successful reservation
          $window.location.reload();
        })
        .catch((err) => alert(err.message));
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
      map = L.map('map').setView(
        [searchForm.lat, searchForm.lon],
        searchForm.zoom
      );
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
    };

    // TODO move to backend - Converts the time specified by the user to the garage's local timezone
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

    // Sets location data from search form
    const setLocation = async () => {
      try {
        if (searchForm.useGeo) {
          // Geolocate
          const location = await getPosition();
          console.log(location);
          searchForm.lat = location.coords.latitude;
          searchForm.lon = location.coords.longitude;
          searchForm.description = 'Your location';
          searchForm.zoom = 12;

          return true;
        } else {
          // Locate from search string
          const res = await fetch(
            location.protocol +
              '//nominatim.openstreetmap.org/search?format=json&q=' +
              searchForm.location
          );
          const json = await res.json();

          searchForm.lat = json[0].lat;
          searchForm.lon = json[0].lon;
          searchForm.description = json[0].display_name;
          searchForm.zoom = 12;

          return true;
        }
      } catch (error) {
        console.error(error);
        return false;
      }
    };

    // Sets isMonthly flag on search to hide certain fields
    const checkType = () => {
      searchForm.isMonthly = searchForm.type == 'monthly';
    };

    // Builds a an object with components of a Luxon datetime for use in backend
    const buildTime = (time) => {
      return {
        year: time.date.getFullYear(),
        month: 1 + time.date.getMonth(),
        day: time.date.getDate(),
        hour: time.hour,
        minute: time.minute,
      };
    };

    // Bring in garage data from backend
    const getResults = async () => {
      // Clear old garages and markers
      garages.length = 0;
      while (garageMarkers.length > 0) {
        // Remove from map and array simultaneously
        garageMarkers.pop().removeFrom(map);
      }

      // Build datetimes
      const startDateTime = buildTime(searchForm.from);
      const endDateTime = buildTime(searchForm.to);

      // Get garage results from backend
      $http({
        method: 'POST',
        url: `/reserve/search/${
          searchForm.isMonthly ? 'guaranteed' : 'single'
        }`,
        data: {
          lat: searchForm.lat,
          lon: searchForm.lon,
          radius: searchForm.radiusMeters,
          reservationTypeId: searchForm.type,
          startDateTime: startDateTime,
          endDateTime: searchForm.isMonthly ? null : endDateTime,
        },
      })
        .then((results) => {
          // Return if status is not OK
          if (results.status != 200) return;

          // Process results
          results.data?.forEach((garage) => {
            // TODO Remove - Generates a random position near the user location. Let's us test geolocate anywhere and get results
            garage.lat =
              parseFloat(searchForm.lat) + (0.5 - Math.random()) * 0.1;
            garage.lon =
              parseFloat(searchForm.lon) + (0.5 - Math.random()) * 0.1;

            // Distance is returned in meters, convert back to user units
            if (searchForm.radiusUnit == 'feet')
              // Measurements in feet shouldn't be precise to the foot
              garage.distance = parseFloat(
                convert(garage.distance, 'meters').to('feet').toPrecision(3)
              );
            else {
              garage.distance = convert(garage.distance, 'meters')
                .to(searchForm.radiusUnit)
                .toFixed(2);
            }

            // Add pin and label to map
            const pin = L.marker([garage.lat, garage.lon]);
            pin.addTo(map).bindPopup(garage.description);
            // Save garage and pin
            garages.push(garage);
            garageMarkers.push(pin);
          });
        })
        .catch((error) => console.error(error));
    };

    // Sets map from user object
    const setMap = () => {
      // Recenter map
      console.log(searchForm.lat, searchForm.lon);
      map.setView([searchForm.lat, searchForm.lon], searchForm.zoom);

      // Clear previous marker and circle
      if (userMarker) userMarker.removeFrom(map);
      if (radiusCircle) radiusCircle.removeFrom(map);

      // Set a marker for the search location
      userMarker = L.marker([searchForm.lat, searchForm.lon]);
      userMarker.addTo(map);
      // Label the marker
      userMarker.bindPopup(searchForm.description).openPopup();

      // Set the search radius circle
      radiusCircle = L.circle([searchForm.lat, searchForm.lon], {
        color: 'black',
        fillColor: '#000',
        fillOpacity: 0.2,
        radius: searchForm.radius,
      });
      radiusCircle.addTo(map);
    };

    // Set the map
    setInitialMap();

    // Return anything needed in the html
    return {
      handleSearch,
      searchForm,
      garages,
      addGarages: getResults,
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
