/**
 * Lists the garages that exist in the system
 * GET request
 *
 * @returns {[Object]} - An array of existing garages
 */
const listGarages = async (req, res) => {
  // TODO
  return res.status(200).json([
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
    },
  ]);
};

/**
 * Adds a garage with the specified configuration
 * POST request
 *
 * @param {string} name -
 * @param {string} location -
 * @param {number} numFloors -
 * @param {[number]} spotsPerFloor -
 * @param {number} overbookRate -
 * @param {boolean} isActive -
 * @returns {Object} - Signals whether the garage was created successfully
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
  // Get arguments from POST request body
  const name = req.body.name;
  const location = req.body.location;
  const numFloors = req.body.numFloors;
  const spotsPerFloor = req.body.spotsPerFloor;
  const overbookRate = req.body.overbookRate;
  const isActive = req.body.isActive;

  // Return early if any arguments missing
  if (!(name && location && numFloors && spotsPerFloor && overbookRate && isActive)) {
    return res.status(400).json({ message: 'Incomplete request.' });
  }

  // TODO check preconditions
  if (numFloors < 1) {
    return res.status(400).json({ message: 'Number of floors must be >= 1.' });
  }
  if (!spotsPerFloor.every((spots) => spots >= 0)) {
    return res.status(400).json({ message: 'Every floor must have at least 0 spots.' });
  }
  if (numFloors != spotsPerFloor.length) {
    return res.status(400).json({ message: 'Number of floors does not match length of spotsPerFloor array.' });
  }
  if (overbookRate < 1.0) {
    return res.status(400).json({ message: 'Overbook rate must be at least 100%.' });
  }

  // TODO create the garage in the DB
  const result = { message: 'Garage created.' };

  // TODO signal success
  return res.status(200).json(result);
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
  // Get arguments from request body
  const garageId = req.body.garageId;
  const name = req.body.name;
  const numFloors = req.body.numFloors;
  const spotsPerFloor = req.body.spotsPerFloor;
  const overbookRate = req.body.overbookRate;
  const isActive = req.body.isActive;

  // Return early if any arguments missing
  if (!(garageId && name && numFloors && spotsPerFloor && overbookRate && isActive)) {
    return res.status(400).json({ message: 'Incomplete request.' });
  }

  // Check preconditions
  if (numFloors < 1) {
    return res.status(400).json({ message: 'Number of floors must be >= 1.' });
  }
  if (!spotsPerFloor.every((spots) => spots >= 0)) {
    return res.status(400).json({ message: 'Every floor must have at least 0 spots.' });
  }
  if (numFloors != spotsPerFloor.length) {
    return res.status(400).json({ message: 'Number of floors does not match length of spotsPerFloor array.' });
  }
  if (overbookRate < 1.0) {
    return res.status(400).json({ message: 'Overbook rate must be at least 100%.' });
  }

  // TODO Check if garageId is valid
  const validGarages = ['garage1', 'garage2', 'garage3'];
  if (!validGarages.includes(garageId)) {
    return res.status(400).json({ message: 'garageId does not exist.' });
  }

  // TODO Update the garage in the database
  const result = { message: 'Garage updated.' };

  // TODO signal success
  return res.status(200).json(result);
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

  // TODO Check if garageId is valid
  const validGarages = ['garage1', 'garage2', 'garage3'];
  if (!validGarages.includes(garageId)) {
    return res.status(400).json({ message: 'garageId does not exist.' });
  }

  // TODO Delete garage from database
  const result = { message: 'Garage deleted.' };

  // TODO Signal the result
  return res.status(200).json(result);
};

module.exports = { listGarages, addGarage, updateGarage, deleteGarage };
