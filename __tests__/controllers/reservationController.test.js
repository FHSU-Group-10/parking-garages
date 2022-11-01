// Controller to test
const reservationController = require('../../controllers/reservationController');

jest.setTimeout(20000);

describe('Reservation Controller', () => {
  // reservationController.findAvailable()
  describe('Find available garages', () => {
    // TODO
  });

  // reservationController.calculatePrice()
  describe('Calculate reservation price', () => {
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
