/**
 * Lists the garages that exist in the system
 * GET request
 * @returns {[Object]} - An array of existing garages
 */
const _ = require('lodash');
const Db = require('../config/dbConn')();
const { Sequelize, Op } = require('sequelize');
// const getModels = Db.getModels;
// const bcrypt = require("bcrypt");
// const jwt = require('jsonwebtoken');
// const {token} = require("morgan");
const { Garage, Floor, Space } = Db.models;

/*
  Add the number of floors for each garage.
  
  Loop through and create a floor object with id and floor number (eg. 1st floor is the ground floor)
  
  Send the array to bulkCreate, which will create new floors if needed, or just update the old floors.
  
  
 */
const addFloors = async (garage, floors, spotsPerFloor) => {
  try {
    let garageFloors = [];

    // // check if we have existing floors for this garage
    let existingFloors = await Floor.findAll({
      where: {
        GARAGE_ID: garage.GARAGE_ID,
      },
    });

    existingFloors = (existingFloors || []).map((ef) => ef.dataValues);

    if (existingFloors.length) {
      for (let ef of existingFloors) {
        garageFloors.push({
          FLOOR_ID: ef.FLOOR_ID,
          GARAGE_ID: garage.GARAGE_ID,
          FLOOR_NUM: ef.FLOOR_NUM,
          SPACE_COUNT: spotsPerFloor,
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
        SPACE_COUNT: spotsPerFloor,
      });
    }
    // pass our array of floors to create
    // if we have a duplicate, we ONLY want to updat the SPACE_COUNT
    let assigned_floors = await Floor.bulkCreate(garageFloors, { updateOnDuplicate: ['SPACE_COUNT'] });

    // remove our data values
    // using .map since the returned floors is an array of object with dataValues on each object
    assigned_floors = (assigned_floors || []).map((af) => af.dataValues);

    // Remove any floors numbered above the current number of floors
    if (assigned_floors.length > floors) {
      await Floor.destroy({
        where: {
          GARAGE_ID: garage.GARAGE_ID,
          FLOOR_NUM: {
            [Op.gt]: floors,
          },
        },
      });
    }

    // Update the spaces for the floors
    await updateSpaces(assigned_floors);

    return [assigned_floors, spotsPerFloor];
  } catch (err) {
    throw err;
  }
};

/**
 * Update parking spaces when updating garages
 * WARNING - will remove parking spaces, even if they are currently occupied! Do not update garages that are "in use"
 *
 * @param {[Object]} floors - An array of floor records to update spaces for
 * @returns {[Object]} - An array of space data objects
 */
const updateSpaces = async (floors) => {
  // Track all floor IDs for final delete operation
  let floorIds = [];

  // Iterate over each floor
  for (let i = 0; i < floors.length; i++) {
    // Store this floor ID
    floorIds.push(floors[i].FLOOR_ID);

    // Retrieve a count of all existing spaces
    let existingSpaces = await Space.count({
      where: {
        GARAGE_ID: floors[i].GARAGE_ID,
        FLOOR_ID: floors[i].FLOOR_ID,
      },
    });

    // Decide to add, remove, or leave the existing spaces
    // Skip this floor if it is unchanged
    if (existingSpaces == floors[i].SPACE_COUNT) continue;
    else if (existingSpaces < floors[i].SPACE_COUNT) {
      // Need to add spaces
      let newSpaces = [];

      // Iterate over each new space needed for this floor
      for (let j = existingSpaces + 1; j <= floors[i].SPACE_COUNT; j++) {
        newSpaces.push({
          WALK_IN: false,
          SPACE_NUM: j,
          GARAGE_ID: floors[i].GARAGE_ID,
          FLOOR_ID: floors[i].FLOOR_ID,
        });
      }

      // Bulk create the spaces for this floor
      try {
        await Space.bulkCreate(newSpaces);
      } catch (e) {
        console.error(e);
      }
      // Finished, continue to the next floor
      continue;
    } else {
      // Need to remove spaces
      await Space.destroy({
        where: {
          GARAGE_ID: floors[i].GARAGE_ID,
          FLOOR_ID: floors[i].FLOOR_ID,
          SPACE_NUM: {
            [Op.gt]: floors[i].SPACE_COUNT,
          },
        },
      });
    }
  }

  // Delete all spaces for any floors that were removed from this garage
  await Space.destroy({
    where: {
      GARAGE_ID: floors[0].GARAGE_ID,
      FLOOR_ID: {
        [Op.notIn]: [...floorIds],
      },
    },
  });
};

const getSpotNumber = async () => {
  try {
    let floors = await Floor.findAll({
      attributes: [
        // specify an array where the first element is the SQL function and the second is the alias
        [Sequelize.fn('DISTINCT', Sequelize.col('GARAGE_ID')), 'GARAGE_ID'],
        'SPACE_COUNT',
      ],
    });

    floors = (floors || []).map((f) => f.dataValues);

    let formattedFloors = new Map();
    for (let f of floors) {
      formattedFloors.set(f.GARAGE_ID, f.SPACE_COUNT);
    }

    return formattedFloors;
  } catch (err) {
    throw err;
  }
};

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
    console.error(err);
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
  const isActive = req?.body?.isActive || true; // Missing on front end, default here to true

  // Return early if any arguments are missing
  if (overbookRate < 1.0) {
    return res.status(400).json({ message: 'Overbook rate must be at least 100%.' });
  }

  try {
    let [garage, created] = await Garage.upsert({
      DESCRIPTION: garageName,
      OVERBOOK_RATE: overbookRate,
      FLOOR_COUNT: floors,
      LAT: location[0],
      LONG: location[1],
      IS_ACTIVE: isActive,
    });
    // separating dataValues from return set
    garage = (garage || {}).dataValues;

    [garage.floors, garage.spotsPerFloor] = await addFloors(garage, floors, spotsPerFloor);

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
        GARAGE_ID: garageId,
      },
      force: true,
    });
    const result = { message: 'Garage deleted.' };

    return res.status(200).json(result);
  } catch (err) {
    console.error('Garage controller failed.');
    console.error(err);
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
          SPACE_COUNT: spotsPerFloor[i],
        });
      }
      // pass our array of floors to create
      let assigned_floors = await Floor.bulkCreate(garage_floors);

      // remove our data values
      // using .map since the returned floors is an array of object with dataValues on each object
      assigned_floors = (assigned_floors || []).map((af) => af.dataValues);
      garage.floors = assigned_floors;

      // Create new spaces for the floors
      let assignedSpaces = await addSpaces(spotsPerFloor, garage.floors);
    }

    // Return the result
    return res.status(200).json(garage);
  } catch (err) {
    console.error('Garage controller failed.');
    console.error(err);
    return res.status(500).send();
  }
};

/**
 * Create the spaces for the garage, linked to their floors
 *
 * @param {[Number]} spotsPerFloor - An array with the space for each floor
 * @param {[Obect]} floors - The floors
 * @returns {[Object]} - An array of space objects after creation
 */
const addSpaces = async (floors) => {
  // A two-dimensional array of created spaces
  let spaces = [];

  for (let i = 0; i < floors.length; i++) {
    let floorSpaces = [];

    // Create each space object for bulk creation
    for (let j = 1; j <= floors[i].FLOOR_COUNT; j++) {
      floorSpaces.push({
        WALK_IN: false,
        SPACE_NUM: j,
        GARAGE_ID: floors[i].GARAGE_ID,
        FLOOR_ID: floors[i].FLOOR_ID,
      });
    }

    // Bulk create this floor's spaces in DB
    let assignedSpaces;
    try {
      assignedSpaces = await Space.bulkCreate(floorSpaces);
    } catch (e) {
      console.error(e);
    }
    // Keep only the data values of each sequelize object
    assignedSpaces = (assignedSpaces || []).map((space) => space.dataValues);

    // Push data values to the return array
    spaces.push[assignedSpaces];
  }

  return spaces;
};

module.exports = { listGarages, addGarage, updateGarage, deleteGarage };
