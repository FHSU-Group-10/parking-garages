// Exports a function that defines the model
// Receives the sequelize instance and datatypes as parameters
// Relations are defined elsewhere
module.exports = (sequelize, DataTypes) => {
  sequelize.define(
    'Space',
    {
      SPACE_ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      WALK_IN: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'WALK_IN',
      },
      SPACE_NUM: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'SPACE_NUM',
      },
    },
    {
      tableName: 'SPACES',
      timestamps: false,
      schema: 'g10',
      initialized: true,
    }
  );
};

/*
  Foreign key relationship with Garage defined elsewhere:
  
    STATUS_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'STATUS_ID',
    },

    FLOOR_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'FLOOR_ID',
    },

    GARAGE_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'GARAGE_ID',
    },
  */
