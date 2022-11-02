// Model to test
const connectDB = require('../../config/dbConn');
const sequelize = connectDB();
const { Pricing } = sequelize.models;

jest.setTimeout(10000);

describe('Pricing Model', () => {
  test('DB contains a record', async () => {
    // Query for a single row
    let pricing = await Pricing.findOne();

    expect(pricing).not.toBe(null);
  });
  test('Raw SQL query', async () => {
    const [results, metadata] = await sequelize.query('SELECT * FROM "g10"."PRICING" LIMIT 1');

    expect(results).not.toBe(null);
  });
});
