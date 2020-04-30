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


const insertMembership = function(clientId, groupId){
    return new Promise(function(resolve, reject){
        pool.query(
            'INSERT INTO `member` (`client_id`,`group_id`,`last_msg_id`) VALUES (?,?,NULL)',
            [clientId, groupId],
            // [73, 49],
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


module.exports = { createMember, insertMembership };