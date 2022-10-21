// LIBRARIES
const express = require('express');
const router = express.Router();
const User = require('../../controllers/userController');

// login with user information
router.route('/login').post(User.login);

// register new user
router.route('/register').post(User.register)


module.exports = router;