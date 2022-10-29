// Exports a function that defines the model
// Receives the sequelize instance and datatypes as parameters
// Relations are defined elsewhere
module.exports = (sequelize, DataTypes) => {
  sequelize.define(
    'Floor',
    {
      FLOOR_ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      FLOOR_NUM: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'FLOOR_NUM',
      },
      SPACE_COUNT: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'SPACE_COUNT',
      },
    },
    {
      tableName: 'FLOORS',
      timestamps: false,
      schema: 'g10',
      initialized: true,
    }
  );
};

/*
Foreign key relationship with Garage defined elsewhere:

GARAGE_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'GARAGE_ID',
      },
*/
