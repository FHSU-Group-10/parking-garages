const fs = require('fs');
const path = require('path');

// Automatically get all models from folder and initialize
// Adapted from https://stackoverflow.com/questions/62556633/sequelize-6-import-models-from-file

const addModels = (sequelize, DataTypes) => {
  try {
    // Get the name of this file
    const thisFile = path.basename(__filename);

    // Get all model definers from this (models) folder
    const modelDefiners = [];

    fs.readdirSync(__dirname)
      .filter(
        (file) =>
          file.indexOf('.') !== 0 &&
          file !== thisFile &&
          file.slice(-3) === '.js'
      )
      .forEach((file) => {
        modelDefiners.push(require(path.join(__dirname, file)));
      });

    // Initialize each module
    modelDefiners.forEach((modelDefiner) => {
      modelDefiner(sequelize, DataTypes);
    });

    // All models should now be attached to the sequelize instance passed into the function
    console.log('Models initialized');
  } catch (error) {
    console.log('Failed to initialize models.');
  }
};

module.exports = addModels;
