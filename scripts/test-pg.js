require('dotenv').config();
const { Client } = require('pg');

const c = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

c.connect()
 .then(() => console.log('✅ PG OK'))
 .catch(e => console.error('❌', e))
 .finally(() => c.end());

