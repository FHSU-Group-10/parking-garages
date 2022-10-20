// init sequelize
const { Sequelize, DataTypes, Model } = require('sequelize');
// ready our db connection function
const connectDB = require("../../config/dbConn");
const _ = require('lodash');

const Model_Cache = {
    initialized: false,
    getSql: () => connectDB()
}

async function getModels() {

    const sequelize = await Model_Cache.getSql();

    const Base_Options = {
        sequelize: sequelize,
        timestamps: false,
        schema: "YHL46872"
    }

    class Pricing extends Model { }
    Pricing.init({
        PRICING_ID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        DESCRIPTION: {
            type: DataTypes.STRING(64),
            allowNull: false,
            field: "DESCRIPTION",
        },
        COST: {
            type: DataTypes.STRING(24),
            allowNull: false,
            field: "COST"
        },
        DAILY_MAX: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "DAILY_MAX"
        },
        RESERVATION_TYPE_ID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "RESERVATION_TYPE_ID"
        }
    }, _.merge({}, Base_Options, {
        tableName: 'PRICING'
    }));

    _.merge(Model_Cache, {
        Pricing
    }, { initialized: true });

    return Model_Cache;

}

module.exports = {
    getModels
}
