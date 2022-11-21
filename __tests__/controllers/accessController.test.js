// Controller to test
const accessController = require('../../controllers/accessController');

jest.setTimeout(10000);

describe('Access Controller', () => {
  describe('reservationSearch', () => {
    beforeEach(() => {});

    test('TODO', async () => {
      const results = null;
      expect(true).toBe(false);
    });
  });

  describe('reservationCodeSearch', () => {
    test('TODO', async () => {
      expect(true).toBe(false);
    });
  });

  describe('updateState', () => {
    test('TODO', () => {
      expect(true).toBe(false);
    });
  });

  describe('assignSpace', () => {
    let reservation;

    beforeEach(() => {
      reservation = {};
    });
    test('TODO', async () => {
      expect(true).toBe(false);
    });
  });

  describe('callElevator', () => {
    test('Function exists', async () => {
      accessController.callElevator();
      expect(true).toBe(true);
    });
  });
});
