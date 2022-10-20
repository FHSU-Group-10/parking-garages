// init sequelize
const { Sequelize, DataTypes } = require('sequelize');
// ready our db connection function
const dbConn = require('../../config/dbConn');
const sequelize = dbConn();

const Reservation = sequelize.define(
  'Reservation',
  {
    RESERVATION_ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    MEMBER_ID: {
      type: DataTypes.INTEGER, // TODO FK relation
      allowNull: false,
      field: 'MEMBER_NAME', // db graph has name, should be ID
    },
    RESERVATION_TYPE_ID: {
      // TODO fk relation
      allowNull: false,
    },
    VEHICLE_ID: {
      // TODO fk relation
      allowNull: true,
    },
    START_TIME: {
      allowNull: false,
      field: 'START_TIME',
    },
    END_TIME: {
      allowNull: true,
      field: 'END_TIME',
    },
    DATE_CREATED: {
      allowNull: true,
      field: 'DATE_CREATED',
    },
    EXTRA_GRACE: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'EXTRA_GRACE',
    },
    STATUS_ID: {
      // TODO fk relation
      allowNull: false,
      field: 'STATUS_ID',
    },
  },
  {
    tableName: 'RESERVATIONS',
    timestamps: false,
    schema: 'YHL46872',
    initialized: true,
  }
);

module.exports = Reservation;
