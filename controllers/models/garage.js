// init sequelize
module.exports = (sequelize, DataTypes) => {
    sequelize.define(
        'Garage',
        {
            GARAGE_ID: {
                type: DataTypes.NUMERIC,
                autoIncrement: true,
                primaryKey: true
            },
            DESCRIPTION: {
                type: DataTypes.STRING(128),
                allowNull: false,
                field: "DESCRIPTION",
                unique: true
            },
            FLOOR_COUNT: {
                type: DataTypes.NUMERIC,
                allowNull: false,
                field: "FLOOR_COUNT"
            },
            LAT: {
                type: DataTypes.STRING(64),
                allowNull: false,
                field: "LAT"
            },
            LONG: {
                type: DataTypes.STRING(64),
                allowNull: false,
                field: "LONG"
            },
            OVERBOOK_RATE: {
                type: DataTypes.FLOAT,
                allowNull: true,
                field: "OVERBOOK_RATE"
            },
            IS_ACTIVE: {
                type: DataTypes.BOOL,
                allowNull: false,
                field: "IS_ACTIVE"
            }
        },
        {
            tableName: 'GARAGE',
            timestamps: false,
            schema: 'YHL46872',
            initialized: true,
        }
    );
}