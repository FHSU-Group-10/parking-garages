// LIBRARIES
const request = require('supertest');
const app = require('../../../app');

describe('Reserve Route', () => {
  describe('Search Single Space', () => {
    const url = (query) => {
      return `/reserve/single?street=${query.street}&city=${query.city}&state=${query.state}&zip=${query.zip}&startDateTime=${query.startDateTime}&endDateTime=${query.endDateTime}&reservationTypeId=${query.reservationTypeId}`;
    };

    test('Valid query', async () => {
      const query = url({
        street: '206 Washington St SW',
        city: 'Atlanta',
        state: 'GA',
        zip: '30334',
        startDateTime: new Date(2025, 0, 1, 12, 0),
        endDateTime: new Date(2025, 0, 1, 15, 30),
        reservationTypeId: 1,
      });

      const res = await request(app).get(query);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(['garage1', 'garage2']);
    });

    test('Incomplete query', async () => {
      const query = '/reserve/single/?street=123 Easy St';
      const res = await request(app).get(query);
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: 'Incomplete query' });
    });
  });

  describe('Search Guaranteed Space', () => {
    const url = (query) => {
      return `/reserve/single?street=${query.street}&city=${query.city}&state=${query.state}&zip=${query.zip}&startDateTime=${query.startDateTime}&endDateTime=${query.endDateTime}&reservationTypeId=${query.reservationTypeId}`;
    };

    test('Valid query', async () => {
      const query = url({
        memberId: 123,
        reservationTypeId: 2,
        vehicleId: 456,
        garageId: 789,
        startDateTime: new Date(2025, 0, 1, 12, 0),
        endDateTime: new Date(2025, 0, 1, 15, 30),
        spotNumber: null,
        reservationStatusId: null,
        extraGrace: false,
      });

      const res = await request(app).get(query);
      expect(res.body).toEqual(['garage1', 'garage2']);
      expect(res.status).toBe(200);
    });

    test('Invalid query', async () => {
      const query = '/reserve/guaranteed/?street=123 Easy St';

      const res = await request(app).get(query);
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: 'Incomplete query' });
    });
  });

  describe('Reserve Single Space', () => {
    test('Valid query', async () => {
      const body = {
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

      const res = await request(app).post('/reserve/single').send(body);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Reservation complete!' });
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
      expect(res.body).toEqual({ message: 'Incomplete request' });
    });
  });

  describe('Reserve Guaranteed Space', () => {
    test('Valid query', async () => {
      const body = {
        memberId: 123,
        reservationTypeId: 2,
        vehicleId: 456,
        garageId: 789,
        startDateTime: new Date(2025, 0, 1, 12, 0),
        endDateTime: new Date(2025, 0, 1, 15, 30),
        spotNumber: null,
        reservationStatusId: null,
        extraGrace: false,
      };

      const res = await request(app).post('/reserve/guaranteed').send(body);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Reservation complete!' });
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
      expect(res.body).toEqual({ message: 'Incomplete request' });
    });
  });
});
