// LIBRARIES
const request = require('supertest');
const app = require('../../../app');

describe('Pricing Route', () => {
  describe('Get pricing for a garage', () => {
    const url = (query) => {
      return `/pricing?garageId=${query.garageId}`;
    };

    test('Valid query', async () => {
      const query = url({
        garageId: 'garage1',
      });

      const res = await request(app).get(query);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        reserveHourly: 10.5,
        contractHourly: 8.0,
        walkinHourly: 15.99,
      });
    });

    test('Invalid query', async () => {
      const query = url({
        garageId: '',
      });

      const res = await request(app).get(query);
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: 'garageId is required.' });
    });
  });

  describe('Update pricing for a garage', () => {
    const url = '/pricing';

    test('Valid query', async () => {
      const body = {
        garageId: 'garage1',
        priceType: 'reserveHourly',
        newPrice: 12.5,
      };

      const res = await request(app).patch(url).send(body);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Pricing updated.' });
    });

    test('Invalid query', async () => {
      const body = {
        garageId: null,
        priceType: null,
        newPrice: null,
      };

      const res = await request(app).patch(url).send(body);
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: 'Incomplete request' });
    });
  });
});
