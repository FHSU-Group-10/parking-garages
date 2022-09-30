// LIBRARIES

// MODELS

// SINGLE RESERVATIONS

/**
 * Search for available spaces - single reservation
 * GET request
 *
 * @async
 * @param {} location - The location around which the user is searching for parking
 * @param {Date} startDateTime - The desired starting time of the reservation
 * @param {Date} endDateTime - The desired ending time of the reservation
 * @returns {} an array of reservation options
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
  // Get arguments from request url query
  const location = req.query.location;
  const startDateTime = req.query.startDateTime;
  const endDateTime = req.query.endDateTime;

  // Return early if any arguments are missing
  if (!(location && startDateTime && endDateTime)) {
    return res.status(400).json({ message: 'Incomplete query' });
  }

  // Check preconditions
  // TODO check if garages are known

  if (startDateTime >= endDateTime) {
    return res.status(400).json({ message: 'Start datetime must be earlier than end datetime' });
  }
  // TODO check against current time precondition

  // TODO Find matching available garages
  const results = ['garage1', 'garage2'];

  // TODO Return results
  return res.status(200).json(results);
};

/**
 * Reserve a single space
 * POST request
 *
 * @async
 * @param {} garageId - The ID of the garage in which to reserve a space
 * @param {Date} startDateTime - The desired starting time of the reservation
 * @param {Date} endDateTime - The desired ending time of the reservation
 * @param {} customerId - The ID of the customer the reservation is made for
 * @param {} vehicle - The vehicle plate details for the vehicle the reservation is made for
 * @returns {} reservation details
 *
 * Preconditions:
 *  - garageId is not null
 *  - startDateTime < endDateTime
 *  - startDateTime >= current datetime
 *  - customerId is not null
 * Postconditions:
 *  - A reservation is created in the system matching the given characteristics
 */
const reserveSpace = async (req, res) => {
  // TODO
  // Get arguments from POST request body
  const garageId = req.body.garageId;
  const startDateTime = req.body.startDateTime;
  const endDateTime = req.body.endDateTime;
  const customerId = req.body.customerId;
  const vehicle = req.body.vehicle;

  // Return early if any arguments missing (vehicles optional)
  if (!(garageId && startDateTime && endDateTime && customerId)) {
    return res.status(400).json({ message: 'Incomplete request' });
  }

  // TODO check preconditions

  // TODO create the reservation in the DB
  const reservation = { message: 'Reservation complete!' };

  // TODO return the reservation details after successful creation
  return res.status(200).json(reservation);
};

// PERMANENT/GUARANTEED RESERVATIONS

/**
 * Search for available spaces - Permanent Spot
 * GET request
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

  // Return early if any arguments are missing
  if (!(location && startDate && endDate && startTime && endTime && frequency)) {
    return res.status(400).json({ message: 'Incomplete query' });
  }

  // TODO Check preconditions

  // TODO Find matching available garages
  const results = ['garage1', 'garage2'];

  return res.status(200).json(results);
};

/**
 * Reserve a permanent space
 * POST request
 *
 * @async
 * @param {} garageId - The ID of the garage in which to reserve a space
 * @param {Date} startDate - The desired starting date of the reservation
 * @param {Date} endDate - The desired ending date of the reservation
 * @param {} startTime - The desired starting time of the reservation
 * @param {} endTime - The desired ending time of the reservation
 * @param {String} frequency - The frequency of the reservation
 * @param {} customerId - The ID of the customer the reservation is made for
 * @param {} vehicle - The vehicle plate details for the vehicle the reservation is made for
 * @returns {} reservation details
 *
 * Preconditions:
 *  - garageId is not null
 *  - startDate < endDate
 *  - startTime < endTime
 *  - startDate >= current date
 *  - startTime >= current time
 *  - frequency is one of Daily, Weekly, or Monthly
 *  - customerId is not null
 */
const reserveGuaranteedSpace = async (req, res) => {
  // TODO
  // Get arguments from POST request body
  const garageId = req.body.garageId;
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;
  const startTime = req.body.startTime;
  const endTime = req.body.endTime;
  const frequency = req.body.frequency;
  const customerId = req.body.customerId;
  const vehicle = req.body.vehicle;

  // Return early if any args missing (vehicle optional)
  if (!(garageId && startDate && endDate && startTime && endTime && frequency && customerId)) {
    return res.status(400).json({ message: 'Incomplete request' });
  }

  // TODO check preconditions

  // TODO create the reservation in the DB
  const reservation = { message: 'Reservation complete!' };

  // TODO return the reservation details after successful creation
  return res.status(200).json(reservation);
};

/**
 * Convert a JS Date timestamp into a UTC SQL DateTime
 *
 * @param {Date} jsDatetime - A JS Date timestamp
 * @returns {String} - The time converted to UTC as a SQL-style DateTime string
 */
const datetimeJsToSql = (jsDatetime) => {
  const sqlDatetime = jsDatetime.toISOString().slice(0, 19).replace('T', ' ');
  return sqlDatetime;
};

/**
 * Convert a UTC SQL DateTime into a JS Date timestamp
 *
 * @param {String} sqlDatetime - A UTC SQL-style DateTime string
 * @returns {Date} - The time converted to a Date object in the server's timezone
 */
const datetimeSqlToJs = (sqlDatetime) => {
  // Split sql datetime into parts to recreate as UTC
  const timeParts = sqlDatetime.split(/[- :]/);
  // Decrement month. Date months are 0-11 Jan-Dec
  timeParts[1]--;
  // Create new time in UTC
  const jsDatetime = new Date(Date.UTC(...timeParts));
  console.log(sqlDatetime, jsDatetime);
  return jsDatetime;
};

// Export functions
module.exports = { searchSpace, reserveSpace, searchGuaranteedSpace, reserveGuaranteedSpace, datetimeJsToSql, datetimeSqlToJs };
