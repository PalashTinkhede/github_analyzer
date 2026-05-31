const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host:            process.env.DB_HOST || '127.0.0.1',
  user:            process.env.DB_USER || 'root',
  password:        process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'root',
  database:        process.env.DB_NAME || 'github_analyzer',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit:      0,
});

// Test connection on startup
pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL connected');
    conn.release();
  })
  .catch(err => {
    console.error('❌ MySQL connection failed:', err.message);
    // Don't kill the process immediately during development unless critical
    // process.exit(1);
  });

module.exports = pool;
