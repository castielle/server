const mysql = require('mysql');

// Create connection
const pool = mysql.createPool({
    host     : 'localhost',
    user     : 'root',
    password : 'parallel',
    database : 'chat'
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
