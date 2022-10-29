// Model to test
const connectDB = require('../../config/dbConn');
const sequelize = connectDB();
const { Users } = sequelize.models;

jest.setTimeout(10000);

describe('User Model', () => {
  test('DB contains a record', async () => {
    // Query for a single row
    let users = await Users.count();

    expect(users).not.toBe(0);
  });
  test('Raw SQL query', async () => {
    const [results, metadata] = await sequelize.query('SELECT * FROM "g10"."USERS" LIMIT 1');
    //console.log(results);
    expect(results).not.toBe(null);
  });
});
