// Controller to test
const reservationController = require('../../controllers/reservationController');

describe('Reservation Controller', () => {
  // reservationController.searchSpace()
  describe('Search for a single space', () => {
    let req, res;

    // Set mock request and response items before each test
    beforeEach(() => {
      req = {
        query: {
          location: null,
          startDateTime: null,
          endDateTime: null,
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

    test('Incomplete query fails', async () => {
      const results = await reservationController.searchSpace(req, res);
      expect(results.status).toBe(400);
      expect(results.body).toEqual({ message: 'Incomplete query' });
    });

    test('Complete query succeeds', async () => {
      req.query = {
        location: 'a',
        startDateTime: 1,
        endDateTime: 2,
      };
      const results = await reservationController.searchSpace(req, res);
      expect(results.status).toBe(200);
      expect(results.body).toEqual(['garage1', 'garage2']);
    });

    test('Starting datetime must be before ending datetime', async () => {
      req.query = {
        location: 'a',
        startDateTime: 2,
        endDateTime: 2,
      };
      const results = await reservationController.searchSpace(req, res);
      expect(results.status).toBe(400);
      expect(results.body).toEqual({ message: 'Start datetime must be earlier than end datetime' });
    });
  });

  // reservationController.searchGuaranteedSpace()
  describe('Search for a guaranteed space', () => {
    let req, res;

    // Set mock request and response objects before each test
    beforeEach(() => {
      req = {
        query: {
          location: null,
          startDate: null,
          endDate: null,
          startTime: null,
          endTime: null,
          frequency: null,
        },
      };

      res = {
        json: (json) => {
          res.body = json;
          return res;
        },
        status: (status) => {
          res.status = status;
          return res;
        },
        body: null,
      };
    });

    test('Incomplete query fails', async () => {
      const results = await reservationController.searchGuaranteedSpace(req, res);
      expect(results.status).toBe(400);
      expect(results.body).toEqual({ message: 'Incomplete query' });
    });

    test('Complete query succeeds', async () => {
      req.query = {
        location: 'a',
        startDate: 1,
        endDate: 2,
        startTime: 100,
        endTime: 200,
        frequency: 'Daily',
      };
      const results = await reservationController.searchGuaranteedSpace(req, res);
      expect(results.status).toBe(200);
      expect(results.body).toEqual(['garage1', 'garage2']);
    });
  });

  // reservationController.reserveSpace()
  describe('Reserve a single space', () => {
    let req, res;

    // Set mock request and response objects before each test
    beforeEach(() => {
      req = {
        body: {
          garageId: null,
          startDateTime: null,
          endDateTime: null,
          customerId: null,
          vehicle: null,
        },
      };

      res = {
        json: (json) => {
          res.body = json;
          return res;
        },
        status: (status) => {
          res.status = status;
          return res;
        },
        body: null,
      };
    });

    test('Incomplete request fails', async () => {
      const reservation = await reservationController.reserveSpace(req, res);
      expect(reservation.status).toBe(400);
      expect(reservation.body).toEqual({ message: 'Incomplete request' });
    });

    test('Complete request succeeds', async () => {
      req.body = {
        garageId: 123,
        startDateTime: 1,
        endDateTime: 2,
        customerId: 456,
        vehicle: null,
      };
      const reservation = await reservationController.reserveSpace(req, res);
      expect(reservation.status).toBe(200);
      expect(reservation.body).toEqual({ message: 'Reservation complete!' });
    });
  });

  // reservationController.reserveGuaranteedSpace()
  describe('Reserve a guaranteed space', () => {
    let req, res;

    // Set mock request and response objects before each test
    beforeEach(() => {
      req = {
        body: {
          garageId: null,
          startDate: null,
          endDate: null,
          startTime: null,
          endTime: null,
          frequency: null,
          customerId: null,
          vehicle: null,
        },
      };

      res = {
        json: (json) => {
          res.body = json;
          return res;
        },
        status: (status) => {
          res.status = status;
          return res;
        },
        body: null,
      };
    });

    test('Incomplete request fails', async () => {
      const reservation = await reservationController.reserveGuaranteedSpace(req, res);
      expect(reservation.status).toBe(400);
      expect(reservation.body).toEqual({ message: 'Incomplete request' });
    });

    test('Complete request succeeds', async () => {
      req.body = {
        garageId: 123,
        startDate: 1,
        endDate: 2,
        startTime: 100,
        endTime: 200,
        frequency: 'Daily',
        customerId: 456,
        vehicle: null,
      };
      const reservation = await reservationController.reserveGuaranteedSpace(req, res);
      expect(reservation.status).toBe(200);
      expect(reservation.body).toEqual({ message: 'Reservation complete!' });
    });
  });

  // reservationController.datetimeJsToSql()
  describe('Convert between JS Date and SQL DateTime', () => {
    test('JS Date to SQL Datetime', () => {
      // Declared as UTC for timezone-independent checks
      const jsDatetime = new Date(Date.UTC(1991, 3, 11, 9, 25, 0)); // Months are 0-11 Jan-Dec
      const sqlDatetime = reservationController.datetimeJsToSql(jsDatetime);
      expect(sqlDatetime).toBe('1991-04-11 09:25:00');
    });

    test('SQL Datetime to JS Date', () => {
      // Create a JS Date in UTC
      const jsDatetime = new Date(Date.UTC(1991, 3, 11, 9, 25, 0));
      // Convert to SQL DateTime
      const sqlDatetime = reservationController.datetimeJsToSql(jsDatetime);
      expect(sqlDatetime).toBe('1991-04-11 09:25:00');
      // Convert back to JS Date
      const result = reservationController.datetimeSqlToJs(sqlDatetime);
      expect(result).toEqual(jsDatetime);
    });
  });
});
