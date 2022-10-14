var mysql = require('mysql');
var config = require('./config');

var pool = mysql.createPool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
});


var query = function(sql, values, cb) {
  if(cb == undefined) {
    if(typeof values === 'function') { cb = values; values = []; }
    else { console.error('parameter error'); return; }
  }

  if(pool == undefined) {
    console.error('pool error');
    return;
  }

  pool.getConnection((err, connection) => {
    if(err) cb(err, null);
    else connection.query(sql, values, (err, rows) => {
      connection.release();
      cb(err, rows);
    });
  });
}

exports.query = query;
