// 🚀

const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
// const io = socketio(server);

app.use(cors());

// const io = socketio(server);

const io = require("socket.io")(server, {
  cors: {
    origins: ["http://localhost:5000"],
  },
});

const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");

const router = require("./router");

app.use(router);

io.on("connect", (socket) => {
  console.log("socket io connected in srever side 🚀🚀");
  // when set the room number and name  execute {{join}}
  socket.on("join", ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });
    console.log(socket.id, name, room);
    if (error) return callback(error);

    // add this new user.room to socket
    socket.join(user.room);
    // send this message to client to show to all room users

    socket.emit("message", {
      user: "admin",
      text: `${user.name}, welcome to room ${user.room}.`,
    });

    //send to all connected clients except the one that sent the message
    socket.broadcast ///// others see
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name} has joined!` });

    // io.to mean send only to this room users{ all clients}
    //show user room and allthis users and send it to react side
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    // current online user
    const user = getUser(socket.id);

    // first recive message from sender
    // second show this message in user.room
    // send message to all this user room this current user.name and this user his message
    io.to(user.room).emit("message", { user: user.name, text: message });

    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit("message", {
        user: "Admin",
        text: `${user.name} has left.`,
      });
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

PORT = 5000;

server.listen(process.env.PORT || 5000, () =>
  console.log(`Server started at post ${PORT}🚀`)
);
