// LIBRARIES
const express = require("express");
const router = express.Router();
const reservationController = require("../../controllers/reservationController");

// Search
router.route("/search/single").post(reservationController.searchSpace);
router
  .route("/search/guaranteed")
  .post(reservationController.searchGuaranteedSpace);

// Single space
router.route("/single").post(reservationController.reserveSpace);

// Guaranteed space
router.route("/guaranteed").post(reservationController.reserveGuaranteedSpace);

module.exports = router;
