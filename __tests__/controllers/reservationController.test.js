// Controller to test
const reservationController = require('../../controllers/reservationController');
// Requests to get pricing from route
const request = require('supertest');
const app = require('../../app');

jest.setTimeout(30000);

describe('Reservation Controller', () => {
  // reservationController.findAvailable()
  describe('Find available garages', () => {
    test('Valid single request succeeds', async () => {
      const res = await reservationController.findAvailable(
        1,
        1,
        10000,
        1,
        new Date(Date.now() + 86400000),
        new Date(Date.now() + 86400000 * 2),
        false,
        true
      );

      expect(res.length).toBeGreaterThan(0);
      const keys = Object.keys(res[0]);
      const expected = ['garageId', 'description', 'lat', 'lon', 'distance', 'price'];
      expect(keys).toEqual(expect.arrayContaining(expected));
    });

    test('Valid guaranteed request succeeds', async () => {
      const res = await reservationController.findAvailable(
        1,
        1,
        10000,
        1,
        new Date(Date.now() + 86400000),
        null,
        true,
        true
      );

      expect(res.length).toBeGreaterThan(0);
      const keys = Object.keys(res[0]);
      const expected = ['garageId', 'description', 'lat', 'lon', 'distance', 'price'];
      expect(keys).toEqual(expect.arrayContaining(expected));
    });

    test('Tiny search radius yields no results', async () => {
      const res = await reservationController.findAvailable(
        1,
        1,
        1,
        1,
        new Date(Date.now() + 86400000),
        new Date(Date.now() + 86400000 * 2),
        false,
        true
      );

      expect(res.length).toBe(0);
    });
  });

  // reservationController.calculatePrice()
  describe('Calculate reservation price', () => {
    let prices = [{}, {}, {}];

    beforeAll(async () => {
      const res = await request(app).get('/pricing/getPricing');
      // Ensure results are sorted by price ID
      res.body.forEach((entry) => {
        prices[entry.PRICING_ID] = entry;
      });
    });

    test('24 hours yields a single dailyMax price', async () => {
      const singleMax = prices[1].DAILY_MAX;
      const start = 0;
      const end = 86400000;
      const price = await reservationController.calculatePrice(start, end, 1);

      expect(price).toEqual(parseFloat(singleMax).toFixed(2));
    });

    test('25 hours yields a single dailyMax price + 2 periods', async () => {
      const singleMax = prices[1].DAILY_MAX;
      const rate = prices[1].COST;
      const start = 0;
      const end = 86400000 + 1800000 * 2;
      const price = await reservationController.calculatePrice(start, end, 1);

      expect(price).toEqual(parseFloat(singleMax + rate * 2).toFixed(2));
    });

    test('2 hours yields a single 4-period rate', async () => {
      const rate = prices[1].COST;
      const start = 0;
      const end = 1800000 * 4;
      const price = await reservationController.calculatePrice(start, end, 1);

      expect(price).toEqual(parseFloat(rate * 4).toFixed(2));
    });

    test('Monthly reservation returns the rate string', async () => {
      const rate = prices[2].COST;
      const start = 0;
      const end = 1;
      const price = await reservationController.calculatePrice(start, end, 2);

      expect(price).toEqual(`${rate} / month`);
    });
  });

  // reservationController.checkAvailability()
  describe('Check if a garage has available parking spaces', () => {
    test('Far in the future, where no reservation has gone before', async () => {
      const start = new Date('2100-02-14T18:00');
      const end = new Date('2100-02-14T22:00');
      const res = await reservationController.checkAvailability(4, 2, start, end, true, null);

      expect(res).toBe(true);
    });

    test('Permanent vacation', async () => {
      const start = new Date('2056-06-01T12:00');
      const res = await reservationController.checkAvailability(4, 2, start, null, true, null);

      expect(res).toBe(true);
    });
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
