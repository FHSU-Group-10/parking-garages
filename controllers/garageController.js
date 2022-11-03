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
const Floor = Db.models.Floor;

/*
  Add the number of floors for each garage.
  
  Loop through and create a floor object with id and floor number (eg. 1st floor is the ground floor)
  
  Send the array to bulkCreate, which will create new floors if needed, or just update the old floors.
  
  
 */
const addFloors = async (garage,floors,spotsPerFloor) => {
  try {
    let garageFloors = [];
    
    // // check if we have existing floors for this garage
    let existingFloors = await Floor.findAll({
      where: {
        GARAGE_ID: garage.GARAGE_ID
      }
    });

    existingFloors = (existingFloors || []).map((ef) => ef.dataValues);

    if (existingFloors.length) {
      for (let ef of existingFloors) {
        garageFloors.push({
          FLOOR_ID: ef.FLOOR_ID,
          GARAGE_ID: garage.GARAGE_ID,
          FLOOR_NUM: ef.FLOOR_NUM,
          SPACE_COUNT: spotsPerFloor
        });
      }
    }
    
    // decrease our number of floors for existing floors we already updated
    // Eg. the garage had 3 floors, but they added a 4th floor. We update the 3 existing floors, then create a new floor.
    // floors will be an integer for number of floors so in the above example of having 4(total) - 3(existing) = 1(new floor)
    
    for (let i = existingFloors.length || 0; i < floors; i++) {
      garageFloors.push({
        GARAGE_ID: garage.GARAGE_ID,
        FLOOR_NUM: i + 1,
        SPACE_COUNT: spotsPerFloor
      });
    }
    // pass our array of floors to create
    // if we have a duplicate, we ONLY want to updat the SPACE_COUNT
    let assigned_floors = await Floor.bulkCreate(garageFloors, {updateOnDuplicate: ['SPACE_COUNT']});

    // remove our data values
    // using .map since the returned floors is an array of object with dataValues on each object
    assigned_floors = (assigned_floors || []).map((af) => af.dataValues);

    return [assigned_floors, spotsPerFloor];
  } catch (err) {
    throw err;
  }
};

const getSpotNumber = async () => {
  try {
    let floors = await Floor.findAll({attributes: [
        // specify an array where the first element is the SQL function and the second is the alias
        [Sequelize.fn('DISTINCT', Sequelize.col('GARAGE_ID')) ,'GARAGE_ID'],
          'SPACE_COUNT'
      ]});
  
    floors = (floors || []).map((f) => f.dataValues);
    
    let formattedFloors = new Map();
    for (let f of floors) {
      formattedFloors.set(f.GARAGE_ID, f.SPACE_COUNT);
    }

    return formattedFloors;
  } catch (err) {
    throw err;
  }
}

const listGarages = async (req, res) => {
  try {
    // Find pricing for the specified garage
    let garages = await Garage.findAll();
  
    garages = (garages || []).map((g) => g.dataValues);
    
    let garageSpots = await getSpotNumber();
    
    for (let g of garages) {
      g.spotsPerFloor = garageSpots.get(g.GARAGE_ID);
    }
    
    // Return results
    return res.status(200).json(garages);
  } catch (err) {
    console.error('Garage controller failed.');
    return res.status(500).send();
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
  const garageName = req?.body?.description;
  const overbookRate = req?.body?.overbookRate;
  const floors = req?.body?.numFloors;
  const spotsPerFloor = req?.body?.spotsPerFloor;
  const location = req?.body?.location;
  const isActive = req?.body?.isActive;
  
  // Return early if any arguments are missing
  if (overbookRate < 1.0) {
    return res.status(400).json({ message: 'Overbook rate must be at least 100%.' });
  }
 
  try {
    let [garage,created] = await Garage.upsert({
      DESCRIPTION: garageName,
      OVERBOOK_RATE: overbookRate,
      FLOOR_COUNT: floors,
      LAT: location[0],
      LONG: location[1],
      IS_ACTIVE: isActive,
    });
    // separating dataValues from return set
    garage = (garage || {}).dataValues;
  
    [garage.floors, garage.spotsPerFloor] = await addFloors(garage,floors,spotsPerFloor);
    
    // Return the result
    return res.status(200).json(garage);
  } catch (err) {
    console.error('Garage controller failed.');
    console.error(err);
    return res.status(500).send();
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
  const validGarages = getGarageById();
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
    const result = { message: 'Garage deleted.' };
    
    return res.status(200).json(result);
  } catch (err) {
    console.error('Garage controller failed.');
    return res.status(500).send();
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
  const overbookRate = req?.body?.overbookRate;
  const isActive = req?.body?.isActive;
  
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
  try {
    
    //not sure how this works. Do we need to set garage?
    let garage = await Garage.create({
      DESCRIPTION: garageName,
      FLOOR_COUNT: floors,
      LAT: location[0],
      LONG: location[1],
      OVERBOOK_RATE: overbookRate,
      IS_ACTIVE: isActive,
      
    });
    
    // separating dataValues from return set
    garage = (garage || {}).dataValues;
    // init our array
    let garage_floors = [];
    if (garage) {
      // create each floor object for saving
      for (let i = 0; i < floors; i++) {
        garage_floors.push({
          GARAGE_ID: garage.GARAGE_ID,
          FLOOR_NUM: i + 1,
          SPACE_COUNT: spotsPerFloor[i]
        });
      }
      // pass our array of floors to create
      let assigned_floors = await Floor.bulkCreate(garage_floors);
      
      // remove our data values
      // using .map since the returned floors is an array of object with dataValues on each object
      assigned_floors = (assigned_floors || []).map((af) => af.dataValues);
      garage.floors = assigned_floors;
    }
    
    // Return the result
    return res.status(200).json(garage);
  } catch (err) {
    console.error('Garage controller failed.');
    return res.status(500).send();
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



module.exports = { listGarages, addGarage, updateGarage, deleteGarage };
