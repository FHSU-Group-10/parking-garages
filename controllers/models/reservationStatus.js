// init sequelize
const { DataTypes } = require('sequelize');
// ready our db connection function
const dbConn = require('../../config/dbConn');
const sequelize = dbConn();

// Models to link with relations to ReservationStatus
const Reservation = require('./reservation');

const ReservationStatus = sequelize.define(
  'ReservationStatus',
  {
    STATUS_ID: {
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
    tableName: 'RESERVATION_STATUS',
    timestamps: false,
    schema: 'YHL46872',
    initialized: true,
  }
);

// Create the relations to other tables (ReservationStatus has no FKs)
ReservationStatus.hasMany(Reservation);

module.exports = ReservationStatus;
