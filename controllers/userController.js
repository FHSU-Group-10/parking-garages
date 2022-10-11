const _ = require("lodash");
const Db = require('./models/user');
const { Op } = require("sequelize");
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

module.exports = {
    login
}