// Controller to test
const pricingController = require('../../controllers/pricingController');

describe('Pricing Controller', () => {
  let req, res;

  describe('Get pricing for a garage', () => {
    // Set mock request and response before each test
    beforeEach(() => {
      // Set request object
      req = {
        query: {
          garageId: null,
        },
      };
      // Set response object
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

    test('Missing garageId fails', async () => {
      const results = await pricingController.getPricing(req, res);
      expect(results.status).toBe(400);
      expect(results.body).toEqual({ message: 'garageId is required.' });
    });

    test('Complete query succeeds', async () => {
      req.query.garageId = 'garage1';
      const results = await pricingController.getPricing(req, res);
      expect(results.status).toBe(200);
      expect(results.body).toEqual({
        reserveHourly: 10.5,
        contractHourly: 8.0,
        walkinHourly: 15.99,
      });
    });
  });

  describe('Update pricing for a garage', () => {
    // Set mock request and response before each test
    beforeEach(() => {
      // Set request object
      req = {
        body: {
          garageId: null,
          priceType: null,
          newPrice: null,
        },
      };
      // Set response object
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

    test('Valid request', async () => {
      req.body = {
        garageId: 'garage1',
        priceType: 'reserveHourly',
        newPrice: 12.5,
      };
      const result = await pricingController.updatePricing(req, res);
      expect(result.status).toBe(200);
      expect(result.body).toEqual({ message: 'Pricing updated.' });
    });

    test('Missing arguments fails', async () => {
      const result = await pricingController.updatePricing(req, res);
      expect(result.status).toBe(400);
      expect(result.body).toEqual({ message: 'Incomplete request' });
    });
  });
});
