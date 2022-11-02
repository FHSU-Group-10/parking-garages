// Controller to test
const garageController = require('../../controllers/garageController');

jest.setTimeout(10000);

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
});
