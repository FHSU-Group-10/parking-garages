// LIBRARIES
const express = require('express');
const router = express.Router();
const pricingController = require('../../controllers/pricingController');

router.route('/').get(pricingController.getPricing).patch(pricingController.updatePricing);

module.exports = router;
