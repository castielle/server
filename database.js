const mysql = require('mysql');

// Create connection
// const pool = mysql.createPool({
//     host     : 'localhost',
//     user     : 'root',
//     password : 'parallel',
//     database : 'chat'
// });

// amazon - internal
const pool = mysql.createPool({
    host     : process.env.RDS_HOSTNAME,
    user     : process.env.RDS_USERNAME,
    password : process.env.RDS_PASSWORD,
    port     : process.env.RDS_PORT,
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
