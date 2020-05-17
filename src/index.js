const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const {generateMessage} = require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')
const app = express()
const server = http.createServer(app)
const io = socketio(server)
// var spawn = require('child_process').spawn

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    socket.on('join', (options, callback) => {
        const {user, error} = addUser({id:socket.id, ...options })
        if(error){
             return callback(error)
        }
        socket.join(user.room)

        socket.emit('message', generateMessage({username:'Admin', text:'Welcome!'}))
        socket.broadcast.to(user.room).emit('message', generateMessage({text: `${user.username} has joined!`}))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()  
    })
    

    socket.on('sendMessage', async (message, callback) => {
        const {user,error} = getUser(socket.id)
        if(error){
            return callback(error)
        }
        var spawn = require('child_process').spawn;

        if(user.room === "flight"){
            function runScript(){
                return spawn('python', [
                   "-u",
                   path.join(__dirname, './flight room/predict.py'),
                  message,
                ]);
             }
             const subprocess = runScript()
             // print output of script
             subprocess.stdout.on('data', (data) => {
                console.log(`data:${data}`);
             });
             subprocess.stderr.on('data', (data) => {
                console.log(`error:${data}`);
             });
             subprocess.stderr.on('close', () => {
                console.log("Closed");
             });
        }
        

        io.to(user.room).emit('message', generateMessage({username: user.username, text:message}))
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        const {user,error} = getUser(socket.id)
        if(error){
            return callback(error)
        }
        const url = `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
        io.to(user.room).emit('locationMessage', generateMessage({text:url, username: user.username}))
        callback();
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)        
        if(user) {
            io.to(user.room).emit('message', generateMessage({username: user.username, text:`${user.username} has left!`}))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
        
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})