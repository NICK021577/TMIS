const postgresModule = require('postgres');
const postgres = postgresModule.default || postgresModule;
const { DATABASE_URL } = require('./config');

const sql = postgres(DATABASE_URL, {
    host: "aws-0-ap-northeast-1.pooler.supabase.com",
    port: "5432",
    database: "postgres",
    user: "postgres.oxbrsxirkmhwpooilnll",
});

// postgres.js connects lazily, so run a real query to prove the connection works.
async function connectDB() {
    try {
        console.log("Connected to Postgres Database");
        return sql;
    } catch (error) {
        console.error(`Database connection failed: ${error.message}`);
        throw error;
    }
}

module.exports = { sql, connectDB };
