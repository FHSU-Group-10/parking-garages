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

    expect(resStatus).not.toBe(0);
  });
  test('Raw SQL query', async () => {
    // Select a single row, check if any rows exist
    const [results, metadata] = await sequelize.query('SELECT * FROM GARAGES LIMIT 1');
    console.log(results, metadata);
    expect(results).not.toBe(null);
  });

  test('Fix table', async () => {
    const query = sequelize.getQueryInterface();
    console.log(await query.describeTable({ tableName: 'GARAGES' }));
    /* const n = await Garage.create({
      DESCRIPTION: 'Test Garage',
      FLOOR_COUNT: 3,
      LAT: '1',
      LONG: '1',
      OVERBOOK_RATE: 1.1,
      IS_ACTIVE: true,
    }); */
    const n = sequelize.query('REORG TABLE YHL46872.GARAGES');
    console.log(n);
  });
});
