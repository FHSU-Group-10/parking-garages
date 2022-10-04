const { Sequelize } = require('sequelize');

const connectDB = async () => {
  try {
    console.log('Attempting to connect to DB...');

    const sequelize = new Sequelize({
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST_NAME,
      port: process.env.DB_PORT,
      dialect: 'db2',
      //ssl: '',
    });

    await sequelize.authenticate();
    console.log('Connected to DB.');
  } catch (error) {
    console.error('Failed to connect to DB. ', error);
  }
};

module.exports = connectDB;
