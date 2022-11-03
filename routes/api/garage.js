const express = require('express');
const router = express.Router();
const garageController = require('../../controllers/garageController');

router.route('/add').post(garageController.addGarage);

router.route('/getGarages').post(garageController.listGarages);

router.route('/updateGarage').post(garageController.updateGarage);

module.exports = router;
