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

    test('Complete query succeeds', async () => {
      req.query.garageId = 'garage1';
      const results = await pricingController.getPricing(req, res);
      expect(results.status).toBe(200);
      expect(results.body.length).toBe(3)
    });
  });
});
