const mysql = require('mysql');

// Create connection
// const pool = mysql.createPool({
//     host     : 'localhost',
//     user     : 'root',
//     password : 'parallel',
//     database : 'chat'
// });

// amazon
const pool = mysql.createPool({
    host     : 'rds.custipjdjfst.ap-southeast-1.rds.amazonaws.com',
    user     : 'admin',
    password : 'Ig7FNxW8pzpSKNXiNla5',
    database : 'rds'
});

// Connect
var getConnection = function(callback) {
    pool.getConnection(function(err, connection) {
        callback(err, connection);
    });
};

module.exports = {
    getConnection,
    pool
}
