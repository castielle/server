const { pool, getConnection } = require('../../database');


const insertMessage = function(message, clientId, groupId){
    return new Promise(function(resolve, reject){
        pool.query(
            'INSERT INTO `message` (`content`, `posted_by`, `group_id`) VALUES (?, ?, ?)', [message, clientId, groupId],
            // 'INSERT INTO `client` (`name`) VALUES (?)', [name],
            function(err, rows){
                if(rows === undefined){
                    reject(new Error("Error rows is undefined"));
                }else{
                    resolve(rows);
                }
            }
        )}
    )}

module.exports = {insertMessage};