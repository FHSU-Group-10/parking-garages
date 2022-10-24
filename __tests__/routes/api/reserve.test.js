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
        startDateTime: new Date(2025, 0, 1, 12, 0),
        endDateTime: new Date(2025, 0, 1, 15, 30),
      };

      const res = await request(app).post('/reserve/search/single').send(body);
      expect(res.status).toBe(200);
      expect(res.body).toEqual([
        {
          garageId: 101,
          description: 'ParkingSpaceX',
          lat: 0,
          lon: 0,
          timezone: 'America/New_York',
          price: 16.75,
          rate: 'hour',
        },
        {
          garageId: 102,
          description: 'GarageBrand',
          lat: 1,
          lon: 1,
          timezone: 'America/New_York',
          price: 12.5,
          rate: '30 min',
        },
      ]);
    });

    test('Incomplete query', async () => {
      const res = await request(app).post('/reserve/search/single').send({});
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
        startDateTime: new Date(2025, 0, 1, 12, 0),
      };

      const res = await request(app)
        .post('/reserve/search/guaranteed')
        .send(params);
      expect(res.status).toBe(200);
      expect(res.body).toEqual([
        {
          garageId: 101,
          description: 'ParkingSpaceX',
          lat: 0,
          lon: 0,
          timezone: 'America/New_York',
          price: 16.75,
          rate: 'hour',
        },
        {
          garageId: 102,
          description: 'GarageBrand',
          lat: 1,
          lon: 1,
          timezone: 'America/New_York',
          price: 12.5,
          rate: '30 min',
        },
      ]);
    });

    test('Incomplete query', async () => {
      const res = await request(app)
        .post('/reserve/search/guaranteed')
        .send({});
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
        startDateTime: new Date(2025, 0, 1, 12, 0),
        endDateTime: new Date(2025, 0, 1, 15, 30),
        spotNumber: null,
        reservationStatusId: 1,
        extraGrace: false,
      };

      const res = await request(app).post('/reserve/single').send(body);
      expect(res.status).toBe(200);
    });

    test('Invalid query', async () => {
      const body = {
        garageId: null,
        startDateTime: null,
        endDateTime: null,
        frequency: null,
        customerId: null,
        vehicle: null,
      };

      const res = await request(app).post('/reserve/single').send(body);
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
        startDateTime: new Date(2025, 0, 1, 12, 0),
        endDateTime: null,
        spotNumber: null,
        reservationStatusId: 1,
        extraGrace: false,
      };

      const res = await request(app).post('/reserve/guaranteed').send(body);
      expect(res.status).toBe(200);
    });

    test('Invalid query', async () => {
      const body = {
        garageId: null,
        startDate: null,
        endDate: null,
        startTime: null,
        endTime: null,
        frequency: null,
        customerId: null,
        vehicle: null,
      };

      const res = await request(app).post('/reserve/single').send(body);
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: 'Incomplete request.' });
    });
  });
});
