var db = require(process.cwd() + '/support/db');
var ec = require(process.cwd() + '/support/errorCode');

var post_data = function (name, data) {
  return new Promise((resolve, reject) => {
    db.query('insert into json (name, data) values (?, ?);',
      [name, data], (e, rows) => {
        if (e) reject(e);
        resolve(rows);
      });
  });
}

var get_data = function (name) {
  return new Promise((resolve, reject) => {
    db.query('select * from json where name = ?;',
      [name], (e, rows) => {
        if (e) reject(e);
        else if (rows.length == 0) reject(ec.NoEntry);
        resolve(rows[0]);
      });
  });
}

var get_list = function () {
  return new Promise((resolve, reject) => {
    db.query('select name from json;',
        [],(e, rows) => {
        if (e) reject(e);
        else if (rows.length == 0) reject(ec.NoEntry);
        resolve(rows);
      });
  });
}
  


module.exports.get_data = get_data;
module.exports.get_list = get_list;
module.exports.post_data = post_data;
