const express = require('express');
const app = express();
const PORT = process.env.PORT || 3500;

// MIDDLEWARE
// Handle url-encoded form data
app.use(express.urlencoded({ extended: false }));

// JSON
app.use(express.json());

// ROUTES
app.use('/', require('./routes/index'));

// Universal 404 page
app.all('*', (req, res) => {
  // Set response code
  res.status(404);
  // Send response as JSON
  res.json({ message: '404 Not Found' });
  // TODO an HTML version
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
