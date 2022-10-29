// Model to test
const connectDB = require('../../config/dbConn');
const sequelize = connectDB();
const { Reservation } = sequelize.models;

jest.setTimeout(10000);

describe('Reservation Model', () => {
  test('DB contains a record', async () => {
    // Query for a single row
    let reservation = await Reservation.findOne();

    expect(reservation).not.toBe(null);
  });
  test('Raw SQL query', async () => {
    const [results, metadata] = await sequelize.query('SELECT * FROM "g10"."RESERVATIONS" LIMIT 1');

    expect(results).not.toBe(null);
  });
});
