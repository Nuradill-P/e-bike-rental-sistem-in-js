const fs = require('fs');
const path = require('path');
const pool = require('./pool');

async function initDb() {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    try {
        await pool.query(schema);
        console.log('Database schema initialized successfully.');
    } catch (err) {
        console.error('Failed to initialize database schema:', err);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

initDb();
