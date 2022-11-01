// LIBRARIES
const request = require('supertest');
const app = require('../../../app');

jest.setTimeout(10000);

describe('Reserve Route', () => {
  describe('Search Single Space', () => {
    // Shared object for requests
    let options;

    beforeEach(() => {
      options = {
        lat: 1, // The search location. Defaults to center of the US.
        lon: 1,
        radius: null,
        startDateTime: null,
        endDateTime: null,
        reservationTypeId: 1,
        isMonthly: false,
        useFakeLocations: true, // Flag to generate fake locations
      };
    });
    test('Valid query succeeds', async () => {
      options.radius = 10000;
      options.startDateTime = {
        year: 2023,
        month: 1,
        day: 1,
        hour: 12,
        minute: 0,
      };
      options.endDateTime = {
        year: 2023,
        month: 1,
        day: 1,
        hour: 15,
        minute: 30,
      };

      const res = await request(app).post('/reserve/search').send(options);

      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      const keys = Object.keys(res.body[0]);
      const expected = ['garageId', 'description', 'lat', 'lon', 'distance', 'price'];
      expect(keys).toEqual(expect.arrayContaining(expected));
    });

    test('Incomplete query fails', async () => {
      const res = await request(app).post('/reserve/search').send({});
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: 'Incomplete query.' });
    });

    test('Starting datetime must be before ending datetime', async () => {
      options.radius = 10000;
      options.startDateTime = {
        year: 2023,
        month: 12,
        day: 1,
        hour: 12,
        minute: 0,
      };
      options.endDateTime = {
        year: 2023,
        month: 1,
        day: 1,
        hour: 15,
        minute: 30,
      };

      const res = await request(app).post('/reserve/search').send(options);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: 'Invalid date or time.' });
    });

    test('Starting datetime must be >= current datetime', async () => {
      options.radius = 10000;
      options.startDateTime = {
        year: 2022,
        month: 1,
        day: 1,
        hour: 12,
        minute: 0,
      };
      options.endDateTime = {
        year: 2023,
        month: 1,
        day: 1,
        hour: 15,
        minute: 30,
      };

      const res = await request(app).post('/reserve/search').send(options);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: 'Invalid date or time.' });
    });
  });

  describe('Search Guaranteed Space', () => {
    // Shared object for requests
    let options;

    beforeEach(() => {
      options = {
        lat: 1, // The search location. Defaults to center of the US.
        lon: 1,
        radius: null,
        startDateTime: null,
        reservationTypeId: 2,
        isMonthly: true,
        useFakeLocations: true, // Flag to generate fake locations
      };
    });
    test('Valid query succeeds', async () => {
      options.radius = 10000;
      options.startDateTime = {
        year: 2023,
        month: 1,
        day: 1,
        hour: 12,
        minute: 0,
      };

      const res = await request(app).post('/reserve/search').send(options);

      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      const keys = Object.keys(res.body[0]);
      const expected = ['garageId', 'description', 'lat', 'lon', 'distance', 'price'];
      expect(keys).toEqual(expect.arrayContaining(expected));
    });

    test('Incomplete query fails', async () => {
      const res = await request(app).post('/reserve/search').send({});
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: 'Incomplete query.' });
    });

    test('Starting datetime must be >= current datetime', async () => {
      options.radius = 10000;
      options.startDateTime = {
        year: 2022,
        month: 1,
        day: 1,
        hour: 12,
        minute: 0,
      };

      const res = await request(app).post('/reserve/search').send(options);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: 'Invalid date or time.' });
    });
  });

  describe('Reserve Single Space', () => {
    let options;

    beforeEach(() => {
      options = {
        memberId: 1,
        reservationTypeId: 1,
        vehicleId: null,
        garageId: 1,
        lat: 1,
        lon: 1,
        startDateTime: null,
        endDateTime: null,
        reservationStatusId: null,
        isMonthly: false,
      };
    });

    test('Complete request succeeds', async () => {
      options.startDateTime = {
        year: 2024,
        month: 6,
        day: 6,
        hour: 0,
        minute: 0,
      };
      options.endDateTime = {
        year: 2024,
        month: 6,
        day: 6,
        hour: 6,
        minute: 30,
      };

      const res = await request(app).post('/reserve').send(options);
      expect(res.status).toBe(200);
    });

    test('Incomplete request fails', async () => {
      const res = await request(app).post('/reserve').send(options);
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: 'Incomplete request.' });
    });

    test('Starting datetime must be before ending datetime', async () => {
      options.startDateTime = {
        year: 2025,
        month: 6,
        day: 6,
        hour: 0,
        minute: 0,
      };
      options.endDateTime = {
        year: 2024,
        month: 6,
        day: 6,
        hour: 6,
        minute: 30,
      };

      const res = await request(app).post('/reserve').send(options);
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        message: 'Invalid date or time.',
      });
    });

    test('Starting datetime must be >= current datetime', async () => {
      options.startDateTime = {
        year: 2020,
        month: 6,
        day: 6,
        hour: 0,
        minute: 0,
      };
      options.endDateTime = {
        year: 2024,
        month: 6,
        day: 6,
        hour: 6,
        minute: 30,
      };

      const res = await request(app).post('/reserve').send(options);
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        message: 'Invalid date or time.',
      });
    });

    test('FKs must be valid PKs in their respective tables', async () => {
      (options.memberId = 1000),
        (options.reservationTypeId = 1000),
        (options.vehicleId = 1000),
        (options.garageId = 1000),
        (options.startDateTime = {
          year: 2024,
          month: 6,
          day: 6,
          hour: 0,
          minute: 0,
        });
      options.endDateTime = {
        year: 2024,
        month: 6,
        day: 6,
        hour: 6,
        minute: 30,
      };

      const res = await request(app).post('/reserve').send(options);
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        message: 'Invalid ID(s) provided.',
      });
    });
  });

  describe('Reserve Guaranteed Space', () => {
    let options;

    beforeEach(() => {
      options = {
        memberId: 1,
        reservationTypeId: 1,
        vehicleId: null,
        garageId: 1,
        lat: 1,
        lon: 1,
        startDateTime: null,
        endDateTime: null,
        reservationStatusId: null,
        isMonthly: true,
      };
    });

    test('Complete request succeeds', async () => {
      options.startDateTime = {
        year: 2024,
        month: 6,
        day: 6,
        hour: 0,
        minute: 0,
      };

      const res = await request(app).post('/reserve').send(options);
      expect(res.status).toBe(200);
    });

    test('Incomplete request fails', async () => {
      const res = await request(app).post('/reserve').send(options);
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: 'Incomplete request.' });
    });

    test('Starting datetime must be >= current datetime', async () => {
      options.startDateTime = {
        year: 2020,
        month: 6,
        day: 6,
        hour: 0,
        minute: 0,
      };

      const res = await request(app).post('/reserve').send(options);
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        message: 'Invalid date or time.',
      });
    });

    test('FKs must be valid PKs in their respective tables', async () => {
      options.memberId = 1000;
      options.reservationTypeId = 1000;
      options.vehicleId = 1000;
      options.garageId = 1000;
      options.startDateTime = {
        year: 2024,
        month: 6,
        day: 6,
        hour: 0,
        minute: 0,
      };

      const res = await request(app).post('/reserve').send(options);
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        message: 'Invalid ID(s) provided.',
      });
    });
  });
});
