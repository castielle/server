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




module.exports = { createGroup };