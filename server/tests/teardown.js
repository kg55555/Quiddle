const pool = require('../util/pool');

module.exports = async () => {
  await pool.end();
};