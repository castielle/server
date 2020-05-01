const { pool, getConnection } = require('../../database');

const createGroup = ({ name, room }) => {
    try {
    pool.query('INSERT INTO `group` (`name`) VALUES (?)', [room],(err, rows) => {
        // console.log(rows[0].id);
        console.log('insert group success')
    });}
    catch(error) {
        console.error(error);
    }

    const userRoom = { name, room };

    return { userRoom };
}

const insertGroup = function(room){
    return new Promise(function(resolve, reject){
        pool.query(
            'INSERT INTO `group` (`name`) VALUES (?)', [room],
            function(err, rows){
                if(rows === undefined){
                    reject(new Error('Cannot insert group'));
                }else{
                    resolve(rows);
                }
            }
        )}
    )}


const getGroupId = function(room){
    return new Promise(function(resolve, reject){
        pool.query(
            'SELECT * FROM `group` WHERE `name` = ?', [room],
            function(err, rows){
                if(rows === undefined){
                    reject(new Error('Cannot get group id'));
                }else{
                    resolve(rows);
                }
            }
        )}
    )}


const leaveGroup = function(clientId, groupId){
    return new Promise(function(resolve, reject){
        pool.query(
            'DELETE FROM `member` WHERE `client_id` = ? AND `group_id` = ?',
            [clientId, groupId],
            function(err, rows){
                if(rows === undefined){
                    reject(new Error('Cannot get group id'));
                }else{
                    resolve(rows);
                }
            }
        )}
    )}


const getGroupById = function(groupId){
    return new Promise(function(resolve, reject){
        pool.query(
            'SELECT * FROM `group` WHERE `id` = ?',
            [groupId],
            function(err, rows){
                if(rows === undefined){
                    reject(new Error('Cannot get group id'));
                }else{
                    resolve(rows);
                }
            }
        )}
    )}


const getAllGroup = function(clientId, groupId){
    return new Promise(function(resolve, reject){
        pool.query(
            'DELETE FROM `member` WHERE `client_id` = ? AND `group_id` = ?',
            [clientId, groupId],
            function(err, rows){
                if(rows === undefined){
                    reject(new Error('Cannot get group id'));
                }else{
                    resolve(rows);
                }
            }
        )}
    )}

module.exports = { createGroup, insertGroup, getGroupId, leaveGroup, getAllGroup,getGroupById };