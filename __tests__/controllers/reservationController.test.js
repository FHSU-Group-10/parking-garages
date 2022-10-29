// Controller to test
const reservationController = require('../../controllers/reservationController');

jest.setTimeout(20000);

describe('Reservation Controller', () => {
  // reservationController.searchSpace()
  describe('Search for a single space', () => {
    let req, res;

    // Set mock request and response items before each test
    beforeEach(async () => {
      req = {
        body: {
          lat: null,
          lon: null,
          radius: null,
          reservationTypeId: null,
          startDateTime: {
            year: null,
            month: null,
            day: null,
            hour: null,
            minute: null,
          },
          endDateTime: {
            year: null,
            month: null,
            day: null,
            hour: null,
            minute: null,
          },
          isMonthly: null,
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
      expect(results.body).toEqual({ message: 'Incomplete query.' });
    });

    test('Complete query succeeds', async () => {
      req.body = {
        lat: 1,
        lon: 1,
        radius: 1000,
        reservationTypeId: 1,
        startDateTime: {
          year: 2023,
          month: 1,
          day: 1,
          hour: 12,
          minute: 0,
        },
        endDateTime: {
          year: 2023,
          month: 1,
          day: 1,
          hour: 15,
          minute: 30,
        },
        isMonthly: false,
      };

      const results = await reservationController.searchSpace(req, res);

      expect(results.body).toEqual([
        {
          garageId: 1,
          description: 'ParkingSpaceX',
          lat: 0,
          lon: 0,
          distance: 500,
        },
        {
          garageId: 2,
          description: 'GarageBrand',
          lat: 1,
          lon: 1,
          distance: 3000,
        },
      ]);
      expect(results.status).toBe(200);
    });

    test('Starting datetime must be before ending datetime', async () => {
      req.body = {
        lat: 1,
        lon: 1,
        radius: 1000,
        reservationTypeId: 1,
        startDateTime: {
          year: 2023,
          month: 1,
          day: 1,
          hour: 15,
          minute: 30,
        },
        endDateTime: {
          year: 2023,
          month: 1,
          day: 1,
          hour: 12,
          minute: 0,
        },
        isMonthly: false,
      };
      const results = await reservationController.searchSpace(req, res);
      expect(results.status).toBe(400);
      expect(results.body).toEqual({
        message: 'Invalid date or time.',
      });
    });

    test('Starting datetime must be >= current datetime', async () => {
      req.body = {
        lat: 1,
        lon: 1,
        radius: 1000,
        reservationTypeId: 1,
        startDateTime: {
          year: 2021,
          month: 1,
          day: 1,
          hour: 12,
          minute: 0,
        },
        endDateTime: {
          year: 2023,
          month: 1,
          day: 1,
          hour: 15,
          minute: 30,
        },
        isMonthly: false,
      };
      const results = await reservationController.searchSpace(req, res);
      expect(results.status).toBe(400);
      expect(results.body).toEqual({
        message: 'Invalid date or time.',
      });
    });
  });

  // reservationController.searchSpace()
  describe('Search for a guaranteed space', () => {
    let req, res;

    // Set mock request and response objects before each test
    beforeEach(async () => {
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
      expect(results.body).toEqual({ message: 'Incomplete query.' });
    });

    test('Complete query succeeds', async () => {
      req.body = {
        lat: 1,
        lon: 1,
        radius: 1000,
        reservationTypeId: 1,
        startDateTime: {
          year: 2023,
          month: 1,
          day: 1,
          hour: 12,
          minute: 0,
        },
        endDateTime: null,
        isMonthly: true,
      };
      const results = await reservationController.searchSpace(req, res);
      expect(results.status).toBe(200);
      expect(results.body).toEqual([
        {
          garageId: 1,
          description: 'ParkingSpaceX',
          lat: 0,
          lon: 0,
          distance: 500,
        },
        {
          garageId: 2,
          description: 'GarageBrand',
          lat: 1,
          lon: 1,
          distance: 3000,
        },
      ]);
    });

    test('Starting datetime must be >= current datetime', async () => {
      req.body = {
        lat: 1,
        lon: 1,
        radius: 1000,
        reservationTypeId: 1,
        startDateTime: {
          year: 2021,
          month: 1,
          day: 1,
          hour: 12,
          minute: 0,
        },
        endDateTime: null,
        isMonthly: true,
      };
      const results = await reservationController.searchSpace(req, res);
      expect(results.status).toBe(400);
      expect(results.body).toEqual({
        message: 'Invalid date or time.',
      });
    });
  });

  // reservationController.reserveSpace()
  describe('Reserve a single space', () => {
    let req, res;

    // Set mock request and response objects before each test
    beforeEach(async () => {
      req = {
        body: {
          memberId: null,
          reservationTypeId: null,
          vehicleId: null,
          garageId: null,
          lat: null,
          lon: null,
          startDateTime: null,
          endDateTime: null,
          reservationStatusId: null,
          isMonthly: null,
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
        lat: 1,
        lon: 1,
        startDateTime: {
          year: 2023,
          month: 1,
          day: 1,
          hour: 12,
          minute: 0,
        },
        endDateTime: {
          year: 2023,
          month: 1,
          day: 1,
          hour: 15,
          minute: 30,
        },
        reservationStatusId: 1,
        isMonthly: false,
      };
      const reservation = await reservationController.reserveSpace(req, res);
      // console.log(reservation);
      expect(reservation.status).toBe(200);
    });

    test('Starting datetime must be before ending datetime', async () => {
      req.body = {
        memberId: 1,
        reservationTypeId: 1,
        vehicleId: 1,
        garageId: 1,
        lat: 1,
        lon: 1,
        startDateTime: {
          year: 2024,
          month: 1,
          day: 1,
          hour: 12,
          minute: 0,
        },
        endDateTime: {
          year: 2023,
          month: 1,
          day: 1,
          hour: 15,
          minute: 30,
        },
        reservationStatusId: 1,
        isMonthly: false,
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
        lat: 1,
        lon: 1,
        startDateTime: {
          year: 2020,
          month: 1,
          day: 1,
          hour: 12,
          minute: 0,
        },
        endDateTime: {
          year: 2023,
          month: 1,
          day: 1,
          hour: 15,
          minute: 30,
        },
        reservationStatusId: 1,
        isMonthly: false,
      };
      const results = await reservationController.reserveSpace(req, res);
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
        lat: 1,
        lon: 1,
        startDateTime: {
          year: 2023,
          month: 1,
          day: 1,
          hour: 12,
          minute: 0,
        },
        endDateTime: {
          year: 2023,
          month: 1,
          day: 1,
          hour: 15,
          minute: 30,
        },
        reservationStatusId: 1000,
        isMonthly: false,
      };
      const results = await reservationController.reserveSpace(req, res);
      expect(results.status).toBe(400);
      expect(results.body).toEqual({ message: 'Invalid ID(s) provided.' });
    });
  });

  // reservationController.reserveSpace()
  describe('Reserve a guaranteed space', () => {
    let req, res;

    // Set mock request and response objects before each test
    beforeEach(async () => {
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
        lat: 1,
        lon: 1,
        startDateTime: {
          year: 2023,
          month: 1,
          day: 1,
          hour: 12,
          minute: 0,
        },
        endDateTime: null,
        reservationStatusId: 1,
        isMonthly: true,
      };
      const reservation = await reservationController.reserveSpace(req, res);
      expect(reservation.status).toBe(200);
      expect(reservation.body).not.toBe(null);
    });

    test('Starting datetime must be >= current datetime', async () => {
      req.body = {
        memberId: 1,
        reservationTypeId: 1,
        vehicleId: 1,
        garageId: 1,
        lat: 1,
        lon: 1,
        startDateTime: {
          year: 2020,
          month: 1,
          day: 1,
          hour: 12,
          minute: 0,
        },
        endDateTime: null,
        reservationStatusId: 1,
        isMonthly: true,
      };
      const results = await reservationController.reserveSpace(req, res);
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
        lat: 1,
        lon: 1,
        startDateTime: {
          year: 2023,
          month: 1,
          day: 1,
          hour: 12,
          minute: 0,
        },
        endDateTime: null,
        reservationStatusId: 1000,
        isMonthly: true,
      };
      const results = await reservationController.reserveSpace(req, res);
      expect(results.status).toBe(400);
      expect(results.body).toEqual({ message: 'Invalid ID(s) provided.' });
    });
  });

  // reservationController.findAvailable()
  describe('Find available garages', () => {
    // TODO
  });

  // reservationController.checkAvailability()
  describe('Check if a garage is available', () => {
    // TODO
  });

  // reservationController.timezone()
  describe('Get timezone from coordinates', () => {
    let lat, lon;

    test('New York, USA', async () => {
      lat = 40.73061;
      lon = -73.935242;
      const tz = await reservationController.timezone(lat, lon);
      expect(tz).toBe('America/New_York');
    });

    test('Taipei, Taiwan', async () => {
      lat = 25.105497;
      lon = 121.597366;
      const tz = await reservationController.timezone(lat, lon);
      expect(tz).toEqual('Asia/Taipei');
    });

    test('Addis Ababa, Ethiopia', async () => {
      lat = 9.005401;
      lon = 38.763611;
      const tz = await reservationController.timezone(lat, lon);
      expect(tz).toEqual('Africa/Addis_Ababa');
    });

    test('McMurdo Station, Antarctica', async () => {
      lat = -77.5047;
      lon = 166.4006;
      const tz = await reservationController.timezone(lat, lon);
      expect(tz).toEqual('Antarctica/McMurdo');
    });
  });

  // reservationController.timeFromLocal()
  describe('Set time in a given timezone', () => {
    const time = {
      year: 2030,
      month: 6,
      day: 15,
      hour: 12,
      minute: 0,
    };

    test('Taipei time', () => {
      const tz = 'Asia/Taipei';
      const res = reservationController.timeFromLocal(time, tz);
      expect(res.toUTCString()).toEqual('Sat, 15 Jun 2030 04:00:00 GMT');
    });

    test('UTC time', () => {
      const tz = 'Atlantic/Reykjavik';
      const res = reservationController.timeFromLocal(time, tz);
      expect(res.toUTCString()).toEqual('Sat, 15 Jun 2030 12:00:00 GMT');
    });

    test('Invalid time', () => {
      const tz = 'Nope/Nah';
      const res = reservationController.timeFromLocal('timeless', tz);
      expect(res).toBe(null);
    });
  });
});
