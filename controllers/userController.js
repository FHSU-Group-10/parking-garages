/**
 * All functions pertaining to the User model / class.
 * <pre>
 *     History:
 *          2022 10 09 - Dustin.Threet - create
 *          2022 10 09 - Dustin.Threet - functionality to login as user.
 *          2022 10 12 - Dustin.Threet - added ability to register new account.
 *          2022 10 16 - Dustin.Threet - hashing password on register, changed findorcreate to just create for the hashing of passwords.
 */

const _ = require("lodash");
const Db = require('../config/dbConn')();
const { Sequelize, Op } = require("sequelize");
const getModels = Db.getModels;
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { token } = require("morgan");
const Users = Db.models.Users;

// ---------- REGISTRATION ----------

/**
 * 
 * @param {object} obj - Initialized with the username and password values enetered by the user 
 * 
 * Precondition:
 * - User has entered a username and password
 * Postcondition:
 * - User is validated
 */

const login = async (req, res) => {
    try {
        // setup params
        const obj = {
            username: req.body?.Login?.username,
            password: req.body?.Login?.password
        };

        for (let param in obj) {
            if (!obj[param]) return res.status(400).json({ error: `Incomplete Login attempt, ${param} is required!` });
        }

        // find our user attempting to login
        let user = await Users.findOne({
            where: {
                USERNAME: {
                    [Op.like]: obj.username
                }
            }
        });
        // separating dataValues from return set
        user = (user || {}).dataValues;

        // Building user return object
        const jwt = require('jsonwebtoken');

        if (user) {
            const password_valid = await bcrypt.compare(obj.password, user.PW);
            if (password_valid) {
                let new_token = jwt.sign({
                    "id": user.MEMBER_ID,
                    "email": user.EMAIL,
                    "first_name": user.FIRST_NAME,
                    "last_name": user.LAST_NAME,
                    "phone": user.PHONE,
                    "username": user.USERNAME,
                    "is_operator": user.IS_OPERATOR
                }, `${process.env.JWT_SECRET_KEY}`, { expiresIn: '1h' });
                return res.status(200).json(
                    {
                        token: new_token,
                        first_name: user.FIRST_NAME,
                        last_name: user.LAST_NAME,
                        username: user.USERNAME,
                        is_operator: user.IS_OPERATOR
                    }
                ); // TODO: change to login token
            } else {
                return res.status(400).json({ error: 'Password Incorrect' });
            }
        } else {
            return res.status(404).json({ error: "User does not exist." });
        }

    } catch (ex) {
        console.dir(ex); // log error
        return res.status(400).json(ex);
    }
};


// ---------- REGISTRATION ----------

/**
 * 
 * @returns {object} - Status code message
 * 
 * Precondition: 
 * - The username does not already exist in the DB
 * - All registration fields have been filled
 * Postcondition:
 * - A new user is created and added to the DB
 */
const register = async (req, res) => {
    try {
        // Our required fields for a new account. Object is used for error handling
        let required_fields = {
            "first_name": "first name required",
            "last_name": "last name required",
            "username": "username required",
            "password": "password required",
            "email": "email required",
            "phone": "phone number required",
        };

        // check required fields
        // make sure the param is there and has a value
        // for (let param in required_fields) {
        //     if (!req?.body ? [param] && !req?.body?.hasOwnProperty(param)) throw required_fields[param];
        // }

        // Check required fields
        // Make sure the param is there and is not an emptry string
        for (let param in required_fields) {
            if (!req?.body[param] && req?.body[param] == '') throw required_fields[param];
        }
        // Search the DB for a username matching the value entered by the user
        let existing_user = await Users.findOne({
            where: {
                USERNAME: {
                    [Op.like]: req.body.username
                }
            }
        });

        if (existing_user) throw 'Username already in use.';

        const salt = await bcrypt.genSalt(10);

        const hashed_pw = await bcrypt.hash(req?.body?.password, salt);

        // Create new user in Users table
        let created_user = await Users.create({
            USERNAME: req.body.username,
            PW: hashed_pw,
            FIRST_NAME: req.body.first_name,
            LAST_NAME: req.body.last_name,
            EMAIL: req.body.email,
            PHONE: req.body.phone,
            IS_OPERATOR: req.body.is_operator || false
        });
        // Separating dataValues from return set
        created_user = (created_user || {}).dataValues;

        // delete PW since we do not want to send this back to the UI.
        delete created_user.PW;

        return res.status(200).json(created_user);
    } catch (ex) {
        console.dir(ex); // log error
        return res.status(400).json(ex);
    }
};

module.exports = {
    login,
    register
};