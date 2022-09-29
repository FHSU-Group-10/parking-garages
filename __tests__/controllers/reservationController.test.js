const reservationController = require('../../controllers/reservationController');

describe('Search for a single space', () => {
  test('Fake searchSpace() test', async () => {
    const results = await reservationController.searchSpace();
    expect(results).not.toEqual([]);
  });
});

describe('Search for a guaranteed space', () => {
  test('Fake searchGuaranteedSpace() test', async () => {
    const results = await reservationController.searchGuaranteedSpace();
    expect(results).not.toEqual([]);
  });
});

describe('Reserve a single space', () => {
  test('Fake reserveSpace() test', async () => {
    const reservation = await reservationController.reserveSpace();
    expect(results).not.toEqual({});
  });
});

describe('Reserve a guaranteed space', () => {
  test('Fake reserveGuaranteedSpace() test', async () => {
    const reservation = await reservationController.reserveGuaranteedSpace();
    expect(results).not.toEqual({});
  });
});
