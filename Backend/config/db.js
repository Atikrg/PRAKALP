const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'myuser',
//   password: 'Mypassword@1',
//   database: 'indiscpx_taskdb_2',
// });

// const db = mysql.createConnection({
//   host: '103.195.185.168',
//   user: 'indiscpx_TASKDB_2',
//   password: 'Protovec123',
//   database: 'indiscpx_TASKDB_2',
// });

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

module.exports = db;
