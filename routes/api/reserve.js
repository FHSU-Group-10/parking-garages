// LIBRARIES
const express = require('express');
const router = express.Router();
const reservationController = require('../../controllers/reservationController');

// Search
router.route('/search').post(reservationController.searchSpace);

// Single space
router.route('/single').post(reservationController.reserveSpace);

// Guaranteed space
router.route('/guaranteed').post(reservationController.reserveGuaranteedSpace);

module.exports = router;
