// LIBRARIES
const luxon = require('luxon');
// MODELS
const connectDB = require('../config/dbConn');
const sequelize = connectDB();
const { Reservation, ReservationStatus, ReservationType, Vehicle, Users } =
  sequelize.models;

// Timezone API is rate-limited to 1 request per second.
// Each Timezone API request must happen with a 1-second delay to avoid rate-limiting
function timeout() {
  return new Promise((resolve) => setTimeout(resolve, 1000));
}
// TODO Debounce search and reserve
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
  try {
    const localTime = luxon.DateTime.fromObject(timeObj, { zone: tz });
    return localTime.toJSDate();
  } catch (error) {
    console.error(error);
    return;
  }
};

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
  // Get arguments from url query
  const lat = req?.body?.lat;
  const lon = req?.body?.lon;
  const radius = req?.body?.radius;
  const reservationTypeId = req?.body?.reservationTypeId;
  let startDateTime = req?.body?.startDateTime;
  let endDateTime = req?.body?.endDateTime;
  const isMonthly = req?.body?.isMonthly;

  // Return early if any arguments are missing
  if (
    !req?.body ||
    !(
      lat &&
      lon &&
      radius &&
      reservationTypeId &&
      startDateTime &&
      (endDateTime || isMonthly)
    )
  ) {
    return res.status(400).json({ message: 'Incomplete query.' });
  }

  // Convert times to search position local time
  const tz = await timezone(lat, lon);
  startDateTime = timeFromLocal(startDateTime, tz);
  endDateTime = isMonthly ? null : timeFromLocal(endDateTime, tz);

  // Check preconditions
  if (
    startDateTime < Date.now() ||
    (!isMonthly && startDateTime >= endDateTime)
  ) {
    return res.status(400).json({ message: 'Invalid date or time.' });
  }

  // TODO Find matching available garages
  // TODO pass distance to each
  const fakeGarages = [
    {
      garageId: 1,
      description: 'ParkingSpaceX',
      lat: 0,
      lon: 0,
      timezone: 'America/New_York',
      price: 16.75,
      rate: 'hour',
      distance: 500,
    },
    {
      garageId: 2,
      description: 'GarageBrand',
      lat: 1,
      lon: 1,
      timezone: 'America/New_York',
      price: 12.5,
      rate: '30 min',
      distance: 3000,
    },
  ];

  // TODO Return results
  return res.status(200).json(fakeGarages);
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
  if (
    !req?.body ||
    !(
      memberId &&
      reservationTypeId &&
      garageId &&
      startDateTime &&
      (endDateTime || isMonthly)
    )
  ) {
    return res.status(400).json({ message: 'Incomplete request.' });
  }

  // Convert times to search position local time
  const tz = await timezone(lat, lon);
  startDateTime = timeFromLocal(startDateTime, tz);
  endDateTime = isMonthly ? null : timeFromLocal(endDateTime, tz);

  // Check preconditions
  if (
    startDateTime < Date.now() ||
    (!isMonthly && startDateTime >= endDateTime)
  ) {
    return res.status(400).json({ message: 'Invalid date or time.' });
  }

  // Create the reservation in the DB
  try {
    // Reservation model will throw an error if any FK is invalid, no need to check first

    // TODO make sure reservations are in the time zone of the garage
    // TODO set default status
    if (!reservationStatusId) reservationStatusId = 1;
    // TODO should availability be confirmed before reservation? If so, add here.

    // Create the reservation
    const reservation = await Reservation.create({
      START_TIME: startDateTime,
      END_TIME: endDateTime,
      MEMBER_ID: memberId,
      RESERVATION_TYPE_ID: reservationTypeId,
      VEHICLE_ID: vehicleId,
      STATUS_ID: reservationStatusId,
    });

    // TODO add the reservation to the timetables

    // Return the reservation details after successful creation
    return res.status(200).json(reservation);
  } catch (error) {
    if (error.name == 'SequelizeForeignKeyConstraintError') {
      // Foreign keys invalid
      return res.status(400).json({ message: 'Invalid ID(s) provided.' });
    } else {
      // Some request failed
      console.error(
        'Error: Reservation Controller - reserveSpace() - ' + error.name
      );
      console.error(error);
      return res.status(500).json({ message: 'Reservation failed.' });
    }
  }
};

// PERMANENT/GUARANTEED RESERVATIONS

// Export functions
module.exports = {
  searchSpace,
  reserveSpace,
};
