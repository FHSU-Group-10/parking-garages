// LIBRARIES
const luxon = require('luxon');
const haversine = require('haversine-distance');
const { Op } = require('sequelize');
// MODELS
const connectDB = require('../config/dbConn');
const sequelize = connectDB();
const { Reservation, ReservationStatus, ReservationType, Vehicle, Users, Floor, Garage, Pricing } = sequelize.models;

// -------- API FUNCTIONS --------

/**
 * Search for available spaces - single or monthly
 * POST request
 *
 * @async
 * @param {Number} lat - Latitude of center of search area
 * @param {Number} lon - Longitude of center of search area
 * @param {Number} radius - Search radius in meters
 * @param {Number} reservationTypeId - PK of Reservation Type
 * @param {Object} startDateTime - The desired start time of the reservation
 * @param {Object} endDateTime - The desired end time of the reservation
 * @param {Boolean} isMonthly - Signals if the reservation is guaranteed/monthly
 * @param {*} useFakeLocations - A flag to spoof locations for garages
 * @returns {[Object]}  an array of reservation options
 *
 * Preconditions:
 *  - Set of valid garages known to the system is not empty
 *  - lat, lon, radius, reservationTypeId, and startDateTime are not null
 *  - Either isMonthly is true, or endDateTime is not null
 *  - If isMonthly is true, startDateTime < endDateTime
 *  - startDateTime >= current datetime
 * Postconditions:
 *  - None
 */
const searchSpace = async (req, res) => {
  try {
    // Get arguments from url query
    const lat = req?.body?.lat;
    const lon = req?.body?.lon;
    const radius = req?.body?.radius;
    const reservationTypeId = req?.body?.reservationTypeId;
    let startDateTime = req?.body?.startDateTime;
    let endDateTime = req?.body?.endDateTime;
    const isMonthly = req?.body?.isMonthly;
    const useFakeLocations = req?.body?.useFakeLocations;

    // Return early if any arguments are missing
    if (!req?.body || !(lat && lon && radius && reservationTypeId && startDateTime && (endDateTime || isMonthly))) {
      return res.status(400).json({ message: 'Incomplete query.' });
    }

    // Convert times to search position local time
    const tz = await timezone(lat, lon);
    startDateTime = timeFromLocal(startDateTime, tz);
    endDateTime = isMonthly ? null : timeFromLocal(endDateTime, tz);

    // Check preconditions
    if (startDateTime < Date.now() || (!isMonthly && startDateTime >= endDateTime)) {
      return res.status(400).json({ message: 'Invalid date or time.' });
    }

    // Find matching available garages
    const availableGarages = await findAvailable(
      lat,
      lon,
      radius,
      reservationTypeId,
      startDateTime,
      endDateTime,
      isMonthly,
      useFakeLocations
    );

    // Return results
    if (availableGarages == []) return res.status(204).send();
    else return res.status(200).json(availableGarages);
  } catch (error) {
    console.error('Reservation Controller: ' + error);
    return res.status(500).send();
  }
};

/**
 * Reserve a single or monthly space
 * POST request
 *
 * @async
 * @param {Number} memberId - ID number of the member the reservation is for
 * @param {Number} reservationTypeId - The type of reservation
 * @param {Number} vehicleId - The vehicle the reservation is for
 * @param {Number} garageId - The garage the reservation is for
 * @param {Number} lat - The latitude of the search location, NOT the garage
 * @param {Number} lon - The longitude of the search location, NOT the garage
 * @param {Object} startDateTime - When the reservation starts
 * @param {Object} endDateTime - When the reservation ends
 * @param {Number} reservationStatusId - The status of the reservation, optional
 * @param {Boolean} isMonthly - Whether the reservation is for a monthly/guaranteed space
 * @returns {Object} - reservation details
 *
 * Preconditions:
 *  - memberId, reservationTypeId, vehicleId, garageId, and reservationStatusId are valid keys in the DB
 *  - lat, lon, and startDateTime are not null
 *  - Either isMonthly is true or endDateTime is not null
 *  - startDateTime < endDateTime
 *  - startDateTime >= current datetime
 * Postconditions:
 *  - A reservation is created in the system matching the given characteristics
 */
const reserveSpace = async (req, res) => {
  // Get arguments from POST request body
  const memberId = req?.body?.memberId;
  const reservationTypeId = req?.body?.reservationTypeId;
  const vehicleId = req?.body?.vehicleId;
  const garageId = req?.body?.garageId;
  const lat = req?.body?.lat;
  const lon = req?.body?.lon;
  let startDateTime = req?.body?.startDateTime;
  let endDateTime = req?.body?.endDateTime;
  let reservationStatusId = req?.body?.reservationStatusId;
  const isMonthly = req?.body?.isMonthly;

  // Return early if any arguments missing (vehicles optional)
  if (!req?.body || !(memberId && reservationTypeId && garageId && startDateTime && (endDateTime || isMonthly))) {
    return res.status(400).json({ message: 'Incomplete request.' });
  }

  // Create the reservation in the DB
  try {
    // Convert times to search position local time
    const tz = await timezone(lat, lon);
    startDateTime = timeFromLocal(startDateTime, tz);
    endDateTime = isMonthly ? null : timeFromLocal(endDateTime, tz);

    // Check preconditions
    if (startDateTime < Date.now() || (!isMonthly && startDateTime >= endDateTime)) {
      return res.status(400).json({ message: 'Invalid date or time.' });
    }

    const user = await Users.findByPk(memberId);
    const vehicle = vehicleId
      ? // Vehicle is optional
        await Vehicle.findOne({
          where: {
            // The vehicle must be registered to the user
            VEHICLE_ID: vehicleId,
            MEMBER_ID: memberId,
          },
        })
      : null;

    // Sequelize returns null if no match found
    if (!user || (vehicleId && !vehicle)) {
      //console.log('user: ' + user + ' vehicle: ' + vehicle);
      return res.status(400).json({ message: 'Invalid ID(s) provided.' });
    }

    // Confirm availability before reservation
    const isActive = await Garage.findByPk(garageId);
    const isAvailable = await checkAvailability(garageId, reservationTypeId, startDateTime, endDateTime, !!isMonthly);

    if (!(isActive && isAvailable)) {
      return res.status(400).json({ message: 'Garage unavailable.' });
    }

    // Set default status
    if (!reservationStatusId) reservationStatusId = 1;

    // Create the reservation
    const reservation = await Reservation.create({
      GARAGE_ID: garageId,
      START_TIME: startDateTime,
      END_TIME: endDateTime,
      MEMBER_ID: memberId,
      RESERVATION_TYPE_ID: reservationTypeId,
      VEHICLE_ID: vehicleId,
      STATUS_ID: reservationStatusId,
    });

    // Return the reservation details after successful creation
    return res.status(200).json(reservation);
  } catch (error) {
    if (error.name == 'SequelizeForeignKeyConstraintError') {
      // Foreign keys invalid
      return res.status(400).json({ message: 'Invalid ID(s) provided.' });
    } else {
      // Some request failed
      console.error('Error: Reservation Controller - reserveSpace() - ' + error.name);
      console.error(error);
      return res.status(500).json({ message: 'Reservation failed.' });
    }
  }
};

// -------- HELPER FUNCTIONS --------

//
/**
 * Find available parking garages for a given location, radius, time slot, and reservation type.
 * Can spoof garage locations to be near search location.
 *
 * @param {*} lat - The search position latitude
 * @param {*} lon - The search position longitude
 * @param {*} radius - The search radius in meters
 * @param {*} resTypeId - The reservation type
 * @param {Date} start - The desired start datetime of the reservation
 * @param {Date} end - The desired end datetime of the reservation
 * @param {*} isMonthly - A flag signifying a reservation is for a monthly/guaranteed space
 * @param {*} useFakeLocations - A flag to spoof locations for garages
 * @returns {[Object]} - An array of garages that match the requested availability
 */
const findAvailable = async (lat, lon, radius, resTypeId, start, end, isMonthly, useFakeLocations) => {
  try {
    // Get all active garages from DB
    let garages = await Garage.findAll({ where: { IS_ACTIVE: true } });

    // Prepare location objects for distance calcs
    const searchLoc = { latitude: lat, longitude: lon };
    let garageLoc, newGarage, price;

    // Prices are the same for all garages
    price = await calculatePrice(start, end, resTypeId);

    // Filter garages based on search radius
    garages = garages
      .map((garage) => {
        garage = garage.dataValues;
        if (useFakeLocations) {
          // Generate fake garage locations near the search point. NOT guaranteed to be within the search radius
          garageLoc = {
            latitude: parseFloat(lat) + (0.5 - Math.random()) * 0.05,
            longitude: parseFloat(lon) + (0.5 - Math.random()) * 0.05,
          };
          /* console.log(
            `Spoofed garage loc from [${garage.LAT}, ${garage.LONG}] to [${garageLoc.latitude}, ${garageLoc.longitude}]`
          ); */
        } else {
          // Use real garage locations
          garageLoc = { latitude: garage.LAT, longitude: garage.LONG };
        }

        // Calculate the distance between the search location and garage
        const dist = haversine(searchLoc, garageLoc);

        newGarage = {
          garageId: garage.GARAGE_ID,
          description: garage.DESCRIPTION,
          lat: garageLoc.latitude,
          lon: garageLoc.longitude,
          distance: dist,
          price: price,
          overbookRate: garage.OVERBOOK_RATE,
        };

        return newGarage;
      })
      .filter((garage) => garage.distance <= radius);

    // Use checkAvailability on each garage to find if it is available
    garages = await Promise.all(
      garages.map(async (garage) => {
        const isAvailable = await checkAvailability(
          garage.garageId,
          resTypeId,
          start,
          end,
          isMonthly,
          garage.overbookRate
        );
        if (isAvailable) return { ...garage, overbookRate: null };
        else return null;
      })
    );
    // Filter out unavailable garages
    garages = garages.filter((garage) => garage);

    // NOTE: Combining the two above map-and-filter calls broke the map last time it was tried

    return garages;
  } catch (error) {
    console.error(error);
    return [];
  }
};

/**
 * Calculates the projected total price of a reservation
 *
 * @param {*} start - The start datetime
 * @param {*} end - The end datetime
 * @param {*} reservationType - The reservation type
 * @returns {String} - The total reservation price to two decimal places
 */
const calculatePrice = async (start, end, reservationType) => {
  // Retrieve the rate for the given reservation type
  const rate = await Pricing.findOne({
    attributes: ['COST', 'DAILY_MAX'],
    where: { RESERVATION_TYPE_ID: reservationType },
  });

  // Monthly reservations calculated differently
  let priceStr;

  if (reservationType == 2) {
    // Monthly
    priceStr = `${rate.getDataValue('COST')} / month`;
  } else {
    // Single or walk-in

    // DailyMax treated as per 24-hour period, not per calendar day
    const milliInDay = 86400000; // 24 hours to milliseconds
    const milliIn30Min = 1800000; // 30 minutes in milliseconds
    let resLength = end - start; // Reservation length in milliseconds
    // Calculate # of 24-hour periods
    const days = Math.floor(resLength / milliInDay);
    resLength = resLength % milliInDay;

    // Calculate number of half-hour billable periods for desired time period
    const periods = Math.ceil(resLength / milliIn30Min);

    // Calculate the total price
    const price = parseFloat(rate.getDataValue('COST')) * periods + parseFloat(rate.getDataValue('DAILY_MAX')) * days;
    // Convert to a string with two decimal places
    priceStr = price.toFixed(2);
  }
  return priceStr;
};

/**
 * Check the availability of a single garage given its ID, time, and reservation type
 * Naive solution. Does not optimize for compressing partial overlaps, meaning two halves count as 2 spaces, not compressed to one occupancy
 *
 * @param {*} garageId - The id of the garage to check
 * @param {*} resTypeId - The reservation type
 * @param {*} start - The desired start datetime of the reservation
 * @param {*} end - The desired endtime of the reservation
 * @param {*} isMonthly - A flag signifying a reservation is for a monthly/guaranteed space
 * @returns {Boolean} - A flag signifying a garage is available with the requested availability
 */
const checkAvailability = async (garageId, start, end = null, isMonthly = false, overbookRate = null) => {
  // Retrieve overbookRate if it was not passed in
  if (!overbookRate) {
    const result = await Garage.findOne({
      attributes: ['OVERBOOK_RATE'],
      where: {
        GARAGE_ID: garageId,
      },
    });

    overbookRate = result.getDataValue('OVERBOOK_RATE');
  }
  // NOTE does not account for walk-in floors/spaces.

  // Get total number of spaces for this garage
  let totalSpaces = 0;
  const floors = await Floor.findAll({
    attributes: ['SPACE_COUNT'],
    where: {
      GARAGE_ID: garageId,
    },
  });
  floors.forEach((floor) => {
    totalSpaces += floor.getDataValue('SPACE_COUNT');
  });

  // Calculate total with overbook rate
  totalSpaces *= overbookRate;

  // Count all reservations that overlap this one, monthly or otherwise
  let reserved;

  if (!isMonthly) {
    // This is making a Single or Walk-In reservation
    reserved = await Reservation.count({
      where: {
        // resStart < end &&  (resEnd == null || resEnd > start) Selects all that overlap inside the res window
        [Op.and]: [
          {
            GARAGE_ID: garageId,
          },
          {
            START_TIME: {
              [Op.lt]: end,
            },
          },
          {
            END_TIME: {
              [Op.or]: [{ [Op.is]: null }, { [Op.gt]: start }],
            },
          },
        ],
      },
    });
  } else {
    // This is making a Monthly reservation
    reserved = await Reservation.count({
      where: {
        // (resEnd == null || resEnd > resStart) Selects all that overlap inside the res window
        [Op.and]: [
          {
            GARAGE_ID: garageId,
          },
          {
            END_TIME: {
              [Op.or]: [{ [Op.is]: null }, { [Op.gt]: start }],
            },
          },
        ],
      },
    });
  }

  // console.log(`Garage ${garageId}: Total: ${totalSpaces}, Reserved: ${reserved}`);

  // Subtract found from total
  totalSpaces -= reserved;

  // If totalSpaces is greater than 0, there are spaces available
  return totalSpaces > 0;
};

// -------- TIME FUNCTIONS --------

// Timezone API is rate-limited to 1 request per second.
// Each Timezone API request must happen with a 1-second delay to avoid rate-limiting
function timeout() {
  return new Promise((resolve) => setTimeout(resolve, 1000));
}

/**  Get the timezone for the search position
 * NOTE - Timezone API is rate-limited to 1 request/second
 *
 * @param {Number} lat - The latitude of the search location
 * @param {Number} lon - The longitude of the search location
 * @returns {String} - A timezone string, ex: "America/New_York"
 */
const timezone = async (lat, lon) => {
  try {
    await timeout();
    const res = await fetch(
      `http://api.timezonedb.com/v2.1/get-time-zone?key=${process.env.TIMEZONE_API}&format=json&by=position&lat=${lat}&lng=${lon}`
    );
    const json = await res.json();
    return json.zoneName;
  } catch (error) {
    console.error('Reservation Controller - Too many requests for timezone');
    return;
  }
};

/** Sets the time in the given timezone
 *
 * @param {Object} timeObj - An object with year, month, day, hour, and minute numeric fields representing a time
 * @param {String} tz - A timezone string, ex: "America/New_York"
 * @returns {Date} - A JS Date object representing the specified time set in the specified timezone
 */
const timeFromLocal = (timeObj, tz) => {
  const localTime = luxon.DateTime.fromObject(timeObj, { zone: tz }).toJSDate();
  if (!localTime || !isNaN(localTime)) return localTime;
  else return null;
};

// Export functions
module.exports = {
  searchSpace,
  reserveSpace,
  findAvailable,
  checkAvailability,
  timezone,
  timeFromLocal,
};
