const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');

const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(cors());
const router = require('./router');


io.on('connect', (socket) => {
    // console.log('we have a new connection');

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

