const connectDB = require('../config/dbConn');
const sequelize = connectDB();
const { Sequelize, Op } = require("sequelize");
const { Pricing, ReservationType } = sequelize.models;

/**
 *  Get the pricing 
 *
 * @returns {} - The current prices
 *
 * Preconditions:
 *  - Pricing data exists in DB (update in report and summary of change)
 */
const getPricing = async (req, res) => {
  // TODO
  try {
    // Find pricing for the specified garage
    const results = await Pricing.findAll();
    // Return results
    return res.status(200).json(results);
  } catch (err) {
    console.error('Pricing controller failed.');
    return res.status(500);
  }
};

/**
 *  Update the pricing of a specific garage
 *
 * @param {string} singleRes - Reservation description for single reservation
 * @param {string} singleCost - New price for single reservation
 * @param {string} guaranteedRes - Reservation description for guaranteed reservation
 * @param {string} guaranteedCost - New price for guaranteed reservation
 * @param {string} walkInRes - eservation description for walk-in reservation
 * @param {string} walkInCost - New price for walk-ins reservation
 * @param {number} newDailyMax - The new price value
 * @returns {} - Signals success
 *
 * Preconditions:
 *  - at least one set of reservation type and cost are initialized
 * 
 * Postconditions:
 *  - update the price for each reservation type that was initialized
 *  - update the price of DAILY_MAX if daily max was initialized
 * 
 */
const updatePricing = async (req, res) => {
  // TODO
  // Get arguments from request url query
  const singleRes = req?.body?.singleRes;
  const singleCost = req?.body?.singleCost;
  const guaranteedRes = req?.body?.guaranteedRes;
  const guaranteedCost = req?.body?.guaranteedCost;
  const walkInRes = req?.body?.walkInRes;
  const walkInCost = req?.body?.walkInCost;
  const newDailyMax = req?.body?.DailyMax;

  // Return early if any arguments are missing
  // if (!(resType || newPrice || newDailyMax)) {
  //     return res.status(400).json({ message: 'pricingController: Incomplete update pricing request' });
  // }
  try {
    if (singleRes && singleCost) {
      await setPricing(singleRes, singleCost, res);
      console.log({ message: 'Single reservation price updated.\n' });
    }
    if (guaranteedRes && guaranteedCost) {
      await setPricing(guaranteedRes, guaranteedCost, res);
      console.log({ message: 'Guaranteed reservation price updated.\n' });
    }
    if (walkInRes && walkInCost) {
      await setPricing(walkInRes, walkInCost, res);
      console.log({ message: 'Walk-in reservation price updated.\n' });
    }
    if (newDailyMax) {
      await Pricing.update(
        {
          DAILY_MAX: newDailyMax, res
        },
        {
          where: {
            DAILY_MAX: {
              [Op.not]: newDailyMax
            }
          }
        }
      );
    }
  } catch (err) {
    console.error('Pricing controller failed.');
    return res.status(500);
  }
  // TODO Check preconditions

  // Update pricing in the DB
  const result = { message: 'Pricing updated.' };

  // Return the result
  return res.status(200).json(result);
};

/**
 * Helper function for updatePricing(), sets the prices for the passed in parameters in the database
 * 
 * @param {string} resType - description that matches a reservation type
 * @param {string} newPrice - new price to be set for the corresponding resrvation type
 * 
 * Preconditions:
 *  - resType is string that matches a valid reservation type description
 *  - newPrice is initialized to valid price value
 * 
 * Postcondition:
 *  - Updates the cost to the matching resType description  
 */
async function setPricing(resType, newPrice, res) {
  let priceUpdate = await Pricing.findOne({
    where: {
      DESCRIPTION: resType
    }
  });
  if (!priceUpdate) {
    return res.status(400).json({ message: 'pricingController failed at setPricing()' });
  }
  priceUpdate.set({
    COST: newPrice
  });
  await priceUpdate.save();
  return res.status(200);
};

const createPricing = async (req, res) => {
  // TODO
  // Get arguments from request url query
  const description = req?.body?.description;
  const cost = req?.body?.cost;
  const dailyMax = req?.body?.dailyMax;
  const reservationTypeId = req?.body?.reservationTypeId;

  // Return early if any arguments are missing
  if (!(description && cost && dailyMax && reservationTypeId)) {
    return res.status(400).json({ message: 'Incomplete request' });
  }

  try {
    const resType = await ReservationType.findOne({
      where: {
        RESERVATION_TYPE_ID: reservationTypeId,
      }
    });

    if (!resType) {
      return res.status(400).json({ message: "princingController: Reservation type id invalid" });
    }

    const [price, created] = await Pricing.findOrCreate({
      where: {
        DESCRIPTION: description,
        COST: cost,
        DAILY_MAX: dailyMax,
        RESERVATION_TYPE_ID: reservationTypeId,
      }
    });

    if (!created) {
      return res.status(400).json({ message: "Duplicate Pricing: An identical Pricing already exists." });
    }
    // TODO Check preconditions
    // Pricing created in the DB
    const result = { message: 'Pricing created.' };

    // Return the result
    return res.status(200).json(result);
  } catch (err) {
    console.error('Pricing controller failed.');
    return res.status(500);
  }
};

const destroyRow = async (req, res) => {
  const resType = req.body.description;
  try {
    await Pricing.destroy({
      where: {
        DESCRIPTION: resType
      }
    });
  } catch {
    return res.status(400).json({ message: "error in destroy row." });
  }
  return res.status(200).json({ message: "Row deleted." });
};

module.exports = { getPricing, updatePricing, createPricing, destroyRow };