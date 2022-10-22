const connectDB = require('../config/dbConn');
const sequelize = connectDB();
const { Pricing } = sequelize.models;

/**
 *  Get the pricing for a specified garage
 *
 * @param {string} garageId - The ID of the garage to return pricing for
 * @returns {} - The pricing data for the specified garage
 *
 * Preconditions:
 *  - Set of valid garageIds known to the system is not empty
 *  - garageId is not null
 */
const getPricing = async (req, res) => {
  // TODO
  // // Get arguments from request url query

  // Find pricing for the specified garage
  const results = await Pricing.findAll();

  // Return results
  return res.status(200).json(results);
};

/**
 *  Update the pricing of a specific garage
 *
 * @param {string} garageId - The ID of the garage to update pricing for
 * @param {string} priceType - The price type to update
 * @param {number} newPrice - The new price value
 * @returns {} - Signals success
 *
 * Preconditions:
 *  - priceType is a valid value within the system
 *  - newPrice is a money value
 * Postconditions:
 *  - The specified price category of the specified garage is updated to the new price in the database
 */
const updatePricing = async (req, res) => {
  // TODO
  // Get arguments from request url query
  const garageId = req.body.garageId;
  const priceType = req.body.priceType;
  const newPrice = req.body.newPrice;

  // Return early if any arguments are missing
  if (!(garageId && priceType && newPrice)) {
    return res.status(400).json({ message: 'Incomplete request' });
  }

  // TODO Check preconditions

  // Update pricing in the DB
  const result = { message: 'Pricing updated.' };

  // Return the result
  return res.status(200).json(result);
};

module.exports = { getPricing, updatePricing };
