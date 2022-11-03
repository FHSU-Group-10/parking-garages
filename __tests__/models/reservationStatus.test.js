// Model to test
const connectDB = require('../../config/dbConn');
const sequelize = connectDB();
const { ReservationStatus } = sequelize.models;

jest.setTimeout(10000);

describe('ReservationStatus Model', () => {
  test('DB contains a record', async () => {
    // Query for a single row
    let resStatus = await ReservationStatus.findOne();

    expect(resStatus).not.toBe(null);
  });
  test('Raw SQL query', async () => {
    const [results, metadata] = await sequelize.query('SELECT * FROM "g10"."RESERVATION_STATUS" LIMIT 1');

    expect(results).not.toBe(null);
  });
});
