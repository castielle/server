const { pool } = require('../../database');


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


const getMessage = function(messageId){
    return new Promise(function(resolve, reject){
        pool.query(
            'SELECT * FROM `message` WHERE `id` = ?', [messageId],
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

const getUnreadMessage = function(groupId, lastMessageId){
    return new Promise(function(resolve, reject){
        pool.query(
            'SELECT * FROM `message` WHERE `group_id` = ? AND `id` > ?',
            [groupId, lastMessageId],
            function(err, rows){
                if(rows === undefined){
                    reject(new Error("Error rows is undefined"));
                }else{
                    resolve(rows);
                }
            }
        )}
    )}

module.exports = { insertMessage, getMessage, getUnreadMessage};