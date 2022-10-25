// LIBRARIES
const luxon = require('luxon');
// MODELS
const connectDB = require('../config/dbConn');
const sequelize = connectDB();
const { Reservation, ReservationStatus, ReservationType, Vehicle, Users } =
  sequelize.models;

// Get the timezone for the search position
const timezone = async (lat, lon) => {
  try {
    const res = await fetch(
      `http://api.timezonedb.com/v2.1/get-time-zone?key=${process.env.TIMEZONE_API}&format=json&by=position&lat=${lat}&lng=${lon}`
    );
    const json = await res.json();
    return json.zoneName;
  } catch (error) {
    console.error(error);
    return;
  }
};

// Sets the time in the given timezone
const timeFromLocal = (timeObj, tz) => {
  try {
    const localTime = luxon.DateTime.fromObject(timeObj, { zone: tz });
    return localTime.toJSDate();
  } catch (error) {
    console.error(error);
    return;
  }
};

// SINGLE RESERVATIONS

/**
 * Search for available spaces - single reservation
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
 *  - startDateTime < endDateTime
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
      garageId: 101,
      description: 'ParkingSpaceX',
      lat: 0,
      lon: 0,
      timezone: 'America/New_York',
      price: 16.75,
      rate: 'hour',
      distance: 500,
    },
    {
      garageId: 102,
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
 * Reserve a single space
 * POST request
 *
 * @async
 * @param {Number} memberId - ID number of the member the reservation is for
 * @param {Number} reservationTypeId - The type of reservation
 * @param {Number} vehicleId - The vehicle the reservation is for
 * @param {Number} garageId - The garage the reservation is for
 * @param {Date} startDateTime - When the reservation starts
 * @param {Date} endDateTime - When the reservation ends
 * @param {Number} reservationStatusId - The status of the reservation
 * @returns {Object} - reservation details
 *
 * Preconditions:
 *  - garageId is not null
 *  - startDateTime < endDateTime
 *  - startDateTime >= current datetime
 *  - memberId is not null
 * Postconditions:
 *  - A reservation is created in the system matching the given characteristics
 */
const reserveSpace = async (req, res) => {
  // Get arguments from POST request body
  const memberId = req?.body?.memberId;
  const reservationTypeId = req?.body?.reservationTypeId;
  const vehicleId = req?.body?.vehicleId;
  const garageId = req?.body?.garageId;
  const startDateTime = req?.body?.startDateTime;
  const endDateTime = req?.body?.endDateTime;
  const reservationStatusId = req?.body?.reservationStatusId;

  // Return early if any arguments missing (vehicles optional)
  if (
    !(memberId && reservationTypeId && garageId && startDateTime && endDateTime)
  ) {
    return res.status(400).json({ message: 'Incomplete request.' });
  }

  // Check preconditions
  if (startDateTime >= endDateTime || startDateTime < Date.now()) {
    return res.status(400).json({ message: 'Invalid date or time.' });
  }

  // Create the reservation in the DB
  try {
    // Check that all FK values are valid in the database
    let user, resType, vehicle, status;
    user = await Users.findByPk(memberId, { attributes: ['USERNAME'] });
    resType = await ReservationType.findByPk(reservationTypeId, {
      attributes: ['RESERVATION_TYPE_ID'],
    });

    if (vehicleId)
      vehicle = await Vehicle.findByPk(vehicleId, {
        attributes: ['VEHICLE_ID'],
      });
    else vehicle = 'none';

    if (reservationStatusId)
      status = await ReservationStatus.findByPk(reservationStatusId, {
        attributes: ['STATUS_ID'],
      });
    else status = 'none';

    // TODO add garage controller and check validity

    if (!(user && resType && vehicle && status)) {
      return res.status(400).json({ message: 'Invalid ID(s) provided.' });
    }

    // Create the reservation
    // TODO make sure reservations are in the time zone of the garage
    // TODO set default status
    // TODO should availability be confirmed before reservation? If so, add here.
    const reservation = await Reservation.create({
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
    // Some request failed
    console.error('Reservation Controller: reserveSpace failed');
    console.log(error);
    return res.status(500);
  }
};

// PERMANENT/GUARANTEED RESERVATIONS

/**
 * Reserve a permanent space
 * POST request
 * 
 @async
 * @param {Number} memberId - ID number of the member the reservation is for
 * @param {Number} reservationTypeId - The type of reservation
 * @param {Number} vehicleId - The vehicle the reservation is for
 * @param {Number} garageId - The garage the reservation is for
 * @param {Date} startDateTime - When the reservation starts
 * @param {Number} reservationStatusId - The status of the reservation
 * @returns {Object} - reservation details
 *
 * Preconditions:
 *  - garageId is not null
 *  - startDate >= current date
 *  - memberId is not null
 *  - memberId, reservationTypeId, vehicleId, and reservationTypeId are all valid keys in their respective tables
 * Postconditions:
 *  - A reservation is created in the system matching the given characteristics
 */

const reserveGuaranteedSpace = async (req, res) => {
  // Get arguments from POST request body
  const memberId = req?.body?.memberId;
  const reservationTypeId = req?.body?.reservationTypeId;
  const vehicleId = req?.body?.vehicleId;
  const garageId = req?.body?.garageId;
  const startDateTime = req?.body?.startDateTime;
  const reservationStatusId = req?.body?.reservationStatusId;

  // Return early if any arguments missing (vehicles optional)
  if (!(memberId && reservationTypeId && garageId && startDateTime)) {
    return res.status(400).json({ message: 'Incomplete request.' });
  }

  // Check preconditions
  if (startDateTime < Date.now()) {
    return res.status(400).json({ message: 'Invalid date or time.' });
  }

  // Create the reservation in the DB
  try {
    // Check that all FK values are valid in the database
    // Check that all FK values are valid in the database
    let user, resType, vehicle, status;
    user = await Users.findByPk(memberId, { attributes: ['USERNAME'] });
    resType = await ReservationType.findByPk(reservationTypeId, {
      attributes: ['RESERVATION_TYPE_ID'],
    });

    if (vehicleId)
      vehicle = await Vehicle.findByPk(vehicleId, {
        attributes: ['VEHICLE_ID'],
      });
    else vehicle = 'none';

    if (reservationStatusId)
      status = await ReservationStatus.findByPk(reservationStatusId, {
        attributes: ['STATUS_ID'],
      });
    else status = 'none';

    // TODO add garage controller and check validity

    if (!(user && resType && vehicle && status)) {
      return res.status(400).json({ message: 'Invalid ID(s) provided.' });
    }

    // Create the reservation
    // TODO make sure reservations are in the time zone of the garage
    // TODO set default status
    // TODO should availability be confirmed before reservation? If so, add here.
    const reservation = await Reservation.create({
      START_TIME: startDateTime,
      MEMBER_ID: memberId,
      RESERVATION_TYPE_ID: reservationTypeId,
      VEHICLE_ID: vehicleId,
      STATUS_ID: reservationStatusId,
    });

    // Return the reservation details after successful creation
    return res.status(200).json(reservation);
  } catch (error) {
    // Some request failed
    console.error('Reservation Controller: reserveGuaranteedSpace failed');
    return res.status(500);
  }
};

// Export functions
module.exports = {
  searchSpace,
  reserveSpace,
  reserveGuaranteedSpace,
};
