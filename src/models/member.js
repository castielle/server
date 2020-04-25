const { pool, getConnection } = require('../../database');


const createMember = ({ name, room }) => {
    try {
        pool.query('INSERT INTO `member` (`client_id`,`group_id`,`last_msg_id`) VALUES (?,?,NULL)', [name, room], (err, rows) => {
            // console.log(rows[0].id);
            console.log('insert member success')
        });}
    catch(error) {
        console.error(error);
    }

    const userRoom = { name, room };

    return { userRoom };
}


module.exports = { createMember };