const PORT = process.env.PORT || 3500;
const app = require('./app');

// Connect to DB

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
