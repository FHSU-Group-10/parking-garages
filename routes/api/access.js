const express = require('express');
const router = express.Router();
const accessController = require('../../controllers/accessController');

router.route('/enter').post(accessController.enter);
router.route('/code/enter'), post(accessController.enterByCode);

module.exports = router;
