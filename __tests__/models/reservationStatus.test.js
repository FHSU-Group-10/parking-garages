// Model to test
const ReservationStatus = require('../../controllers/models/reservationStatus');

describe('ReservationStatus Model', () => {
  test('Connect to DB', async () => {
    // Test the connection
    const connect = async () => {
      try {
        await ReservationStatus.sequelize.authenticate();
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
    let resStatus = await ReservationStatus.findOne();

    expect(resStatus).not.toBe(null);
  });
});
