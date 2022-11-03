// Exports a function that defines the model
// Receives the sequelize instance and datatypes as parameters
// Relations are defined elsewhere
module.exports = (sequelize, DataTypes) => {
  sequelize.define(
    'Users',
    {
      MEMBER_ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      USERNAME: {
        type: DataTypes.STRING(24),
        allowNull: false,
        field: 'USERNAME',
        unique: true,
      },
      PW: {
        type: DataTypes.STRING(64),
        allowNull: false,
        field: 'PW',
      },
      FIRST_NAME: {
        type: DataTypes.STRING(64),
        allowNull: false,
        field: 'FIRST_NAME',
      },
      LAST_NAME: {
        type: DataTypes.STRING(64),
        allowNull: false,
        field: 'LAST_NAME',
      },
      EMAIL: {
        type: DataTypes.STRING(64),
        allowNull: false,
        field: 'EMAIL',
      },
      PHONE: {
        type: DataTypes.STRING(16),
        allowNull: true,
        field: 'PHONE',
      },
      IS_OPERATOR: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'IS_OPERATOR',
      },
    },
    {
      tableName: 'USERS',
      timestamps: false,
      schema: 'g10',
      initialized: true,
    }
  ); /* 
// Models to link with relations to User
const Reservation = require('./reservation');
const Vehicle = require('./vehicle');

// Create the relations to other tables (User has no FKs)
Users.hasMany(Reservation);
Users.hasMany(sequelize.models.Vehicle, {
  foreignKey: {
    name: 'MEMBER_ID',
    allowNull: false,
  },
});
 */
};
