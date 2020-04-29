const { pool, getConnection } = require('../../database');


const createClient = function(name){
    return new Promise(function(resolve, reject){
        pool.query(
            'INSERT INTO `client` (`name`) VALUES (?)', [name],
            function(err, rows){
                if(rows === undefined){
                    reject(new Error("Error rows is undefined"));
                }else{
                    resolve(rows);
                }
            }
        )}
    )}


module.exports = { createClient };