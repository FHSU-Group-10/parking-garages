// Exports a function that defines the model
// Receives the sequelize instance and datatypes as parameters
// Relations are defined elsewhere
module.exports = (sequelize, DataTypes) => {
  sequelize.define(
    'SpaceStatus',
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
      tableName: 'SPACE_STATUS',
      timestamps: false,
      schema: 'g10',
      initialized: true,
    }
  );
};
