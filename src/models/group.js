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
module.exports = { createGroup, insertGroup, getGroupId };