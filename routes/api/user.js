// LIBRARIES
const express = require('express');
const router = express.Router();
const User = require('../../controllers/userController');

// login with user information
router.route('/login').post(async (req, res, next) => {
    try {
        // build request object
        let obj = {
            username: req.body?.Login?.username,
            password: req.body?.Login?.password
        }
        // search for or request params
        // leave if we are missing either param
        if (!obj.username || !obj.password) {
            throw 'Missing username or password';
        }
        
        // get our success or failure reason
        let results = await User.login(obj, res);
        
        // return to user
        res.status(200).json(results);
    } catch (error) {
        // log and handle error
        console.dir(error);
        res.status(500).json(error);
    }
});


module.exports = router;