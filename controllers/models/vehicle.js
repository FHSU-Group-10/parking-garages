// init sequelize
const { DataTypes } = require('sequelize');
// ready our db connection function
const dbConn = require('../../config/dbConn');
const sequelize = dbConn();

// TODO User model must be linked to Vehicle
// const User = require('./user');

const Vehicle = sequelize.define(
  'Vehicle',
  {
    VEHICLE_ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    DESCRIPTION: {
      type: DataTypes.STRING(64),
      allowNull: true,
      field: 'DESCRIPTION',
    },
    PLATE_NUMBER: {
      type: DataTypes.STRING(16),
      allowNull: false,
      field: 'PLATE_NUMBER',
    },
    PLATE_STATE: {
      type: DataTypes.STRING(16),
      allowNull: false,
      field: 'PLATE_STATE',
    },
    IS_ACTIVE: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'IS_ACTIVE',
    },
  },
  {
    tableName: 'VEHICLES',
    timestamps: false,
    schema: 'YHL46972',
    initialized: true,
  }
);

// TODO Cannot pass model correctly from async model definition
// Create relation to User
Vehicle.belongsTo(User, {
  foreignKey: {
    name: 'MEMBER_ID',
    allowNull: false,
  },
});

module.exports = Vehicle;
