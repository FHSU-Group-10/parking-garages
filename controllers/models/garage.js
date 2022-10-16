// init sequelize
const { Sequelize, DataTypes, Model } = require('sequelize');
// ready our db connection function
const connectDB = require("../../config/dbConn");
const _ = require('lodash');

const Model_Cache = {
    initialized: false,
    getSql:() => connectDB()
}

async function getModels() {
    
    const sequelize = await Model_Cache.getSql();
    
    const Base_Options = {
        sequelize: sequelize,
        timestamps: false,
        schema: "YHL46872"
    }

    class Garage extends Model{}
    Garage.init({
        GARAGE_ID: {
            type: DataTypes.INTEGER,
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
            type: DataTypes.INTEGER,
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
            type: DataTypes.BOOLEAN,
            allowNull: false,
            field: "IS_ACTIVE"
        }
    }, _.merge({}, Base_Options, {
        tableName: 'GARAGE'
    }));
    
    _.merge(Model_Cache, {
        Garage
    },{initialized: true});
    
    return Model_Cache;
    
}

module.exports = {
    getModels
}
