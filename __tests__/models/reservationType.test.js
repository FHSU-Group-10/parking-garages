// Model to test
const ReservationType = require('../../controllers/models/reservationType');

describe('ReservationType Model', () => {
  test('Connect to DB', async () => {
    // Test the connection
    const connect = async () => {
      try {
        await ReservationType.sequelize.authenticate();
        return true;
      } catch (err) {
        return false;
      }
    };
    const connected = await connect();

    expect(connected).toBe(true);
  });

  test('DB contains a record', async () => {
    // Query for a single row
    let resStatus = await ReservationType.findOne();

    expect(resStatus).not.toBe(null);
  });
});
