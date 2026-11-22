const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const { sql } = require('../config/dbConnect');
const models = require('../models');

async function main() {
    // every model checks (and if needed creates) its own table; wait for all of them
    await Promise.all(Object.values(models).map((Model) => Model.ensureTable()));

    const [{ count }] = await sql`
        select count(*)::int as count
        from information_schema.tables
        where table_schema = current_schema()`;
    console.log(`Schema applied. ${count} tables in the database.`);
}

main()
    .catch((error) => {
        console.error('Schema failed:', error.message);
        process.exitCode = 1;
    })
    .finally(() => sql.end());
