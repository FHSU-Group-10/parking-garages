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
  let reservation = await entryResSearch(garageId, { plateNumber, plateState, reservationCode });

  // If no match is found, return failure
  if (reservation == null) return res.status(404).json({ message: 'No valid reservation found.' });

  // Assign an empty space after ensuring there is an open parking space
  const spaceAssigned = await assignSpace(reservation);

  // If assigned space is null, no spaces are free to park in. Communicate the issue to the user and do not allow entry.
  if (spaceAssigned.spaceNumber == null || spaceAssigned.floorNumber == null) {
    return res.status(409).json({ message: 'No empty parking spaces at this time.' });
  }

  // Change reservation state code
  await updateState('entry', reservation);

  // Save updated reservation
  await reservation.save();

  // Call the elevator
  await callElevator(garageId, spaceAssigned.floorNumber);

  // Return success with space assignment
  return res.status(200).json({ spaceNumber: spaceAssigned.spaceNumber, floorNumber: spaceAssigned.floorNumber });
};

/**
 * Attempt to exit a garage with a reservation
 * POST request
 * // TODO add a secure access key per terminal and check for match before processing
 *
 * @async
 * @param {Number} garageId - The ID of the garage the vehicle is attempting to enter
 * @param {String} plateNumber - Optional. The license plate number of the vehicle attempting entry
 * @param {String} plateState - Optional. The license plate state of the vehicle attempting entry
 * @param {String} reservationCode - Optional. A string given to users when they make a successful reservation, used for lookup
 * @returns {Object} - Status code and message
 *
 * Preconditions:
 * - The vehicle is currently known to be parked in the specified garage
 * - Access key matches an entry terminal registered to the given garage
 * - Either a reservation code or plate state and plate number must be provided
 * Postconditions:
 * - The reservation status and space assignment are updated
 * - The vehicle is allowed to exit
 */
const exit = async (req, res) => {
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
    reservation = await entryResSearch(garageId, { plateNumber, plateState, reservationCode });
  }

  // If no match is found, return failure
  if (reservation == null) return res.status(404).json({ message: 'No valid reservation found.' });
};

// -------- HELPER FUNCTIONS --------

/**
 * Retrieves a reservation based on a vehicle's license plate
 *
 * @param {Number} garageId - The ID of the garage to check reservations for
 * @param {Object} options - An object containing optional query arguments
 * {
 *    @param {String} plateNumber - The license plate number of the vehicle attempting entry
 *    @param {String} plateState - The license plate issuing authority of the vehicle attempting entry
 *    @param {String} reservationCode - A reservation code to search by
 * }
 * @returns {Object} - A matching reservation
 */
const entryResSearch = async (garageId, options) => {
  let reservation;

  // Both search types share some parameters
  let query = {
    where: {
      // Match garage
      GARAGE_ID: garageId,
      // Reservation is still valid
      STATUS_ID: { [Op.in]: [1, 4] },
      // Check that this is an appropriate time for the reservation
      START_TIME: { [Op.lte]: Date.now() },
      END_TIME: { [Op.gt]: Date.now() },
    },
  };

  // Specific fields by search type
  // Search by either license plate or reservation code
  if (options.reservationCode) {
    // Use to searching by reservation code if available
    query.where.RES_CODE = options.reservationCode;
  } else {
    // Otherwise try license plate
    query.where['$Vehicle.PLATE_NUMBER$'] = options.plateNumber;
    query.where['$Vehicle.PLATE_STATE$'] = options.plateState;
    query.include = {
      model: Vehicle,
      attributes: ['PLATE_NUMBER', 'PLATE_STATE'],
    };
  }
  // Search the DB for a matching reservation
  try {
    // TODO consider restricting attributes returned
    reservation = await Reservation.findOne(query);
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
const updateState = async (gateType, reservation) => {
  // Current state possibilities: entering one a valid single, entering on a valid monthly, exiting with a single, exiting with a monthly
  // Enter on a valid single or monthly reservation
  if (gateType == 'entry' && (reservation.STATUS_ID == 1 || reservation.STATUS_ID == 4)) {
    reservation.STATUS_ID = 3; // inGarage
  }
  // Exit with a single reservation
  else if (gateType == 'exit' && reservation.RESERVATION_TYPE_ID == 1 && reservation.STATUS_ID == 3) {
    reservation.STATUS_ID = 5; // complete
    // Free the space
    await Space.update(
      { STATUS_ID: 0 },
      {
        where: {
          GARAGE_ID: reservation.GARAGE_ID,
          SPACE_ID: reservation.SPACE_ID,
        },
      }
    );
  }
  // Exit with a monthly reservation
  else if (gateType == 'exit' && reservation.RESERVATION_TYPE_ID == 2 && reservation.STATUS_ID == 3) {
    reservation.STATUS_ID = 4;
    // Free the space
    await Space.update(
      { STATUS_ID: 0 },
      {
        where: {
          GARAGE_ID: reservation.GARAGE_ID,
          SPACE_ID: reservation.SPACE_ID,
        },
      }
    );
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
  // Find lowest floor and lowest space number with availability in the garage
  let space;

  if (reservation.GARAGE_ID)
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
        order: [
          [Floor, 'FLOOR_NUM', 'ASC'],
          ['SPACE_NUM', 'ASC'],
        ],
      });
    } catch (e) {
      console.error(e);
    }

  // A space was found
  if (space) {
    // Update state of space and save
    space.STATUS_ID = 1;
    await space.save();

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
  exit,
  entryResSearch,
  updateState,
  assignSpace,
  callElevator,
};
