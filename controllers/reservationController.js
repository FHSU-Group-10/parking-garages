// LIBRARIES

// MODELS
const connectDB = require('../config/dbConn');
const sequelize = connectDB();
const { Reservation, ReservationStatus, ReservationType, Vehicle, User } =
  sequelize.models;

// SINGLE RESERVATIONS

/**
 * Search for available spaces - single reservation
 * POST request
 *
 * @async
 
 * @returns {[Object]} - an array of reservation options
 *
 * Preconditions:
 *  - Set of valid garages known to the system is not empty
 *  - startDateTime < endDateTime
 *  - startDateTime >= current datetime
 * Postconditions:
 *  - None
 */
const searchSpace = async (req, res) => {
  // TODO
  /* // Get arguments from request url query
  const location = req.query.location;
  const startDateTime = req.query.startDateTime;
  const endDateTime = req.query.endDateTime;

  // Return early if any arguments are missing
  if (!(location && startDateTime && endDateTime)) {
    return res.status(400).json({ message: "Incomplete query" });
  }

  // Check preconditions
  // TODO check if garages are known

  if (startDateTime >= endDateTime) {
    return res
      .status(400)
      .json({ message: "Start datetime must be earlier than end datetime" });
  }
  // TODO check against current time precondition */
  console.log(req.body.name);
  // TODO Find matching available garages
  const fakeGarages = [
    {
      garageId: 101,
      description: 'ParkingSpaceX',
      lat: 0,
      lon: 0,
      timezone: 'America/New_York',
      price: 16.75,
      rate: 'hour',
    },
    {
      garageId: 102,
      description: 'GarageBrand',
      lat: 1,
      lon: 1,
      timezone: 'America/New_York',
      price: 12.5,
      rate: '30 min',
    },
    {
      garageId: 103,
      description: 'AllsPark',
      lat: -1,
      lon: 1,
      timezone: 'America/New_York',
      price: 10,
      rate: 'day',
    },
    {
      garageId: 104,
      description: 'SeeSpotPark',
      lat: -1,
      lon: 1,
      timezone: 'America/New_York',
      price: 10,
      rate: 'day',
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
  if (startDateTime < endDateTime || startDateTime < Date.now()) {
    return res.status(400).json({ message: 'Invalid date or time.' });
  }

  // Create the reservation in the DB
  try {
    // Check that all FK values are valid in the database
    const user = User.findByPK(memberId, { attributes: ['USERNAME'] });
    const resType = ReservationType.findByPK(reservationTypeId, {
      attributes: ['RESERVATION_TYPE_ID'],
    });
    const vehicle = vehicleId
      ? Vehicle.findByPK(vehicleId, { attributes: ['VEHICLE_ID'] })
      : 'none';
    const status = reservationStatusId
      ? ReservationStatus.findByPK(reservationStatusId, {
          attributes: ['STATUS_ID'],
        })
      : 'none';

    if (!(user && resType && vehicle && status)) {
      return res.status(400).json({ message: 'Invalid ID(s) provided.' });
    }

    // Create the reservation
    // TODO make sure reservations are in the time zone of the garage
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
    return res.status(500);
  }
};

// PERMANENT/GUARANTEED RESERVATIONS

/**
 * Search for available spaces - Permanent Spot
 * POST request
 *
 * @async
 * @param {} location - The location around which the user is searching for parking
 * @param {Date} startDate - The desired starting date of the reservation
 * @param {Date} endDate - The desired ending date of the reservation
 * @param {} startTime - The desired starting time of the reservation
 * @param {} endTime - The desired ending time of the reservation
 * @param {String} frequency - The frequency of the reservation
 * @returns {}  an array of reservation options
 *
 * Preconditions:
 *  - set of valid garages known to the system is not empty
 *  - startDate < endDate
 *  - startTime < endTime
 *  - startDate >= current date
 *  - startTime >= current time
 *  - frequency is one of Daily, Weekly, or Monthly
 * Postconditions:
 *  - None
 */

const searchGuaranteedSpace = async (req, res) => {
  // TODO
  // Get arguments from url query
  const location = req.query.location;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const startTime = req.query.startTime;
  const endTime = req.query.endTime;
  const frequency = req.query.frequency;
  /* 
  // Return early if any arguments are missing
  if (
    !(location && startDate && endDate && startTime && endTime && frequency)
  ) {
    return res.status(400).json({ message: "Incomplete query" });
  } */

  // TODO Check preconditions

  // TODO Find matching available garages
  const fakeGarages = [
    {
      garageId: 101,
      description: 'ParkingSpaceX',
      lat: 0,
      lon: 0,
      timezone: 'America/New_York',
      price: 16.75,
      rate: 'hour',
    },
    {
      garageId: 102,
      description: 'GarageBrand',
      lat: 1,
      lon: 1,
      timezone: 'America/New_York',
      price: 12.5,
      rate: '30 min',
    },
    {
      garageId: 103,
      description: 'AllsPark',
      lat: -1,
      lon: 1,
      timezone: 'America/New_York',
      price: 10,
      rate: 'day',
    },
    {
      garageId: 104,
      description: 'SeeSpotPark',
      lat: -1,
      lon: 1,
      timezone: 'America/New_York',
      price: 10,
      rate: 'day',
    },
  ];

  // TODO Return results
  return res.status(200).json(fakeGarages);
};

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
    const user = User.findByPK(memberId, { attributes: ['USERNAME'] });
    const resType = ReservationType.findByPK(reservationTypeId, {
      attributes: ['RESERVATION_TYPE_ID'],
    });
    const vehicle = vehicleId
      ? Vehicle.findByPK(vehicleId, { attributes: ['VEHICLE_ID'] })
      : 'none';
    const status = reservationStatusId
      ? ReservationStatus.findByPK(reservationStatusId, {
          attributes: ['STATUS_ID'],
        })
      : 'none';

    if (!(user && resType && vehicle && status)) {
      return res.status(400).json({ message: 'Invalid ID(s) provided.' });
    }

    // Create the reservation
    // TODO make sure reservations are in the time zone of the garage
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
  searchGuaranteedSpace,
  reserveGuaranteedSpace,
};
