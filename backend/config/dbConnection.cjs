const { createPool } = require('@vercel/postgres');
require('dotenv').config();

const pool = createPool({
  connectionString: process.env.POSTGRES_URL,
})

const connectDb = async () => {
  try {
    await pool.connect();
    console.log('Connected to Vercel Postgres');
  } catch (err) {
    console.error('Error connecting to Vercel Postgres:', err.message);
    process.exit(1);
  }
};

module.exports = { connectDb, pool };
