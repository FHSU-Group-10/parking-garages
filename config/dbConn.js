const { Sequelize } = require('sequelize');
// ibm_db
const connectDB = () => {


const ibmdb = require('ibm_db')
const connStr = `DATABASE=${process.env.DB_NAME};HOSTNAME=${process.env.DB_HOST_NAME};PORT=${process.env.DB_PORT};Security=SSL;SSLServerCertificate=;PROTOCOL=TCPIP;UID=${process.env.DB_USERNAME};PWD=${process.env.DB_PASSWORD};`

ibmdb.open(connStr, (err, connection) => {
  if (err){
    console.error(err);
    return;
  }
  console.log("open!...");

  connection.query('select 1 from sysibm.sysdummy1', function (err1, rows){
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
}
// Sequelize - Does NOT work yet
/* const connectDB = async () => {
  try {
    console.log('Attempting to connect to DB...');

    const sequelize = new Sequelize({
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST_NAME,
      port: process.env.DB_PORT,
      dialect: 'db2',
      ssl: true,
    });
    console.log('Created, about to authenticate')
    await sequelize.authenticate();
    console.log('Connected to DB.');
  } catch (error) {
    console.error('Failed to connect to DB. ', error);
  }
};
 */
module.exports = connectDB;
