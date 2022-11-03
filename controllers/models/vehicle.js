// Exports a function that defines the model
// Receives the sequelize instance and datatypes as parameters
// Relations are defined elsewhere
module.exports = (sequelize, DataTypes) => {
  sequelize.define(
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
      schema: 'g10',
      initialized: true,
    }
  );

  // Models to link with relations to Vehicle
  //const Users = require('./user');
  //const Reservation = require('./reservation');

  // Create relation to User (FK in Vehicle)
  //Vehicle.belongsTo(sequelize.models.Users);

  // Relation to Reservation (FK in Reservation)
  //Vehicle.hasMany(Reservation);
};
