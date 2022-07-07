const express = require('express');
const socket = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser,userLeave,getRoomUsers} = require('./utils/users');

const app = express();
const server = app.listen(3000, () => console.log(`Server started on port 3000`));
const io = socket(server);

const botname = '';

// Set static folder
app.use(express.static('public'));
 
//RUN WHEN CLIENT CONNECTS
io.on('connection',socket => {

    //New User Join
    socket.on('joinRoom',({username,room})=>{
        //Each new connection is assigned a random 20-characters identifier, i.e., socket.id .
        const user = userJoin(socket.id,username,room);
        socket.join(user.room);
        //welcome current user, message is a buit in event
        socket.emit('message',formatMessage(botname,'Welcome to Wassup!'));
        //BROADCAST WHEN A USER CONNECT
        socket.broadcast.to(user.room).emit('message', formatMessage(botname,`${user.username} joined the chat`));
        //Send users and room info
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    // Listen for chatMessage
    socket.on('chatMessage',(msg)=>{
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username,msg));
    });

    // User Typing
    socket.on('typing',(data)=>{
        socket.broadcast.to(data.room).emit('typing',`${data.username} is typing...`);
    });

    // User leaves chat
    socket.on('disconnect',()=>{
        const user = userLeave(socket.id);
        if(user){
            io.to(user.room).emit('message',formatMessage(botname,`${user.username} has left the chat`) );
        }
        //Send users and room info
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });
});
