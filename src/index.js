const express = require('express')
const socketio = require("socket.io")
const http = require("http")
const path = require('path');
const app = express()
const server = http.createServer(app)
const port = process.env.PORT || 3000
const io = socketio(server)
const Filter = require("bad-words")
const {generateMessage} = require("./utils/messages")
const {addUser, removeUser, getUsers, getUsersInRoom, getUser} = require("./utils/users")

app.use(express.static(path.join(__dirname, '../static')));


io.on("connection", (socket)=>{
  console.log("New WebSocket connection")

  socket.on("join", (options,callback)=>{
    const {error, user} = addUser({id:socket.id, ...options})
    console.log("USER : ", user)
    if(error){
      return callback(error)
    }
    socket.join(user.room)
    socket.emit("message", generateMessage("Admin", user.room, "Welcome!"))
    socket.broadcast.to(user.room).emit("message", generateMessage("Admin",user.room,`${user.username} has joined!`))
    io.to(user.room).emit("roomData",{
      room:user.room,
      users:getUsersInRoom(user.room)
    })

    socket.on("sendMessage", (msg, callback)=>{
      const user = getUser(socket.id);
      console.log(user)
      const filter = new Filter();
      if (filter.isProfane(msg)){
        return callback("Profanity is not allowed")
      }
      console.log(generateMessage(user.username, user.room,msg))
      io.to(user.room).emit("message", generateMessage(user.username, user.room,msg))
      callback("Message delevered!");
    })
    socket.on("location", (username, room, long,lati, callback)=>{
      io.to(room).emit("locationMessage", generateMessage(username, room,`https://google.com/maps?q=${lati},${long}`))  
      callback();
    })
    socket.on("disconnect", ()=>{
      const user = removeUser(socket.id)
      if(user){
        io.to(user.room).emit("message", generateMessage("Admin", user.room, `${user.username} has left`))
        io.to(user.room).emit("roomData",{
          room:user.room,
          users:getUsersInRoom(user.room)
        })
      }
    })
  })
})

server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

