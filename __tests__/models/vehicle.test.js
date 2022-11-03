// Model to test
const connectDB = require('../../config/dbConn');
const sequelize = connectDB();
const { Vehicle } = sequelize.models;

jest.setTimeout(10000);

describe('Vehicle Model', () => {
  test('DB contains a record', async () => {
    // Query for a single row
    let vehicle = await Vehicle.findOne();

    expect(vehicle).not.toBe(null);
  });
  test('Raw SQL query', async () => {
    const [results, metadata] = await sequelize.query('SELECT * FROM "g10"."VEHICLES" LIMIT 1');

    expect(results).not.toBe(null);
  });
});
