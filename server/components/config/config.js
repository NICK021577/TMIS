require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;
const PORT = parseInt(process.env.PORT) || 8000;
const SALT = parseInt(process.env.SALT) || 10;
const JWT_SECRET = process.env.JWT_SECRET;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
const NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {
    DATABASE_URL,
    PORT,
    SALT,
    JWT_SECRET,
    ALLOWED_ORIGINS,
    NODE_ENV,
};
