/**
 *  Get the pricing for a specified price id
 *
 * @param {number} priceId - The ID of the pricing entry to return pricing data for
 * @returns {object} - The pricing data for the specified pricing entry
 *
 * Preconditions:
 *  - priceId is the ID of a valid pricing entry
 * Postconditions: None
 */
const getPricing = async (req, res) => {
  // TODO
  // Get arguments from request url query
  const priceId = req.query.priceId;

  // Return early if priceId is missing
  if (!priceId) {
    return res.status(400).json({ message: 'priceId is required.' });
  }

  // TODO Retrieve pricing data from the database
  let results; // TODO call the model to get the data and assign to results

  // Return results
  return res.status(200).json(results);
};

/**
 *  Update the pricing of a specific garage
 *
 * @param {string} priceId - The ID of the pricing entry to update pricing data for
 * @param {string} description - The description of the pricing entry
 * @param {number} cost - The cost per time unit
 * @param {number} dailyMax - The daily maximum price
 * @param {number} reservationTypeId - The reservation type of the pricing entry
 * @returns {object} - JSON object to signal success or relay error messages
 *
 * Preconditions:
 *  - priceId is the ID of a valid pricing entry
 *  - reservationTypeId is a valid value within the system
 *  - cost and dailyMax are money values
 * Postconditions:
 *  - The specified pricing entry is updated in the database
 */
const updatePricing = async (req, res) => {
  // TODO
  // TODO Get arguments from request url query

  // Return early if any arguments are missing
  if (!(priceId && description && cost && dailyMax && reservationTypeId)) {
    return res.status(400).json({ message: 'Incomplete request' });
  }

  // TODO Check preconditions

  // TODO Update pricing in the DB

  // TODO Return the result
};

// TODO comments
const createPricing = async (req, res) => {
  // TODO so we can easily create the initial price entries for the system.
  // I don't think this needs to be accessible from the UI unless we let garage owners set new prices and reservation types.
};

// TODO if you think a getAllPrices or deletePrice function would be helpful you could add them to get the full CRUD set.

module.exports = { getPricing, updatePricing };
