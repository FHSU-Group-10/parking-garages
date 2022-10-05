const PORT = process.env.PORT || 3500;
const app = require('./app');
const connectDB = require('./config/dbConn');

// Connect to DB
connectDB();

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
