const request = require('supertest');
const app = require('../../../app');

describe('Garage Route', () => {
  const url = '/garage';

  describe('List all garages', () => {
    test('Returns results', async () => {
      const results = await request(app).get(url);
      expect(results.status).toBe(200);
      expect(results.body.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Add a garage', () => {
    test('Valid request', async () => {
      const body = {
        name: 'SpotMe',
        location: 'Atlanta, GA',
        numFloors: 3,
        spotsPerFloor: [5, 5, 0],
        overbookRate: 1.5,
        isActive: true,
      };
      const result = await request(app).post(url).send(body);
      expect(result.status).toBe(200);
      expect(result.body).toEqual({ message: 'Garage created.' });
    });

    test('Invalid request', async () => {
      const result = await request(app).post(url).send({});
      expect(result.status).toBe(400);
      expect(result.body).toEqual({ message: 'Incomplete request.' });
    });
  });

  describe('Update a garage', () => {
    test('Valid request', async () => {
      const body = {
        garageId: 'garage1',
        name: 'SpotMe',
        numFloors: 3,
        spotsPerFloor: [5, 5, 0],
        overbookRate: 1.5,
        isActive: true,
      };
      const result = await request(app).patch(url).send(body);
      expect(result.status).toBe(200);
      expect(result.body).toEqual({ message: 'Garage updated.' });
    });

    test('Invalid request', async () => {
      const result = await request(app).patch(url).send({});
      expect(result.status).toBe(400);
      expect(result.body).toEqual({ message: 'Incomplete request.' });
    });
  });

  describe('Delete a garage', () => {
    test('Valid request', async () => {
      const body = {
        garageId: 'garage1',
      };
      const result = await request(app).delete(url).send(body);
      expect(result.status).toBe(200);
      expect(result.body).toEqual({ message: 'Garage deleted.' });
    });

    test('Invalid request', async () => {
      const result = await request(app).delete(url).send({});
      expect(result.status).toBe(400);
      expect(result.body).toEqual({ message: 'garageId is required.' });
    });
  });
});
