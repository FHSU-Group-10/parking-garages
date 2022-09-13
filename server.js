// PACKAGES
// Create the basic express app
require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3500;
// Logger
const logger = require('morgan');

// MIDDLEWARE
// Log requests
app.use(logger('dev'));
// Handle url-encoded form data
app.use(express.urlencoded({ extended: false }));
// JSON
app.use(express.json());

// ROUTES
app.use('/', require('./routes/index'));
app.use('/demo', require('./routes/demo'));

// Universal 404 page
app.all('*', (req, res) => {
  // Send response as JSON
  res.status(404).json({ message: '404 Not Found' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
