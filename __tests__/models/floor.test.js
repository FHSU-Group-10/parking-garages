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
    const [results, metadata] = await sequelize.query('SELECT * FROM "g10"."FLOORS" LIMIT 1');

    expect(results).not.toBe(null);
  });
  /* test('Create a floor', async () => {
    let res = await Floor.create({
      FLOOR_NUM: 1,
      SPACE_COUNT: 10,
      GARAGE_ID: 1,
    });

    expect(res).not.toBe(null);
  }); */
});
