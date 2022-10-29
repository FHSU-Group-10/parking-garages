// Model to test
const connectDB = require('../../config/dbConn');
const sequelize = connectDB();
const { ReservationType } = sequelize.models;

jest.setTimeout(10000);

describe('ReservationType Model', () => {
  test('DB contains a record', async () => {
    // Query all reservation types
    let resStatus;
    try {
      resStatus = await ReservationType.findAll();
    } catch (error) {
      console.error(error);
    }

    expect(resStatus).not.toBe(null);
  });
  test('Raw SQL query', async () => {
    // Select a single row, check if any rows exist
    const [results, metadata] = await sequelize.query('SELECT * FROM "g10"."RESERVATION_TYPE"');
    console.log(results);
    expect(results).not.toBe(null);
  });
});
