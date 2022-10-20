// Model to test
const Reservation = require('../../controllers/models/reservation');

describe('Reservation Model', () => {
  test('Connect to DB', async () => {
    // Test the connection
    const connect = async () => {
      try {
        await Reservation.sequelize.authenticate();
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
    let resStatus = await Reservation.findOne();

    expect(resStatus).not.toBe(null);
  });
});
