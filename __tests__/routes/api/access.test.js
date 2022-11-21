const request = require('supertest');
const app = require('../../../app');

jest.setTimeout(30000);

describe('Access Route', () => {
  const url = '/access';

  describe('Enter by license plate', () => {
    let reservation, plateNumber, plateState;

    beforeEach(() => {
      // TODO create a new reservation
    });

    test('TODO', async () => {
      const results = null;
      expect(results.status).toBe(200);
    });

    afterEach(() => {
      // TODO remove the reservation
    });
  });

  describe('Enter by reservation code', () => {
    let reservation, plateNumber, plateState, reservationCode;

    beforeEach(() => {
      // TODO create a new reservation
    });

    test('TODO', async () => {
      const results = null;
      expect(results.status).toBe(200);
    });

    afterEach(() => {
      // TODO remove the reservation
    });
  });
});
