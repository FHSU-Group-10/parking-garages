describe('Search for a single space', () => {
  test('Fake test', () => {
    expect(true).toBe(true);
  });
});

describe('Search for a guaranteed space', () => {
  test('Fake test', () => {
    expect(false).toBe(false);
  });
});

describe('Reserve a single space', () => {
  test('Fake test', () => {
    expect(1).toEqual(1);
  });
});

describe('Reserve a guaranteed space', () => {
  test('Fake test', () => {
    expect(0).not.toEqual(1);
  });
});
