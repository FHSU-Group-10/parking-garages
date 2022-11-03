// LIBRARIES
const request = require('supertest');
const app = require('../../../app');

jest.setTimeout(30000);

describe('Pricing Route', () => {
  describe('Get pricing', () => {
    const url = '/pricing/getPricing';

    test('Valid query', async () => {
      const res = await request(app).get(url);
      console.log(res.body);
      expect(res.status).toBe(200);
      for (param in res.body) {
        expect(res.body[param]).not.toBe(null);
      }
    });
  });

  describe('Update pricing', () => {
    const url = '/pricing/updatePricing';

    test('Increment all prices', async () => {
      const existing = await request(app).get('/pricing/getPricing');
      const body = { price: { dailyMax: parseInt(existing.body[0].DAILY_MAX) + 1 } };

      existing.body.forEach((obj) => {
        body.price[`${obj.DESCRIPTION}Res`] = obj.DESCRIPTION;
        body.price[`${obj.DESCRIPTION}Cost`] = parseFloat(obj.COST) + 1;
      });

      const res = await request(app).post(url).send(body);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({});
    });

    test('Decrement all prices', async () => {
      const existing = await request(app).get('/pricing/getPricing');
      const body = { price: { dailyMax: parseInt(existing.body[0].DAILY_MAX) - 1 } };

      existing.body.forEach((obj) => {
        body.price[`${obj.DESCRIPTION}Res`] = obj.DESCRIPTION;
        body.price[`${obj.DESCRIPTION}Cost`] = parseFloat(obj.COST) - 1;
      });

      const res = await request(app).post(url).send(body);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({});
    });
  });

  describe('Create new pricing', () => {
    const url = '/pricing/createPricing';

    const body = {
      description: 'invalidPricing',
      cost: 5,
      dailyMax: 10,
      reservationTypeId: 1,
    };

    test('Incomplete request', async () => {
      const res = await request(app).post(url).send({});

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: 'Incomplete request' });
    });

    test('Reservation Type ID invalid', async () => {
      const res = await request(app)
        .post(url)
        .send({ ...body, reservationTypeId: 1000 });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: 'princingController: Reservation type id invalid' });
    });

    test('Duplicate: Reservation Type ID already used', async () => {
      const res = await request(app).post(url).send(body);

      expect(res.status).toBe(500);
    });
  });
});
