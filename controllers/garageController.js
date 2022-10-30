/**
 * Lists the garages that exist in the system
 * GET request
 * @returns {[Object]} - An array of existing garages
 */
const _ = require("lodash");
const Db = require('../config/dbConn')();
const { Sequelize, Op } = require("sequelize");
// const getModels = Db.getModels;
// const bcrypt = require("bcrypt");
// const jwt = require('jsonwebtoken');
// const {token} = require("morgan");
const Garage = Db.models.Garage;
const listGarages = async (req, res) => {
  try {
    // Find pricing for the specified garage
    const results = await Garage.findAll();
    // Return results
    return res.status(200).json(results);
  } catch (err) {
    console.error('Garage controller failed.');
    return res.status(500);
  }
}
//return res.status(200).json([
/*
 {
   id: 'garage1',
   name: 'Parkopolis',
   location: 'Nowhere',
   numFloors: 3,
   spotsPerFloor: [10, 20, 20],
   overbookRate: 1.05,
   isActive: true,
 },
 {
   id: 'garage2',
   name: 'Carmalot',
   location: 'England',
   numFloors: 5,
   spotsPerFloor: [10, 20, 20, 0, 15],
   overbookRate: 1.1,
   isActive: false,
 },*/

const getGarageId = async (req, res) => {
  try {
    // Find pricing for the specified garage
    const results = await Garage.findAll(GARAGE_ID);
    // Return results
    return res.status(200).json(results);
  } catch (err) {
    console.error('Garage controller failed.');
    return res.status(500);
  }
};


/**
 * Updates a specified garage configuration
 * PATCH request
 *
 * @param {string} garageId -
 * @param {string} name -
 * @param {number} numFloors -
 * @param {[number]} spotsPerFloor -
 * @param {number} overbookRate -
 * @param {boolean} isActive -
 * @returns {Object} - Signals whether the garage was created successfully
 *
 * Preconditions:
 *  - garageId is not null
 *  - numFloors >= 1
 *  - Every value of spotsPerFloor is >= 0
 *  - overbookRate >= 100%
 * Postconditions:
 *  - The specified garage is updated in the database to reflect the given characteristics
 */
const updateGarage = async (req, res) => {
  // TODO
  // Get arguments from request url query
  const garageId = req?.body?.id;
  const garageName = req?.body?.name;
  const floors = req?.body?.numFloors;
  const spotsPerFloor = req?.body?.spotsPerFloor;
  const location = req?.body?.location;
  const overbookRate=req?.body?.overbookRate;
  const isActive=req?.body?.isActive
  
  // Return early if any arguments are missing
  if (!(garageName && floors && spotsPerFloor && location && isActive)) {
    return res.status(400).json({ message: 'Incomplete request' });
  }
  // Check preconditions
  if (floors < 1) {
    return res.status(400).json({ message: 'Number of floors must be >= 1.' });
  }
  if (!spotsPerFloor.every((spots) => spots >= 0)) {
    return res.status(400).json({ message: 'Every floor must have at least 0 spots.' });
  }
  if (floors != spotsPerFloor.length) {
    return res.status(400).json({ message: 'Number of floors does not match length of spotsPerFloor array.' });
  }
  if (overbookRate < 1.0) {
    return res.status(400).json({ message: 'Overbook rate must be at least 100%.' });
  }
  const validGarages = getGarageId();
  if (!validGarages.includes(garageId)) {
    return res.status(400).json({ message: 'garageId does not exist.' });
  }
  try {
    //update pricing
    const result = await Garage.update(
        {
          DESCRIPTION: garageName,
          FLOOR_COUNT: floors,
          LAT: location[0],
          LONG: location[1],
          OVERBOOK_RATE: overbookRate,
          IS_ACTIVE: isActive,
        },
        {where: {GARAGE_ID: garageId}}
    )
    
    // Return the result
    return res.status(200).json(result);
  }catch (err) {
    console.error('Garage controller failed.');
    return res.status(500);
  }
};
/**
 * Removes a specified garage
 * DELETE request
 *
 * @param {string} garageId - The id of the garage to delete
 * @returns {Object} - Signals whether the garage was successfully deleted
 *
 * Preconditions:
 *  - Garage exists in the database
 * Postconditions:
 *  - Garage does not exist in the database
 */
const deleteGarage = async (req, res) => {
  // Get arguments from request body
  const garageId = req.body.garageId;
  
  // Return early if garageId was not sent
  if (!garageId) {
    return res.status(400).json({ message: 'garageId is required.' });
  }
//check if garage is valid
  const validGarages = getGarageId();
  if (!validGarages.includes(garageId)) {
    return res.status(400).json({ message: 'garageId does not exist.' });
  }
  try {
    await Garage.destroy({
      where: {
        GARAGE_ID: garageId
      },
      force: true
    });
    const result = {message: 'Garage deleted.'};
    
    return res.status(200).json(result);
  }catch(err) {
    console.error('Garage controller failed.');
    return res.status(500);
  }
};

/**
 * Adds a specified garage
 *
 * @param {string} name - The name of the garage to delete
 * @param {number} numFloors  -floors in the garage
 * @param {[number]} spotsPerFloor -number of spots on each floor
 * @param {[string]} location - [latitude, longitude]
 * @param {number} overbookRate - if null then 0
 * @param {boolean} isActive - if true then garage is active
 * @returns {Object} - Signals whether the garage was successfully created
 *
 * Preconditions:
 *  - numFloors >= 1
 *  - Every value of spotsPerFloor >= 0
 *  - overbookRate >= 100%
 * Postconditions:
 *  - A new garage is created in the system with the given characteristics
 */
const addGarage = async (req, res) => {
  // TODO
  // Get arguments from request url query
  const garageName = req?.body?.name;
  const floors = req?.body?.numFloors;
  const spotsPerFloor = req?.body?.spotsPerFloor;
  const location = req?.body?.location;
  const overbookRate=req?.body?.overbookRate;
  const isActive=req?.body?.isActive
  
  // Return early if any arguments are missing
  if (!(garageName && floors && spotsPerFloor && location)) {
    return res.status(400).json({ message: 'Incomplete request' });
  }
  // Check preconditions
  if (floors < 1) {
    return res.status(400).json({ message: 'Number of floors must be >= 1.' });
  }
  if (!spotsPerFloor.every((spots) => spots >= 0)) {
    return res.status(400).json({ message: 'Every floor must have at least 0 spots.' });
  }
  if (floors != spotsPerFloor.length) {
    return res.status(400).json({ message: 'Number of floors does not match length of spotsPerFloor array.' });
  }
  if (overbookRate < 1.0) {
    return res.status(400).json({ message: 'Overbook rate must be at least 100%.' });
  }
  try{
    let test = {
      DESCRIPTION: garageName,
      FLOOR_COUNT: floors,
      LAT: location[0],
      LONG: location[1],
      OVERBOOK_RATE: overbookRate,
      IS_ACTIVE: isActive,
      
    }
    //not sure how this works. Do we need to set garage?
    const garage = await Garage.create({
      DESCRIPTION: garageName,
      FLOOR_COUNT: floors,
      LAT: location[0],
      LONG: location[1],
      OVERBOOK_RATE: overbookRate,
      IS_ACTIVE: isActive,
      
    });
    
    // Garage created in the DB
    const result = { message: 'Garage created.' };
    
    // Return the result
    return res.status(200).json(result);
  } catch (err) {
    console.error('Garage controller failed.');
    return res.status(500);
  }
};
/**
 * updates a specified garage
 *
 * @param {number} id - garageId
 * @param {string} name - The name of the garage to delete
 * @param {number} numFloors  -floors in the garage
 * @param {[number]} spotsPerFloor -number of spots on each floor
 * @param {[string]} location - [latitude, longitude]
 * @param {number} overbookRate - if null then 0
 * @param {boolean} isActive - if true then garage is active
 * @returns {Object} - Signals whether the garage was successfully created
 *
 * Preconditions:
 *  - Garage does exist in the database
 * Postconditions:
 *  - Garage is updated
 */



module.exports = { listGarages, addGarage, updateGarage, deleteGarage, getGarageId };
