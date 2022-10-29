// Model to test
const connectDB = require('../../config/dbConn');
const sequelize = connectDB();
const { ReservationType } = sequelize.models;

jest.setTimeout(10000);

describe('ReservationType Model', () => {
  test('DB contains a record', async () => {
    // Query all reservation types
    let types = [];
    let resStatus = await ReservationType.findAll({ attributes: ['RESERVATION_TYPE_ID', 'DESCRIPTION'] });

    // All values are fixed and should not change
    expect(resStatus).not.toBe(null);
    expect(resStatus[0].dataValues.RESERVATION_TYPE_ID).toBe(1);
    expect(resStatus[1].dataValues.RESERVATION_TYPE_ID).toBe(2);
    expect(resStatus[2].dataValues.RESERVATION_TYPE_ID).toBe(3);
    expect(resStatus[0].dataValues.DESCRIPTION).toEqual('single');
    expect(resStatus[1].dataValues.DESCRIPTION).toEqual('guaranteed');
    expect(resStatus[2].dataValues.DESCRIPTION).toEqual('walkIn');
  });
  test('Raw SQL query', async () => {
    // Select a single row, check if any rows exist
    const [results, metadata] = await sequelize.query('SELECT * FROM RESERVATION_TYPE LIMIT 1');

    expect(results).not.toBe(null);
  });
});
