// LIBRARIES
const express = require('express');
const router = express.Router();
const pricing = require('../../controllers/pricingController');

router.route('/getPricing').get(pricing.getPricing);
router.route('/updatePricing').post(pricing.updatePricing);
router.route('/createPricing').post(pricing.createPricing);
router.route('/destroyRow').post(pricing.destroyRow);
module.exports = router;
