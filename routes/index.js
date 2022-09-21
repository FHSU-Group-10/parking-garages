const express = require('express');
const router = express.Router();
const path = require('path');

// const PUBLIC_PATH = path.join()

router.get('^/$|/index(.html)?', (req, res) => {
  res.send('Welcome!');
});

// router.get('^$|/register(.html)?', (req, res) => {
//   res.sendFile(path.join(appRoot+'/public/register.html'));
// });


module.exports = router;
