// LIBRARIES
const express = require('express');
const router = express.Router();
const reservationController = require('../../controllers/reservationController');

// Single space
router.route('/single').get(reservationController.searchSpace).post(reservationController.reserveSpace);

// Guaranteed space
//router.route('/guaranteed').get(reservationController.searchGuaranteedSpace).post(reservationController.reserveGuaranteedSpace);
router.route('/guaranteed').get(reservationController.searchSpace).post(reservationController.reserveSpace);

module.exports = router;
