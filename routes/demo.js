const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json([
    { garage: 'A Garage', vacant: 25 },
    { garage: 'B Garage', vacant: 3 },
  ]);
});

module.exports = router;
