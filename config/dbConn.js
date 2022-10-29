// Needed here to simplify writing unit tests for models
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const addModels = require('../controllers/models/index');
const addRelations = require('./modelRelations');

// Create sequelize instance with DB connection
const connStr = `postgres://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST_NAME}:${process.env.DB_PORT}/${process.env.DB_NAME}?ssl=true`;
const sequelize = new Sequelize(connStr);

// Test connection, since this only runs once at startup
/* const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB!');
  } catch (err) {
    console.log('Could not connect to DB.');
  }
};
testConnection(); */

// Initialize all models
addModels(sequelize, DataTypes);

// Create all foreign keys here after models are attached
addRelations(sequelize);

// Returns the sequelize instance with all models attached and all foreign keys established
const connectDB = () => {
  return sequelize;
};

module.exports = connectDB;
