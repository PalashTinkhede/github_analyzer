const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setup() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'root';
  const database = process.env.DB_NAME || 'github_analyzer';

  console.log(`Connecting to MySQL at ${host} as ${user}...`);

  let connection;
  try {
    // Connect without database first
    connection = await mysql.createConnection({
      host,
      user,
      password,
      multipleStatements: true
    });

    console.log('Connected to MySQL host.');

    // Create database
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    console.log(`Database "${database}" checked/created.`);

    // Use the database
    await connection.query(`USE \`${database}\`;`);

    // Read and run schema.sql
    const schemaPath = path.join(__dirname, '../../schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Remove comments and lines that are empty or contain USE/CREATE DATABASE
    const cleanQueries = schemaSql
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0 && !q.toLowerCase().startsWith('create database') && !q.toLowerCase().startsWith('use '));

    for (const query of cleanQueries) {
      console.log(`Running query: ${query.substring(0, 50)}...`);
      await connection.query(query);
    }

    console.log('✅ Database and tables initialized successfully.');
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setup();
