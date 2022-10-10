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

    class Users extends Model{}
    Users.init({
        MEMBER_ID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        USERNAME: {
            type: DataTypes.STRING(24),
            allowNull: false,
            field: "USERNAME",
            unique: true
        },
        PW: {
            type: DataTypes.STRING(64),
            allowNull: false,
            field: "PW"
        },
        FIRST_NAME: {
            type: DataTypes.STRING(64),
            allowNull: false,
            field: "FIRST_NAME"
        },
        LAST_NAME: {
            type: DataTypes.STRING(64),
            allowNull: false,
            field: "LAST_NAME"
        },
        EMAIL: {
            type: DataTypes.STRING(64),
            allowNull: false,
            field: "EMAIL"
        },
        PHONE: {
            type: DataTypes.STRING(16),
            allowNull: true,
            field: "PHONE"
        },
        IS_OPERATOR: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            field: "IS_OPERATOR"
        }
    }, _.merge({}, Base_Options, {
        tableName: 'USERS'
    }));
    
    _.merge(Model_Cache, {
        Users
    },{initialized: true});
    
    return Model_Cache;
    
}

module.exports = {
    getModels
}
