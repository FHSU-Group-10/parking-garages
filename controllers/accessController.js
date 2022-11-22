const connectDB = require('../config/dbConn');
const sequelize = connectDB();
const { Sequelize, Op } = require('sequelize');
const { Space, SpaceStatus, Reservation, ReservationType, Garage } = sequelize.models;

// -------- API FUNCTIONS --------

/**
 * Attempt to enter a garage with a reservation
 * POST request
 * // TODO add a secure access key per terminal and check for match before processing
 *
 * @async
 * @param {Number} garageId - The ID of the garage the vehicle is attempting to enter
 * @param {String} plateNumber - Optional. The license plate number of the vehicle attempting entry
 * @param {String} plateState - Optional. The license plate state of the vehicle attempting entry
 * @param {String} reservationCode - Optional. A string given to users when they make a successful reservation, used for lookup
 * @returns {Object} - Reservation details and parking space assignment
 *
 * Preconditions:
 * - Access key matches an entry terminal registered to the given garage
 * - Either a reservation code or plate state and plate number must be provided
 * Postconditions:
 * - The reservation status and space assignment are updated, and the vehicle is allowed entry
 */
const enter = async (req, res) => {
  // Get arguments from POST request body
  const garageId = req?.body?.garageId;
  const plateNumber = req?.body?.plateNumber;
  const plateState = req?.body?.plateState;
  const reservationCode = req?.body?.reservationCode;

  // Return early if any arguments are missing
  if (!(req?.body && garageId && ((plateNumber && plateState) || reservationCode))) {
    return res.status(400).json({ message: 'Incomplete request.' });
  }

  // Search for a matching reservation in the DB
  let reservation;
  if (reservationCode) {
    // Search for a match by reservation code
    reservation = await reservationCodeSearch(garageId, reservationCode);
  } else {
    // Search for a match by plate number and plate state
    reservation = await reservationSearch(garageId, plateNumber, plateState);
  }

  // If no match is found, return failure
  if (reservation == null) return res.status(404).json({ message: 'No valid reservation found.' });

  // Change reservation state code
  updateState(reservation);

  // Assign an empty space
  const spaceAssigned = await assignSpace(reservation);

  // Save updated reservation
  await reservation.save();

  // Call the elevator
  await callElevator(garageId, spaceAssigned.floorNumber);

  // Return success with space assignment
  return res.status(200).json({ spaceNumber: spaceAssigned.spaceNumber, floorNumber: spaceAssigned.floorNumber });
};

// -------- HELPER FUNCTIONS --------

/**
 * Retrieves a reservation based on a vehicle's license plate
 *
 * @param {Number} garageId - The ID of the garage to check reservations for
 * @param {String} plateNumber - The license plate number of the vehicle attempting entry
 * @param {String} plateState - The license plate issuing authority of the vehicle attempting entry
 * @returns {Object} - A matching reservation
 */
const reservationSearch = async (garageId, plateNumber, plateState) => {
  // TODO reservation search by license plate
  return null;
};

/**
 * Retrieves a reservation based on a reservation code
 *
 * @param {Number} garageId - The ID of the garage to check reservations for
 * @param {String} reservationCode - The reservation code from the user attempting entry
 * @returns {Object} - A matching reservation
 */
const reservationCodeSearch = async (garageId, reservationCode) => {
  // TODO reservation search by code
  return null;
};

/**
 * Updates the reservationState of the given reservation
 *
 * @param {Reservation} reservation - The reservation to update
 */
const updateState = (reservation) => {
  // TODO change reservation state code
  return;
};

/**
 * Assigns a parking space to a reservation when the vehicle enters the garage
 *
 * @param {Reservation} reservation - A reservation record
 * @returns {Object} - A spaceNumber and floorNumber for the assigned parking space
 */
const assignSpace = async (reservation) => {
  // TODO space assignment

  // Find lowest floor with availability in the garage
  const space = await sequelize.query(`
    SELECT 
        f.FLOOR_NUM,
        s.SPACE_ID,
        s.STATUS_ID,
        s.SPACE_NUM
    FROM SPACES s INNER JOIN FLOORS f 
    ON f.FLOOR_ID = s.FLOOR_ID
    WHERE
        f.GARAGE_ID = ${reservation.GARAGE_ID} AND s.STATUS_ID = 0 
    ORDER BY f.FLOOR_NUM
    LIMIT 1
    `);

  return {
    spaceNumber: space.SPACE_NUM,
    floorNumber: space.FLOOR_NUM,
  };
};

/** // TODO should this be client-side?
 * A dummy function to allow connecting a vehicle elevator to the system to deliver vehicles to their assigned floor
 * @param {Number} garageId - The ID of the garage to call the elevator in
 * @param {Number} floorNumber - The destination floor for the current vehicle
 */
const callElevator = async (garageId, floorNumber) => {
  // Future elevator functionality can be connected here
  return;
};

// Export functions
module.exports = {
  enter,
  reservationSearch,
  reservationCodeSearch,
  updateState,
  assignSpace,
  callElevator,
};
