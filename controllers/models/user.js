// init sequelize
const { DataTypes } = require('sequelize');
// ready our db connection function
const dbConn = require('../../config/dbConn');
const sequelize = dbConn();
const _ = require('lodash');

const Users = sequelize.define(
    'Users',
    {
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
    },
    {
        tableName: 'USERS',
        timestamps: false,
        schema: 'YHL46872',
        initialized: true
    }
);

module.exports = Users;
