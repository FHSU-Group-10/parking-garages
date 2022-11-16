// Exports a function that defines the model
// Receives the sequelize instance and datatypes as parameters
// Relations are defined elsewhere
module.exports = (sequelize, DataTypes) => {
  sequelize.define(
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
      RES_CODE: {
        type: DataTypes.STRING(8),
        allowNull: false,
        field: 'RES_CODE',
        unique: true,
      },
    },
    {
      tableName: 'RESERVATIONS',
      timestamps: false,
      schema: 'g10',
      initialized: true,
    }
  );
  /* 
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
 */
};
