const { pool, getConnection } = require('../../database');

const users = [];


// const createUser = ({ name, room }) => {
const createUserNew = ({ name, room }) =>  {
    var client_id = '';

    pool.query('INSERT INTO `client` (`name`) VALUES (?)', [name],(err, rows) => {
        client_id = rows.insertId;
        console.log(client_id);
        // console.log('plus', client_id+5);
        console.log('insert user success')
    });

    // console.log(rows.insertId);
    // const user = { name, room };

    return client_id;
}


// const createUser = ({ name, room }) => {
const createUser = ({ name, room }) =>  {
    var client_id = '';

    pool.query('INSERT INTO `client` (`name`) VALUES (?)', [name],(err, rows) => {
        client_id = rows.insertId;
        console.log(client_id);
        // console.log('plus', client_id+5);
        console.log('insert user success')
    });

    // console.log(rows.insertId);
    // const user = { name, room };

    return client_id;
}
//
// function getClientByName({name,room}) {
//     return new Promise(async (resolve, reject) => {
//         const conn = await getConnection()
//         conn.query('SELECT * FROM `client` WHERE `name` = ?', ['123'], (err, rows) => {
//             if (err) reject('Cannot get client by name')
//             else if (rows.length == 0) resolve(null)
//             else resolve(rows[0])
//             conn.release()
//         })
//     })
// }


const addUser = ({ id, name, room }) => {

    name = name.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // if user already exists, return existing user
    // var existingUser1 = '';
    // pool.query("SELECT `id`,`name` FROM client WHERE name = ?", [name],(err, rows) => {
    //     console.log(arguments);
    //     if(err) {
    //         throw(err);
    //     } else {
    //         if (rows) {
    //
    //         }
    //         // console.log(rows[0].id);
    //
    //     }
    // });

    const existingUser = users.find((user) => user.room === room && user.name === name);

    if(!name || !room)
        return { error: 'Username and room are required.' };

    if(existingUser)
        return { error: 'Username is taken.' };

    const user = { id, name, room };

    users.push(user);

    return { user };
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);

    if(index !== -1) return users.splice(index, 1)[0];
}

const getUser = (id) => users.find((user) => user.id === id);

const getUsersInRoom = (room) => users.filter((user) => user.room === room);

module.exports = { addUser, removeUser, getUser, getUsersInRoom, createUser,createUserNew };