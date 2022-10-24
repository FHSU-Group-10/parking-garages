const express = require('express');
const router = express.Router();
const garageController = require('../../controllers/garageController');

router.route('/').get(garageController.listGarages).post(garageController.addGarage).patch(garageController.updateGarage).delete(garageController.deleteGarage).get(garageController.getGarageIdGarages);

module.exports = router;
