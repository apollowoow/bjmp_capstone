require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  db: {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    name: process.env.DB_NAME || 'bjmp_pdl',
    password: process.env.DB_PASS, // Leave empty to read from .env
    port: process.env.DB_PORT || 5432,
  },
  jwtSecret: process.env.JWT_SECRET || "bjmp_default_secret_2026",
};