// init sequelize
const { Sequelize, DataTypes } = require('sequelize');
// ready our db connection function
const dbConn = require('../../config/dbConn');
const sequelize = dbConn();

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

module.exports = ReservationStatus;
