const express = require('express');
const router = express.Router();
const accessController = require('../../controllers/accessController');

router.route('/enter').post(accessController.enter);
router.route('/exit').post(accessController.exit);

module.exports = router;
