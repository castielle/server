const { pool, getConnection } = require('../../database');


const createMember = ({ name, room }) => {
    try {
        pool.query('INSERT INTO `member` (`client_id`,`group_id`,`last_msg_id`) VALUES (?,?,NULL)',
            [name, room],
            (err, rows) => {
            console.log('insert member success')
        });}
    catch(error) {
        console.error(error);
    }

    const userRoom = { name, room };

    return { userRoom };
}


const getMyGroupIds = function(clientId){
    return new Promise(function(resolve, reject){
        pool.query(
            'SELECT `group_id` FROM `member` WHERE `client_id` = ?',
            [clientId],
            function(err, rows){
                console.log(err);
                if(rows === undefined){
                    console.log(err);
                    reject(new Error("Cannot get membership"));
                }else{
                    resolve(rows);
                }
            }
        )}
    )}


const getMembership = function(clientId){
    return new Promise(function(resolve, reject){
        pool.query(
            'SELECT `group`.`id`, `group`.`name` FROM `member` INNER JOIN `group` ON `group`.`id` = `member`.`group_id` WHERE `member`.`client_id` = ?',
            [clientId],
            function(err, rows){
                if(rows === undefined){
                    console.log(err);
                    reject(new Error("Cannot insert membership"));
                }else{
                    resolve(rows);
                }
            }
        )}
    )}

const insertMembership = function(clientId, groupId){
    return new Promise(function(resolve, reject){
        pool.query(
            'INSERT INTO `member` (`client_id`,`group_id`,`last_msg_id`) VALUES (?,?,NULL)',
            [clientId, groupId],
            function(err, rows){
                if(rows === undefined){
                    console.log(err);
                    reject(new Error("Cannot insert membership"));
                }else{
                    resolve(rows);
                }
            }
        )}
    )}

const updateLastMessage = function(clientId, groupId, messageId){
    return new Promise(function(resolve, reject){
        pool.query(
            'UPDATE `member` SET `last_msg_id` = ? WHERE `client_id` = ? AND `group_id` = ?',
            [messageId, clientId, groupId],
            function(err, rows){
                if(rows === undefined){
                    console.log(err);
                    reject(new Error('Cannot get last message'));
                }else{
                    resolve(rows);
                }
            }
        )}
    )}


const getLastMessageId = function(clientId, groupId){
    return new Promise(function(resolve, reject){
        pool.query(
            'SELECT * FROM `member` WHERE `client_id` = ? AND `group_id` = ?',
            [clientId, groupId],
            function(err, rows){
                if(rows === undefined){
                    console.log(err);
                    reject(new Error('Cannot get last message'));
                }else{
                    resolve(rows);
                }
            }
        )}
    )}


module.exports = { createMember, insertMembership, getLastMessageId, updateLastMessage, getMembership, getMyGroupIds };