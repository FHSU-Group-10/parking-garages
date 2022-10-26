// Model to test
const connectDB = require('../../config/dbConn');
const sequelize = connectDB();
const { Floor } = sequelize.models;

jest.setTimeout(10000);

describe('Floor Model', () => {
  test('DB contains a record', async () => {
    // Query for a single row
    let resStatus = await Floor.findOne();

    expect(resStatus).not.toBe(null);
  });
  test('Raw SQL query', async () => {
    const [results, metadata] = await sequelize.query(
      'SELECT * FROM FLOOR LIMIT 1'
    );

    expect(results).not.toBe(null);
  });
});
