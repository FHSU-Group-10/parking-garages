// LIBRARIES
const express = require('express');
const router = express.Router();
const reservationController = require('../../controllers/reservationController');

// Search
router.route('/search').post(reservationController.searchSpace);

// Reserve
router.route('/').post(reservationController.reserveSpace);

module.exports = router;
