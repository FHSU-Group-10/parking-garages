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
const Db = require('./models/user');
const { Sequelize, Op } = require("sequelize");
const getModels = Db.getModels;
const bcrypt = require("bcrypt");
const Users = require('./models/user');

const login = async(req, res) => {
    try {
        // setup params
        let username = req.username;
        let password = req.password;
        
        // find our user attempting to login
        let user = await Users.findOne({
            where: {
                USERNAME: {
                    [Op.like]: username
                }
            }
        });
        // separating dataValues from return set
        user =  (user || {}).dataValues;
        
        if (user) {
            const password_valid = await bcrypt.compare(password,user.PW); 
            if (password_valid) {
                return res.status(200).json({token: 'success'}); // TODO: change to login token
            } else {
                return res.status(400).json({error: 'Password Incorrect'});
            }
        } else {
            return res.status(404).json({error: "User does not exist."})
        }
        
    }catch (ex) {
        console.dir(ex); // log error
    }
}

const test = async (req, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            // fetch DB models, connect to DB
            let {Users} = await getModels();
        
            let [created_user, created] = await Users.findOrCreate({
                where: {
                    USERNAME: req.body.username,
                    PW: await bcrypt.hash(req.body.password),
                    FIRST_NAME: req.body.first_name,
                    LAST_NAME: req.body.last_name,
                    EMAIL: req.body.email,
                    PHONE: req.body.phone,
                    IS_OPERATOR: req.body.is_operator
                }
            });
            // separating dataValues from return set
            created_user = (created_user || {}).dataValues;
            // cleanup PW, do not want to send this back to the UI
            delete created_user.PW;
            resolve((200).json(created_user));
        }catch (ex) {
            console.dir(ex); // log error
            reject((400).json(ex));
        }
    });
}

const register = async (req, res) => {
    try {
        // our required fields for a new account
        let required_fields = {
            "username": "username required",
            "password": "password required",
            "first_name": "first name required",
            "last_name": "last name required",
            "email": "email required",
            "phone": "phone number required",
            "is_operator": "selection required"
        };
        
        // check required fields
        // make sure the param is there and has a value
        for (let param in required_fields) {
            if (!req.body[param] && !req.body.hasOwnProperty(param)) throw required_fields[param];
        }
    
        let existing_user = await Users.findOne({
            where: {
                USERNAME: {
                    [Op.like]: req.body.username
                }
            }
        });
    
        if (existing_user) throw 'Username already in use.'
    
        const salt = await bcrypt.genSalt(10);
        
        const hashed_pw = await bcrypt.hash(req.body.password, salt);

        let created_user = await Users.create({
               USERNAME: req.body.username,
               PW: hashed_pw,
               FIRST_NAME: req.body.first_name,
               LAST_NAME: req.body.last_name,
               EMAIL: req.body.email,
               PHONE: req.body.phone,
               IS_OPERATOR: req.body.is_operator || false
        });
        // separating dataValues from return set
        created_user = (created_user || {}).dataValues;
    
        // delete PW since we do not want to send this back to the UI.
        delete created_user.PW;
        
       return res.status(200).json(created_user);
    }catch (ex) {
        console.dir(ex); // log error
        return res.status(400).json(ex);
    }
}

module.exports = {
    login,
    register
}