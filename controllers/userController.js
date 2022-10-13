const _ = require("lodash");
const Db = require('./models/user');
const { Sequelize, Op } = require("sequelize");
const getModels = Db.getModels;

const login = async(req, res) => {
    try {
        // fetch DB models, connect to DB
        let {Users} = await getModels();
        
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
            const password_valid = (password === user.PW); // TODO: change to bcrypt.compare(req.body.password, user.PW) once hashing has started
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
                    PW: req.body.password,
                    FIRST_NAME: req.body.first_name,
                    LAST_NAME: req.body.last_name,
                    EMAIL: req.body.email,
                    PHONE: req.body.phone,
                    IS_OPERATOR: req.body.is_operator
                }
            });
            // separating dataValues from return set
            created_user = (created_user || {}).dataValues;
        
            if (!created) throw 'Username already in use.'
        
        
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
        
        // fetch DB models, connect to DB
        let {Users} = await getModels();

        let [created_user, created] = await Users.findOrCreate({
           where: {
               USERNAME: req.body.username,
               PW: req.body.password,
               FIRST_NAME: req.body.first_name,
               LAST_NAME: req.body.last_name,
               EMAIL: req.body.email,
               PHONE: req.body.phone,
               IS_OPERATOR: req.body.is_operator || false
           }
        });
        // separating dataValues from return set
        created_user = (created_user || {}).dataValues;

        if (!created) throw 'Username already in use.'


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