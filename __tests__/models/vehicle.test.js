// Model to test
const Vehicle = require('../../controllers/models/vehicle');

describe('Vehicle Model', () => {
  test('Connect to DB', async () => {
    // Test the connection
    const connect = async () => {
      try {
        await Vehicle.sequelize.authenticate();
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
    let resStatus = await Vehicle.findOne();

    expect(resStatus).not.toBe(null);
  });
});
