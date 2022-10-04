// Controller to test
const garageController = require('../../controllers/garageController');

describe('Garage Controller', () => {
  describe('List all garages', () => {
    let req, res;

    beforeEach(() => {
      req = {};

      res = {
        json: (json) => {
          res.body = json;
          return res;
        },
        status: (statusCode) => {
          res.status = statusCode;
          return res;
        },
        body: null,
      };
    });

    test('Returns results', async () => {
      const results = await garageController.listGarages(req, res);
      expect(results.status).toBe(200);
      expect(results.body.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Add new garages', () => {
    let req, res;

    beforeEach(() => {
      req = {
        body: {
          name: null,
          location: null,
          numFloors: null,
          spotsPerFloor: [],
          overbookRate: null,
        },
      };

      res = {
        json: (json) => {
          res.body = json;
          return res;
        },
        status: (statusCode) => {
          res.status = statusCode;
          return res;
        },
        body: null,
      };
    });

    test('Incomplete request', async () => {
      const result = await garageController.addGarage(req, res);
      expect(result.status).toBe(400);
      expect(result.body).toEqual({ message: 'Incomplete request.' });
    });

    test('Invalid number of floors', async () => {
      req.body = {
        name: 'SpotMe',
        location: 'Atlanta, GA',
        numFloors: -1,
        spotsPerFloor: [5, 5],
        overbookRate: 1.0,
        isActive: true,
      };

      const result = await garageController.addGarage(req, res);
      expect(result.status).toBe(400);
      expect(result.body).toEqual({ message: 'Number of floors must be >= 1.' });
    });

    test('Invalid number of spots per floor', async () => {
      req.body = {
        name: 'SpotMe',
        location: 'Atlanta, GA',
        numFloors: 3,
        spotsPerFloor: [5, -5, 0],
        overbookRate: 1.0,
        isActive: true,
      };

      const result = await garageController.addGarage(req, res);
      expect(result.status).toBe(400);
      expect(result.body).toEqual({ message: 'Every floor must have at least 0 spots.' });
    });

    test("Spots per floor array doesn't match number of floors", async () => {
      req.body = {
        name: 'SpotMe',
        location: 'Atlanta, GA',
        numFloors: 2,
        spotsPerFloor: [5, 5, 0],
        overbookRate: 1.0,
        isActive: true,
      };

      const result = await garageController.addGarage(req, res);
      expect(result.status).toBe(400);
      expect(result.body).toEqual({ message: 'Number of floors does not match length of spotsPerFloor array.' });
    });

    test('Invalid overbooking rate', async () => {
      req.body = {
        name: 'SpotMe',
        location: 'Atlanta, GA',
        numFloors: 3,
        spotsPerFloor: [5, 5, 0],
        overbookRate: 0.5,
        isActive: true,
      };

      const result = await garageController.addGarage(req, res);
      expect(result.status).toBe(400);
      expect(result.body).toEqual({ message: 'Overbook rate must be at least 100%.' });
    });

    test('Valid request', async () => {
      req.body = {
        name: 'SpotMe',
        location: 'Atlanta, GA',
        numFloors: 3,
        spotsPerFloor: [5, 5, 0],
        overbookRate: 1.5,
        isActive: true,
      };

      const result = await garageController.addGarage(req, res);
      expect(result.status).toBe(200);
      expect(result.body).toEqual({ message: 'Garage created.' });
    });
  });

  describe('Update an existing garage', () => {
    let req, res;

    beforeEach(() => {
      req = {
        body: {
          garageId: null,
          name: null,
          numFloors: null,
          spotsPerFloor: [],
          overbookRate: null,
        },
      };

      res = {
        json: (json) => {
          res.body = json;
          return res;
        },
        status: (statusCode) => {
          res.status = statusCode;
          return res;
        },
        body: null,
      };
    });

    test('Incomplete request', async () => {
      const result = await garageController.updateGarage(req, res);
      expect(result.status).toBe(400);
      expect(result.body).toEqual({ message: 'Incomplete request.' });
    });

    test('Invalid number of floors', async () => {
      req.body = {
        garageId: 'garage1',
        name: 'SpotMe',
        numFloors: -1,
        spotsPerFloor: [5, 5],
        overbookRate: 1.0,
        isActive: true,
      };

      const result = await garageController.updateGarage(req, res);
      expect(result.status).toBe(400);
      expect(result.body).toEqual({ message: 'Number of floors must be >= 1.' });
    });

    test('Invalid number of spots per floors', async () => {
      req.body = {
        garageId: 'garage1',
        name: 'SpotMe',
        numFloors: 3,
        spotsPerFloor: [5, -5, 0],
        overbookRate: 1.0,
        isActive: true,
      };

      const result = await garageController.updateGarage(req, res);
      expect(result.status).toBe(400);
      expect(result.body).toEqual({ message: 'Every floor must have at least 0 spots.' });
    });

    test("Spots per floor array doesn't match number of floors", async () => {
      req.body = {
        garageId: 'garage1',
        name: 'SpotMe',
        numFloors: 2,
        spotsPerFloor: [5, 5, 0],
        overbookRate: 1.0,
        isActive: true,
      };

      const result = await garageController.updateGarage(req, res);
      expect(result.status).toBe(400);
      expect(result.body).toEqual({ message: 'Number of floors does not match length of spotsPerFloor array.' });
    });

    test('Invalid overbooking rate', async () => {
      req.body = {
        garageId: 'garage1',
        name: 'SpotMe',
        numFloors: 3,
        spotsPerFloor: [5, 5, 0],
        overbookRate: 0.5,
        isActive: true,
      };

      const result = await garageController.updateGarage(req, res);
      expect(result.status).toBe(400);
      expect(result.body).toEqual({ message: 'Overbook rate must be at least 100%.' });
    });

    test('garageId does not exist in DB', async () => {
      req.body = {
        garageId: 'invalidGarage',
        name: 'SpotMe',
        numFloors: 3,
        spotsPerFloor: [5, 5, 0],
        overbookRate: 1.5,
        isActive: true,
      };

      const result = await garageController.updateGarage(req, res);
      expect(result.status).toBe(400);
      expect(result.body).toEqual({ message: 'garageId does not exist.' });
    });

    test('Valid request', async () => {
      req.body = {
        garageId: 'garage1',
        name: 'SpotMe',
        location: 'Atlanta, GA',
        numFloors: 3,
        spotsPerFloor: [5, 5, 0],
        overbookRate: 1.5,
        isActive: true,
      };

      const result = await garageController.updateGarage(req, res);
      expect(result.status).toBe(200);
      expect(result.body).toEqual({ message: 'Garage updated.' });
    });
  });

  describe('Delete an existing garage', () => {
    let req, res;

    beforeEach(() => {
      req = {
        body: {
          garageId: null,
        },
      };

      res = {
        json: (json) => {
          res.body = json;
          return res;
        },
        status: (statusCode) => {
          res.status = statusCode;
          return res;
        },
        body: null,
      };
    });

    test('Missing garageId', async () => {
      const result = await garageController.deleteGarage(req, res);
      expect(result.status).toBe(400);
      expect(result.body).toEqual({ message: 'garageId is required.' });
    });

    test('garageId does not exist in DB', async () => {
      req.body.garageId = 'invalidGarage';

      const result = await garageController.deleteGarage(req, res);
      expect(result.status).toBe(400);
      expect(result.body).toEqual({ message: 'garageId does not exist.' });
    });

    test('Valid request', async () => {
      req.body.garageId = 'garage1';

      const result = await garageController.deleteGarage(req, res);
      expect(result.status).toBe(200);
      expect(result.body).toEqual({ message: 'Garage deleted.' });
    });
  });
});
