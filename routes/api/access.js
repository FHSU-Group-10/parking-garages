const express = require('express');
const router = express.Router();
const accessController = require('../../controllers/accessController');

router.route('/enter').post(accessController.enter);

module.exports = router;
