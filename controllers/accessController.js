const connectDB = require('../config/dbConn');
const sequelize = connectDB();
const { Sequelize, Op } = require('sequelize');
const { Space, SpaceStatus, Reservation, ReservationType, Garage } = sequelize.models;

/**
 * Attempt to enter a garage with a reservation
 * POST request
 * // TODO add a secure access key per terminal and check for match before processing
 *
 * @async
 * @param {Number} garageId - The ID of the garage the vehicle is attempting to enter
 * @param {String} plateNumber - The license plate number of the vehicle attempting entry
 * @param {String} plateState - The license plate state of the vehicle attempting entry
 * @returns {Object} - Reservation details and parking space assignment
 *
 * Preconditions:
 * - Access key matches an entry terminal registered to the given garage
 * Postconditions:
 * - The reservation status and space assignment are updated, and the vehicle is allowed entry
 */
const enter = async (req, res) => {
  // Get arguments from POST request body
};

/**
 * Attempt to enter a garage with a reservation using a reservation code
 * POST request
 * // TODO add a secure access key per terminal and check for match before processing
 *
 * @async
 * @param {Number} garageId - The ID of the garage the vehicle is attempting to enter
 * @param {String} plateNumber - The license plate number of the vehicle attempting entry
 * @param {String} plateState - The license plate state of the vehicle attempting entry
 *
 * @returns {Object} - Reservation details and parking space assignment
 *
 * Preconditions:
 * - Access key matches an entry camera registered to the given garage
 * Postconditions:
 * - The reservation status and space assignment are updated, and the vehicle is allowed entry
 * - The license plate is updated in the reservation if available
 */
const enterByCode = async (req, res) => {
  // Get arguments from POST request body
};
