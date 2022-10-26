// Model to test
const connectDB = require('../../config/dbConn');
const sequelize = connectDB();
const { ReservationType } = sequelize.models;

jest.setTimeout(10000);

describe('ReservationType Model', () => {
  test('DB contains a record', async () => {
    // Query for a single row
    let resStatus = await ReservationType.findOne();

    expect(resStatus).not.toBe(null);
  });
  test('Raw SQL query', async () => {
    const [results, metadata] = await sequelize.query(
      'SELECT * FROM RESERVATION_TYPE LIMIT 1'
    );

    expect(results).not.toBe(null);
  });
});
