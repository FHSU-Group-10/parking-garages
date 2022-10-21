// Exports a function that defines the model
// Receives the sequelize instance and datatypes as parameters
// Relations are defined elsewhere
module.exports = (sequelize, DataTypes) => {
  sequelize.define(
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
  //ReservationType.hasMany(Reservation);
};
