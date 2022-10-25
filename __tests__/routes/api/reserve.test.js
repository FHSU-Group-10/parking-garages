// LIBRARIES
const request = require('supertest');
const app = require('../../../app');

jest.setTimeout(10000);

describe('Reserve Route', () => {
  describe('Search Single Space', () => {
    test('Valid query', async () => {
      const body = {
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

      const res = await request(app).post('/reserve/search').send(body);
      expect(res.status).toBe(200);
      expect(res.body).toEqual([
        {
          garageId: 1,
          description: 'ParkingSpaceX',
          lat: 0,
          lon: 0,
          timezone: 'America/New_York',
          price: 16.75,
          rate: 'hour',
          distance: 500,
        },
        {
          garageId: 2,
          description: 'GarageBrand',
          lat: 1,
          lon: 1,
          timezone: 'America/New_York',
          price: 12.5,
          rate: '30 min',
          distance: 3000,
        },
      ]);
    });

    test('Incomplete query', async () => {
      const res = await request(app).post('/reserve/search').send({});
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: 'Incomplete query.' });
    });
  });

  describe('Search Guaranteed Space', () => {
    test('Valid query', async () => {
      const params = {
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

      const res = await request(app).post('/reserve/search').send(params);
      expect(res.status).toBe(200);
      expect(res.body).toEqual([
        {
          garageId: 1,
          description: 'ParkingSpaceX',
          lat: 0,
          lon: 0,
          timezone: 'America/New_York',
          price: 16.75,
          rate: 'hour',
          distance: 500,
        },
        {
          garageId: 2,
          description: 'GarageBrand',
          lat: 1,
          lon: 1,
          timezone: 'America/New_York',
          price: 12.5,
          rate: '30 min',
          distance: 3000,
        },
      ]);
    });

    test('Incomplete query', async () => {
      const res = await request(app).post('/reserve/search').send({});
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: 'Incomplete query.' });
    });
  });

  describe('Reserve Single Space', () => {
    test('Valid query', async () => {
      const body = {
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

      const res = await request(app).post('/reserve').send(body);
      expect(res.status).toBe(200);
    });

    test('Invalid query', async () => {
      const body = {
        nothing: null,
      };

      const res = await request(app).post('/reserve').send(body);
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: 'Incomplete request.' });
    });
  });

  describe('Reserve Guaranteed Space', () => {
    test('Valid query', async () => {
      const body = {
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

      const res = await request(app).post('/reserve').send(body);
      expect(res.status).toBe(200);
    });

    test('Invalid query', async () => {
      const body = {
        nothing: null,
      };

      const res = await request(app).post('/reserve').send(body);
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: 'Incomplete request.' });
    });
  });
});
