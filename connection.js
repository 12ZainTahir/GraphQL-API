const { Client } = require('pg');

const pool = new Client({
    host: "localhost",
    user: "postgres",
    password: "1234",
    database: "postgres"
  })
  pool.connect((err) => {
    if (err) {
      console.error('Error connecting to PostgreSQL:', err);
    } else {
      console.log('Connected to PostgreSQL database');
    }
  });

module.exports=pool;