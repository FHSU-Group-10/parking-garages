// Model to test
const connectDB = require('../../config/dbConn');
const sequelize = connectDB();
const { Garage } = sequelize.models;

jest.setTimeout(10000);

describe('Garage Model', () => {
  test('DB contains a record', async () => {
    // Query all garages
    let garages = await Garage.count();

    console.log('# of garages:  ', garages);

    expect(garages).not.toBe(0);
  });
  test('Raw SQL query', async () => {
    // Select a single row, check if any rows exist
    const [results, metadata] = await sequelize.query('SELECT * FROM "g10"."GARAGES" LIMIT 1');

    expect(results).not.toBe(null);
  });
});
