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
          street: null,
          city: null,
          state: null,
          zip: null,
          startDateTime: null,
          endDateTime: null,
          reservationTypeId: null,
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
        street: '206 Washington St SW',
        city: 'Atlanta',
        state: 'GA',
        zip: '30334',
        startDateTime: new Date(2025, 0, 1, 12, 0),
        endDateTime: new Date(2025, 0, 1, 15, 30),
        reservationTypeId: 1,
      };
      const results = await reservationController.searchSpace(req, res);
      expect(results.status).toBe(200);
      expect(results.body).toEqual(['garage1', 'garage2']);
    });

    test('Starting datetime must be before ending datetime', async () => {
      req.query = {
        street: '206 Washington St SW',
        city: 'Atlanta',
        state: 'GA',
        zip: '30334',
        startDateTime: new Date(2025, 0, 1, 15, 30),
        endDateTime: new Date(2025, 0, 1, 12, 0),
        reservationTypeId: 1,
      };
      const results = await reservationController.searchSpace(req, res);
      expect(results.status).toBe(400);
      expect(results.body).toEqual({
        message: 'Start datetime must be earlier than end datetime',
      });
    });

    test('Starting datetime must be >= current datetime', async () => {
      req.query = {
        street: '206 Washington St SW',
        city: 'Atlanta',
        state: 'GA',
        zip: '30334',
        startDateTime: new Date(2020, 0, 1, 12, 0),
        endDateTime: new Date(2025, 0, 1, 15, 30),
        reservationTypeId: 1,
      };
      const results = await reservationController.searchSpace(req, res);
      expect(results.status).toBe(400);
      expect(results.body).toEqual({
        message: 'Start date time cannot be earlier than the current time',
      });
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
      const results = await reservationController.searchSpace(req, res);
      expect(results.status).toBe(400);
      expect(results.body).toEqual({ message: 'Incomplete query' });
    });

    test('Complete query succeeds', async () => {
      req.query = {
        street: '206 Washington St SW',
        city: 'Atlanta',
        state: 'GA',
        zip: '30334',
        startDateTime: new Date(2025, 0, 1, 12, 0),
        endDateTime: new Date(2025, 0, 1, 15, 30),
        reservationTypeId: 2,
      };
      const results = await reservationController.searchSpace(req, res);
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
          memberId: null,
          reservationTypeId: null,
          vehicleId: null,
          garageId: null,
          startDateTime: null,
          endDateTime: null,
          spotNumber: null,
          reservationStatusId: null,
          extraGrace: null,
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
      expect(reservation.body).toEqual({ message: 'Incomplete request.' });
    });

    test('Complete request succeeds', async () => {
      req.body = {
        memberId: 1,
        reservationTypeId: 1,
        vehicleId: 1,
        garageId: 1,
        startDateTime: new Date(2025, 0, 1, 12, 0),
        endDateTime: new Date(2025, 0, 1, 15, 30),
        spotNumber: null,
        reservationStatusId: 1,
        extraGrace: false,
      };
      const reservation = await reservationController.reserveSpace(req, res);
      //expect(reservation.body).toEqual({ message: 'Reservation complete!' });
      expect(reservation.status).toBe(200);
    });

    test('Starting datetime must be before ending datetime', async () => {
      req.body = {
        memberId: 1,
        reservationTypeId: 1,
        vehicleId: 1,
        garageId: 1,
        startDateTime: new Date(2025, 0, 1, 15, 30),
        endDateTime: new Date(2025, 0, 1, 12, 0),
        spotNumber: null,
        reservationStatusId: 1,
        extraGrace: false,
      };
      const results = await reservationController.reserveSpace(req, res);
      expect(results.status).toBe(400);
      expect(results.body).toEqual({
        message: 'Invalid date or time.',
      });
    });

    test('Starting datetime must be >= current datetime', async () => {
      req.body = {
        memberId: 1,
        reservationTypeId: 1,
        vehicleId: 1,
        garageId: 1,
        startDateTime: new Date(2020, 0, 1, 12, 0),
        endDateTime: new Date(2025, 0, 1, 15, 30),
        spotNumber: null,
        reservationStatusId: 1,
        extraGrace: false,
      };
      const results = await reservationController.reserveSpace(req, res);
      expect(results.status).toBe(400);
      expect(results.body).toEqual({
        message: 'Invalid date or time.',
      });
    });

    test('FKs must be valid PKs in their respective tables', async () => {
      req.body = {
        memberId: -1,
        reservationTypeId: -1,
        vehicleId: -1,
        garageId: -1,
        startDateTime: new Date(2025, 0, 1, 12, 0),
        endDateTime: new Date(2025, 0, 1, 15, 30),
        spotNumber: null,
        reservationStatusId: -1,
        extraGrace: false,
      };
      const results = await reservationController.reserveSpace(req, res);
      expect(results.status).toBe(400);
      expect(results.body).toEqual({ message: 'Invalid ID(s) provided.' });
    });
  });

  // reservationController.reserveGuaranteedSpace()
  describe('Reserve a guaranteed space', () => {
    let req, res;

    // Set mock request and response objects before each test
    beforeEach(() => {
      req = {
        body: {
          memberId: null,
          reservationTypeId: null,
          vehicleId: null,
          garageId: null,
          startDateTime: null,
          endDateTime: null,
          spotNumber: null,
          reservationStatusId: null,
          extraGrace: null,
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
      const reservation = await reservationController.reserveGuaranteedSpace(
        req,
        res
      );
      expect(reservation.status).toBe(400);
      expect(reservation.body).toEqual({ message: 'Incomplete request.' });
    });

    test('Complete request succeeds', async () => {
      req.body = {
        memberId: 123,
        reservationTypeId: 1,
        vehicleId: 456,
        garageId: 789,
        startDateTime: new Date(2025, 0, 1, 12, 0),
        endDateTime: new Date(2025, 0, 1, 15, 30),
        spotNumber: null,
        reservationStatusId: null,
        extraGrace: false,
      };
      const reservation = await reservationController.reserveGuaranteedSpace(
        req,
        res
      );
      expect(reservation.status).toBe(200);
      expect(reservation.body).not.toBe(null);
    });
    test('Starting datetime must be >= current datetime', async () => {
      req.body = {
        memberId: 1,
        reservationTypeId: 1,
        vehicleId: 1,
        garageId: 1,
        startDateTime: new Date(2020, 0, 1, 12, 0),

        spotNumber: null,
        reservationStatusId: 1,
        extraGrace: false,
      };
      const results = await reservationController.reserveGuaranteedSpace(
        req,
        res
      );
      expect(results.status).toBe(400);
      expect(results.body).toEqual({
        message: 'Invalid date or time.',
      });
    });

    test('FKs must be valid PKs in their respective tables', async () => {
      req.body = {
        memberId: 1000,
        reservationTypeId: 1000,
        vehicleId: 1000,
        garageId: 1000,
        startDateTime: new Date(2025, 0, 1, 12, 0),
        endDateTime: null,
        spotNumber: null,
        reservationStatusId: 1000,
        extraGrace: false,
      };
      const results = await reservationController.reserveGuaranteedSpace(
        req,
        res
      );
      expect(results.status).toBe(400);
      expect(results.body).toEqual({ message: 'Invalid ID(s) provided.' });
    });
  });
});
