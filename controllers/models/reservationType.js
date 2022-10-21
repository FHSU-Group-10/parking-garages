// init sequelize
const { DataTypes } = require('sequelize');
// ready our db connection function
const dbConn = require('../../config/dbConn');
const sequelize = dbConn();

// Models to link with relations to ReservationType
const Reservation = require('./reservation');

const ReservationType = sequelize.define(
  'ReservationType',
  {
    RESERVATION_TYPE_ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    DESCRIPTION: {
      type: DataTypes.STRING(64),
      allowNull: false,
      field: 'DESCRIPTION',
    },
  },
  {
    tableName: 'RESERVATION_TYPE',
    timestamps: false,
    schema: 'YHL46872',
    initialized: true,
  }
);

// Create the relations to other tables (ReservationType has no FKs)
ReservationType.hasMany(Reservation);

module.exports = ReservationType;
