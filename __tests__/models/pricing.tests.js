// Model to test
const connectDB = require('../../config/dbConn');
const sequelize = connectDB();
const { Pricing } = sequelize.models;

describe('Pricing Model', () => {
    test('DB contains a record', async () => {
        // Query for a single row
        let Pricing = await Pricing.findOne();

        expect(Pricing).not.toBe(null);
    });
    test('Raw SQL query', async () => {
        const [results, metadata] = await sequelize.query(
            'SELECT * FROM PRICING LIMIT 1'
        );

        expect(results).not.toBe(null);
    });
});