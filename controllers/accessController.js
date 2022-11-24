const connectDB = require('../config/dbConn');
const sequelize = connectDB();
const { Op } = require('sequelize');
const { Space, Floor, Reservation, Vehicle } = sequelize.models;

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
  updateState('entry', reservation);

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
  let reservation;
  try {
    // TODO consider restricting attributes returned
    reservation = await Reservation.findOne({
      where: {
        // Match garage
        GARAGE_ID: garageId,
        // License Plate is a match
        '$Vehicle.PLATE_NUMBER$': plateNumber,
        '$Vehicle.PLATE_STATE$': plateState,
        // Reservation is still valid
        STATUS_ID: { [Op.in]: [1, 4] },
        // Check that this is an appropriate time for the reservation
        START_TIME: { [Op.lte]: Date.now() },
        END_TIME: { [Op.gt]: Date.now() },
      },
      include: {
        model: Vehicle,
        attributes: ['PLATE_NUMBER', 'PLATE_STATE'],
      },
    });
  } catch (e) {
    console.error(e);
  }

  return reservation;
};

/**
 * Retrieves a reservation based on a reservation code
 *
 * @param {Number} garageId - The ID of the garage to check reservations for
 * @param {String} reservationCode - The reservation code from the user attempting entry
 * @returns {Object} - A matching reservation
 */
const reservationCodeSearch = async (garageId, reservationCode) => {
  let reservation;
  try {
    // TODO consider restricting attributes returned
    reservation = await Reservation.findOne({
      where: {
        // Match garage and reservation code
        RES_CODE: reservationCode,
        GARAGE_ID: garageId,
        // Reservation is still valid
        STATUS_ID: { [Op.in]: [1, 4] },
        // Check that this is an appropriate time for the reservation
        START_TIME: { [Op.lte]: Date.now() },
        END_TIME: { [Op.gt]: Date.now() },
      },
    });
  } catch (e) {
    console.error(e);
  }

  return reservation;
};

/**
 * Updates the reservationState of the given reservation
 *
 * @param {String} gateType - The type of gate, either entry or exit
 * @param {Reservation} reservation - The reservation to update
 */
const updateState = (gateType, reservation) => {
  // Current state possibilities: entering one a valid single, entering on a valid monthly, exiting with a single, exiting with a monthly
  // Enter on a valid single or monthly reservation
  if (gateType == 'entry' && (reservation.STATUS_ID == 1 || reservation.STATUS_ID == 4)) {
    reservation.STATUS_ID = 3; // inGarage
  }
  // Exit with a single reservation
  else if (gateType == 'exit' && reservation.RESERVATION_TYPE_ID == 1 && reservation.STATUS_ID == 3) {
    reservation.STATUS_ID = 5; // complete
    // TODO free the space
  }
  // Exit with a monthly reservation
  else if (gateType == 'exit' && reservation.RESERVATION_TYPE_ID == 2 && reservation.STATUS_ID == 3) {
    reservation.STATUS_ID = 4;
    // TODO free space
  } else {
    throw new Error('InvalidStateTransition');
  }
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
  let space;
  try {
    space = await Space.findOne({
      attributes: ['SPACE_ID', 'SPACE_NUM', 'STATUS_ID'],
      where: {
        GARAGE_ID: reservation.GARAGE_ID,
        STATUS_ID: 0,
      },
      include: {
        model: Floor,
        attributes: ['FLOOR_NUM'],
      },
      order: [[Floor, 'FLOOR_NUM', 'ASC']],
    });
  } catch (e) {
    console.error(e);
  }

  // A space was found
  if (space) {
    // Update state of space and save
    space.STATUS_ID = 1;
    space.save();

    // Assign space to reservation if available
    reservation.SPACE_ID = space.SPACE_ID;
    // NOTE reservation must me saved back to DB after this function is called
  } else {
    // A space was not found
    space = {
      SPACE_NUM: null,
      Floor: {
        FLOOR_NUM: null,
      },
    };
  }

  // Return only space and floor numbers
  return {
    spaceNumber: space.SPACE_NUM,
    floorNumber: space.Floor.FLOOR_NUM,
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
