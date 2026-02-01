const { Pool } = require("pg");
const config = require("../config"); 
const pg = require("pg");
pg.types.setTypeParser(1082, (val) => val);


// 1082 is the internal code for 'DATE'
// This forces Node to treat "2025-06-12" as a String "2025-06-12"


const pool = new Pool({
  user: config.db.user,
  host: config.db.host,
  database: config.db.name,
  password: config.db.password,
  port: config.db.port,
});

module.exports = pool;