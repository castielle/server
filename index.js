const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');

const { addUser, removeUser, getUser, getUsersInRoom, createUser,createUserNew } = require('./src/models/users');
const { createGroup } = require('./src/models/group');
const { createMember } = require('./src/models/member');



const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(cors());
const router = require('./router');

const { pool, getConnection } = require('./database');

const s = new Date().getSeconds();


// Insert post 1
// app.get('/addpost1', (req, res) => {
//
//
//     // pool.query("SELECT `id`,`name` FROM client WHERE name = ?", ["new1"],(err, rows) => {
//     //     console.log(rows);
//     //     connection.release();
//     //     }
//     // );
//
//
//     pool.query("SELECT `id`,`name` FROM client WHERE name = ?", ["new1"],(err, rows) => {
//         // if(err) {
//         //     callback(err);
//         // } else {
//         console.log(rows[0].id);
//         res.send('Post 1 added...');
//         // }
//     });
// });


// add listener for new connection
io.on('connect', (socket) => {

    // socket.on('test', ({name,room}, callback) => {
    //     console.log('test');
    //     callback();
    // });

    // console.log('we have a new connection');

    // server listen from each client via its socket
    // join handler
    socket.on('join', ({name,room}, callback) => {
        console.log(name,room);

        // put in object to destructure
        const { error, user } = addUser({ id: socket.id, name, room });

        if(error)
            return callback(error);

        // tell user
        socket.emit('message', { user: 'admin', text: `${user.name}, welcome to room ${user.room}.`});

        // tell room new user has joined
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` });

        socket.join(user.room);

        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

        // back to client front end; don't pass error so first one did not run
        callback();
        // const error = true;
        // if(error) {
        //     callback({error:'error'});
        // }

    });

    socket.on('newUser', ({name,room}, callback) => {
        console.log(name,room);

        // var client_id = '';

        // let client = getClientByName(name);
        // console.log(client);

        getEmployeeNames = function(name){
            return new Promise(function(resolve, reject){
                pool.query(
                    "SELECT `id`,`name` FROM client WHERE name = ?", [name],
                    function(err, rows){
                        if(rows === undefined){
                            reject(new Error("Error rows is undefined"));
                        }else{
                            resolve(rows);
                        }
                    }
                )}
            )}
        var client_id = '';

        getEmployeeNames('new1')
            .then(function(results){
                client_id=results[0];

                console.log(client_id.id);
            })
            .catch(function(err){
                console.log("Promise rejection error: "+err);
            })


        // try {
        //     client_id = createUser({ name, room });
        // }
        // catch (error) {
        //     console.error(error);
        // }
        //
        // // console.log('client', client_id);
        //
        // try {
        //     const { group_id } = createGroup({ name, room });
        // }
        // catch (error) {
        //     console.error(error);
        // }
        //
        // try {
        //     const { userRoom } = createMember({ name, room });
        // }
        // catch (error) {
        //     console.error(error);
        // }

        // back to client front end; don't pass error so first one did not run
        callback();
        // const error = true;
        // if(error) {
        //     callback({error:'error'});
        // }

    });

    // sendMessage handler: get message from user
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);

        // send to everyone in room
        io.to(user.room).emit('message', { user: user.name, text: message });
        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});

        callback();
    });


    // socket.on('who', ({name}) => {
    //     console.log(name);
    // });

    socket.on('disconnect', () => {
        console.log('user has left');

        const user = removeUser(socket.id);

        if(user) {
            io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has left.` });
            io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
        }
    });
} )

app.use(router);

server.listen(PORT, () => console.log(`server has started on port ${PORT}`));

