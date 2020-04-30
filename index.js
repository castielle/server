const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');

const { addUser, removeUser, getUser, getUsersInRoom } = require('./src/models/user');
const { createGroup, insertGroup, getGroupId } = require('./src/models/group');
const { createMember, insertMembership, getLastMessageId, updateLastMessage } = require('./src/models/member');
const { createClient, getClientId, insertClient } = require('./src/models/client');
const { insertMessage, getMessage } = require('./src/models/message');

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


    // sendMessage handler: get message from user
    socket.on('sendMessage',  async (message, clientId, groupId, callback) => {
        const user = getUser(socket.id);

        // send to everyone in room
        io.to(user.room).emit('message', { user: user.name, text: message });
        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});

        let resultsOfInsertMessage = await insertMessage(message,clientId,groupId);
        console.log('insert message' + JSON.stringify(resultsOfInsertMessage, null,4));
        const lastMessageId = resultsOfInsertMessage.insertId;
        console.log(lastMessageId);

        let resultsOfGetLastMessage = await getMessage(lastMessageId);
        console.log('last msg' + JSON.stringify(resultsOfGetLastMessage, null,4));
        const lastMessage = resultsOfGetLastMessage;
        console.log(lastMessage);

        let resultsOfUpdateLastMessage = await updateLastMessage(lastMessage[0].posted_by, lastMessage[0].group_id, lastMessageId);
        console.log('update last message' + JSON.stringify(resultsOfUpdateLastMessage, null,4));

        callback();
    });


    socket.on('getUnread',  async (clientId, groupId) => {
        const user = getUser(socket.id);
                
        let resultsOfGetLastMessageId = await getLastMessageId(clientId,groupId);
        console.log('last message' + JSON.stringify(resultsOfGetLastMessageId, null,4));

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

