const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');

const { addUser, removeUser, getUser, getUsersInRoom } = require('./src/models/user');
const { createGroup, insertGroup, getGroupId } = require('./src/models/group');
const { createMember, insertMembership } = require('./src/models/member');
const { createClient, getClientId, insertClient } = require('./src/models/client');
const { insertMessage } = require('./src/models/message');

"use strict";

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
    var clientId;
    var groupId;

    // server listen from each client via its socket
    // join handler
    socket.on('join', async ({name,room}, callback) => {
        console.log(name,' has logged in room ', room);
        //
        // // socket.emit('news', { hello: 'world' });
        //
        // // put in object to destructure
        const { error, user } = addUser({ id: socket.id, name, room });

        if(error)
            return callback(error);

        // tell user
        socket.emit('message', { user: 'admin', text: `${user.name}, welcome to room ${user.room}.`});

        // tell room new user has joined
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` });

        socket.join(user.room);

        try {
            let resultOfInsertClient = await insertClient(name);
            console.log('sync' + resultOfInsertClient);
        } catch (e) {}


        let resultsOfGetClientId = await getClientId(name);
        console.log('clientId' + JSON.stringify(resultsOfGetClientId, null,4));
        const clientId = resultsOfGetClientId[0].id;


        try {
            let resultsOfInsertGroup = await insertGroup(room);
        } catch (e) {}


        let resultsOfGetGroupId = await getGroupId(room);
        const groupId = resultsOfGetGroupId[0].id;
        console.log('groupId ' + groupId);


        try {
            let resultsOfInsertMembership = await insertMembership(clientId, groupId);
        } catch (e) {}


        // io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has left.` });
        socket.emit('clientId', { clientId: clientId, groupId: groupId });


        // back to client front end; don't pass error so first one did not run
        callback();

    });


    socket.on('getMessages', ({name,room}, callback) => {
        // const user = getUser(socket.id);

        io.to(socket.id).emit('hello');

        callback();

    });


    // sendMessage handler: get message from user
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);

        // send to everyone in room
        io.to(user.room).emit('message', { user: user.name, text: message });
        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});

        // create new client


        insertMessage(message, clientId, groupId)
            .then(function(results){
                // client_id=results[0];
                // console.log(client_id.id);
            })
            .catch(function(err){
                console.log("Promise rejection error: "+err);
            })

        callback();
    });


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

