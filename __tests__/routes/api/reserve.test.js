// LIBRARIES
const request = require('supertest');
const app = require('../../../app');

describe('Reserve Route', () => {
  describe('Search Single Space', () => {
    const url = (query) => {
      return `/reserve/single?location=${query.location}&startDateTime=${query.startDateTime}&endDateTime=${query.endDateTime}`;
    };

    test('Valid query', async () => {
      const query = url({
        location: 'a',
        startDateTime: 1,
        endDateTime: 2,
      });

      const res = await request(app).get(query);
      expect(res.status).toBe(200);
      expect(res.body).toEqual(['garage1', 'garage2']);
    });

    test('Incomplete query', async () => {
      const query = url({
        location: '',
        startDateTime: 1,
        endDateTime: 2,
      });

      const res = await request(app).get(query);
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: 'Incomplete query' });
    });
  });

  describe('Search Guaranteed Space', () => {
    const url = (query) => {
      return `/reserve/guaranteed?location=${query.location}&startDate=${query.startDate}&endDate=${query.endDate}&startTime=${query.startTime}&endTime=${query.endTime}&frequency=${query.frequency}`;
    };

    test('Valid query', async () => {
      const query = url({
        location: 'a',
        startDate: 1,
        endDate: 2,
        startTime: 100,
        endTime: 200,
        frequency: 'Daily',
      });

      const res = await request(app).get(query);
      expect(res.status).toBe(200);
      expect(res.body).toEqual(['garage1', 'garage2']);
    });

    test('Invalid query', async () => {
      const query = url({
        location: '',
        startDate: 1,
        endDate: 2,
        startTime: 100,
        endTime: 200,
        frequency: 'Daily',
      });

      const res = await request(app).get(query);
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: 'Incomplete query' });
    });
  });

  describe('Reserve Single Space', () => {
    test('Valid query', async () => {
      const body = {
        garageId: 123,
        startDateTime: 1,
        endDateTime: 2,
        frequency: 'Daily',
        customerId: 456,
        vehicle: null,
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
        garageId: 123,
        startDate: 1,
        endDate: 2,
        startTime: 100,
        endTime: 200,
        frequency: 'Daily',
        customerId: 456,
        vehicle: null,
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
