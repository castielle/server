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
        console.log(name,' has logged in room ', room);

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

    socket.on('createUser', ({name,room}, callback) => {

        const user = getUser(socket.id);

        insertClient = function(name){
            return new Promise(function(resolve, reject){
                pool.query(
                    'INSERT INTO `client` (`name`) VALUES (?)', [name],
                    function(err, rows){
                        if(rows === undefined){
                            reject(new Error("Error rows is undefined"));
                        }else{
                            resolve(rows);
                        }
                    }
                )}
            )}

        insertClient(name)
            .then(function(results){
                // client_id=results[0];
                // console.log(client_id.id);
            })
            .catch(function(err){
                console.log("Promise rejection error: "+err);
            })


        callback();

    });

    socket.on('registerRoom', ({name,room}, callback) => {

        insertGroup = function(room){
            return new Promise(function(resolve, reject){
                pool.query(
                    'INSERT INTO `group` (`name`) VALUES (?)', [room],
                    function(err, rows){
                        if(rows === undefined){
                            reject(new Error("Error rows is undefined"));
                        }else{
                            resolve(rows);
                        }
                    }
                )}
            )}

        insertGroup(room)
            .then(function(results){
                // client_id=results[0];
                // console.log(client_id.id);
            })
            .catch(function(err){
                console.log("Promise rejection error: "+err);
            })

        addMembership = function(name, room){
            return new Promise(function(resolve, reject){
                pool.query(
                    'INSERT INTO `group` (`name`) VALUES (?)', [room],
                    function(err, rows){
                        if(rows === undefined){
                            reject(new Error("Error rows is undefined"));
                        }else{
                            resolve(rows);
                        }
                    }
                )}
            )}

        addMembership(name, room)
            .then(function(results){
                // client_id=results[0];
                // console.log(client_id.id);
            })
            .catch(function(err){
                console.log("Promise rejection error: "+err);
            })

        callback();

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

