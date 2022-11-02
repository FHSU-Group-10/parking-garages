const express = require('express');
const router = express.Router();
const garageController = require('../../controllers/garageController');

router.route('/add').post(garageController.addGarage);

router.route('/getGarages').post(garageController.listGarages);

router.route('/').post(garageController.updateGarage);

module.exports = router;
