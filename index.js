const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');

const { addUser, removeUser, getUser, getUsersInRoom } = require('./src/models/user');
const { createGroup, insertGroup, getGroupId, leaveGroup, getAllGroup } = require('./src/models/group');
const { createMember, insertMembership, getLastMessageId, updateLastMessage } = require('./src/models/member');
const { createClient, getClientId, insertClient, getClientById } = require('./src/models/client');
const { insertMessage, getMessage, getUnreadMessage } = require('./src/models/message');

"use strict";
const crypto = require("crypto");


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
    // var clientId;
    // var groupId;
    const serverId = crypto.randomBytes(16).toString("base64");

    // server listen from each client via its socket
    // join handler
    socket.on('join', async ({name,room}, callback) => {
        console.log(name,' has logged in room ', room);

        console.log('server id ' + serverId); // => f9b327e70bbcf42494ccb28b2d98e00e

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
            // console.log('sync' + resultOfInsertClient);
        } catch (e) {}


        let resultsOfGetClientId = await getClientId(name);
        // console.log('clientId' + JSON.stringify(resultsOfGetClientId, null,4));
        const clientId = resultsOfGetClientId[0].id;


        try {
            let resultsOfInsertGroup = await insertGroup(room);
        } catch (e) {}


        let resultsOfGetGroupId = await getGroupId(room);
        const groupId = resultsOfGetGroupId[0].id;
        // console.log('groupId ' + groupId);


        try {
            let resultsOfInsertMembership = await insertMembership(clientId, groupId);
        } catch (e) {}


        let resultsOfGetLastMessageId = await getLastMessageId(clientId,groupId);
        // console.log('last message' + JSON.stringify(resultsOfGetLastMessageId, null,4));


        var lastMessageId = resultsOfGetLastMessageId[0].last_msg_id;
        // console.log(lastMessageId);

        // lastMessageId = lastMessageId - 2;

        let resultsOfGetUnreadMessage = await getUnreadMessage(groupId, lastMessageId);
        // console.log('unread messages' + JSON.stringify(resultsOfGetUnreadMessage, null,4));


        var clientOfMessage;

        // socket.emit('message', { user:'admin', text: 'Missed Messages'});

        for (const element of resultsOfGetUnreadMessage) {

            clientOfMessage = await getClientById(element.posted_by);
            // console.log(clientOfMessage[0].name);
            // socket.emit('message', { user:`${clientOfMessage[0].name}` , text: `${clientOfMessage[0].name} ${element.content}`});
            socket.emit('message', { user:`Missed message sent by user ${clientOfMessage[0].name} at ${element.time}` , text: `${element.content}`});

            // console.log(element.posted_by);
            // clientOfMessage = await getClientById(element.posted_by);
            // console.log(clientOfMessage);
        }

        // io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has left.` });
        socket.emit('clientId', { clientId: clientId, groupId: groupId });


        const resultsOfGetUsersInRoom = getUsersInRoom(user.room);
        // console.log('users in room' + JSON.stringify(resultsOfGetUsersInRoom, null,4));

        var usersInRoom = [];

        for (const element of resultsOfGetUsersInRoom) {
            // console.log(element.name);
            usersInRoom.push(element.name);
        }

        socket.emit('message', { user:`Users in Room: ${usersInRoom}`, text: ''});

        // socket.emit('message', { user:`Server ID: ${serverId}`, text: ''});

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
        // console.log('insert message' + JSON.stringify(resultsOfInsertMessage, null,4));
        const lastMessageId = resultsOfInsertMessage.insertId;
        // console.log(lastMessageId);

        let resultsOfGetLastMessage = await getMessage(lastMessageId);
        // console.log('last msg' + JSON.stringify(resultsOfGetLastMessage, null,4));
        const lastMessage = resultsOfGetLastMessage;
        // console.log(lastMessage);

        let resultsOfUpdateLastMessage = await updateLastMessage(lastMessage[0].posted_by, lastMessage[0].group_id, lastMessageId);
        // console.log('update last message' + JSON.stringify(resultsOfUpdateLastMessage, null,4));



        callback();
    });


    socket.on('usersInRoom',  async (room, callback) => {
        const user = getUser(socket.id);


        const resultsOfGetUsersInRoom = getUsersInRoom(room);
        console.log('users in room' + JSON.stringify(resultsOfGetUsersInRoom, null,4));

        var usersInRoom = [];

        for (const element of resultsOfGetUsersInRoom) {
            console.log(element.name);
            usersInRoom.push(element.name);
        }

        socket.emit('message', { user:`Users in Room: ${usersInRoom}`, text: ''});


        // back to client front end; don't pass error so first one did not run
        callback();

    });


    socket.on('whatGroups',  async (callback) => {
        const user = getUser(socket.id);


        const resultsOfGetAllGroup = getAllGroup();
        console.log('users in room' + JSON.stringify(resultsOfGetAllGroup, null,4));

        var allGroups = [];

        for (const element of resultsOfGetAllGroup) {
            console.log(element.name);
            allGroups.push(element.name);
        }

        socket.emit('message', { user:`Users in Room: ${allGroups}`, text: ''});


        // back to client front end; don't pass error so first one did not run
        callback();

    });


    socket.on('leaveGroup',  async (clientId, groupId, callback) => {

        let resultsOfLeaveGroup = await leaveGroup(clientId, groupId);
        console.log('leaving group' + JSON.stringify(resultsOfLeaveGroup, null,4));

        callback();

    });


    socket.on('serverId',  async (callback) => {

        socket.emit('message', { user:`Server ID: ${serverId}`, text: ''});

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

