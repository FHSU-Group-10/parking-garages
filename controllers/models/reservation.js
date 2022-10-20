// init sequelize
const { DataTypes } = require('sequelize');
// ready our db connection function
const dbConn = require('../../config/dbConn');
const sequelize = dbConn();

// Models to link with foreign keys
const ReservationStatus = require('./reservationStatus');
const Vehicle = require('./vehicle');
const ReservationType = require('./reservationType');
const User = require('./user');
// TODO Cannot figure out async way to link User model

const Reservation = sequelize.define(
  'Reservation',
  {
    RESERVATION_ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    START_TIME: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'START_TIME',
    },
    END_TIME: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'END_TIME',
    },
    DATE_CREATED: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: true,
      field: 'DATE_CREATED',
    },
    EXTRA_GRACE: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'EXTRA_GRACE',
    },
  },
  {
    tableName: 'RESERVATIONS',
    timestamps: false,
    schema: 'YHL46872',
    initialized: true,
  }
);

// TODO cannot pass User model directly from async model definition
// Create relations to other tables (foreign keys)
Reservation.belongsTo(User, {
  foreignKey: {
    name: 'MEMBER_ID',
    allowNull: false,
  },
});
Reservation.belongsTo(ReservationType, {
  foreignKey: {
    name: 'RESERVATION_TYPE_ID',
    allowNull: false,
  },
});
Reservation.belongsTo(Vehicle, {
  foreignKey: {
    name: 'VEHICLE_ID',
    allowNull: true,
  },
});
Reservation.belongsTo(ReservationStatus, {
  foreignKey: {
    name: 'STATUS_ID',
    allowNull: false,
  },
});

module.exports = Reservation;
