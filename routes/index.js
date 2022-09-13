const express = require('express');
const router = express.Router();

router.get('^/$|/index(.html)?', (req, res) => {
  res.send('Welcome!');
});

module.exports = router;
