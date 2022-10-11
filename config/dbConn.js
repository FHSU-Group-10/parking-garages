const { Sequelize } = require('sequelize');

// Sequelize version
const connectDB = async () => {
  try {
    console.log('Connecting to DB...');

    const connStr = `db2:DATABASE/${process.env.DB_NAME};HOSTNAME=${process.env.DB_HOST_NAME};PORT=${process.env.DB_PORT};Security=SSL;;PROTOCOL=TCPIP;UID=${process.env.DB_USERNAME};PWD=${process.env.DB_PASSWORD};`;
    const sequelize = new Sequelize(connStr);

    // Test the connection
    await sequelize.authenticate();
    console.log('Connected to DB!');

    // Send a sample query
    const [results, metadata] = await sequelize.query("SELECT * FROM users LIMIT 1");
    console.log(results);
    return sequelize;
  } catch (error) {
    console.error('Failed to connect to DB. ', error);
  }
};

// ibm_db version
/* const connectDB = () => {
  const ibmdb = require('ibm_db');
  const connStr = `DATABASE=${process.env.DB_NAME};HOSTNAME=${process.env.DB_HOST_NAME};PORT=${process.env.DB_PORT};Security=SSL;SSLServerCertificate=;PROTOCOL=TCPIP;UID=${process.env.DB_USERNAME};PWD=${process.env.DB_PASSWORD};`;

  ibmdb.open(connStr, (err, connection) => {
    if (err){
      console.error(err);
      return;
    }
    console.log("Connected!");

    //connection.query("insert into users (username, pw, first_name, last_name, email, phone, is_operator) values ('user1', 'aaaa', 'justin', 'henley', 'jh@me.com', '8675309', false);", function (err1, rows){
      connection.query("select * from users", function (err1, rows){
      if (err1){
        console.error(err1)
      } else {
        console.log(rows);
      }
      connection.close(function (err2) {
        if (err2) console.error(err2)
      })
    })
  })
} */

module.exports = connectDB;
