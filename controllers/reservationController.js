// LIBRARIES

// MODELS

// SINGLE RESERVATIONS

/**
 * Search for available spaces - single reservation
 *
 * @param {} location -
 * @param {} startDateTime -
 * @param {} endDateTime -
 * @returns {} an array of reservation options
 *
 * Preconditions:
 *  - Set of valid garages known to the system is not empty
 *  - startDateTime < endDateTime
 *  - startDateTime >= current datetime
 * Postconditions:
 *  - None
 */
const searchSpace = (location, startDateTime, endDateTime) => {
  // TODO
  return [];
};

/**
 * Reserve a single space
 *
 * @param {} garageId -
 * @param {} startDateTime -
 * @param {} endDateTime -
 * @param {} customerId -
 * @param {} vehicle -
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
const reserveSpace = (garageId, startDateTime, endDateTime, customerId, vehicle = null) => {
  // TODO
  return {};
};

// PERMANENT/GUARANTEED RESERVATIONS

/**
 * Search for available spaces - Permanent Spot
 *
 * @param {} location -
 * @param {} startDate -
 * @param {} endDate -
 * @param {} startTime -
 * @param {} endTime -
 * @param {} frequency -
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
const searchGuaranteedSpot = (location, startDate, endDate, startTime, endTime, frequency) => {
  // TODO
  return [];
};

/**
 * Reserve a permanent space
 *
 * @param {} garageId -
 * @param {} startDate -
 * @param {} endDate -
 * @param {} startTime -
 * @param {} endTime -
 * @param {} frequency -
 * @param {} customerId -
 * @param {} vehicle -
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
const reserveGuaranteedSpace = (garageId, startDate, endDate, startTime, endTime, frequency, customerId, vehicle = null) => {
  // TODO
  return {};
};
