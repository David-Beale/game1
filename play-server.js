const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;
const path = require('path');


app.use(express.static(path.join(__dirname, 'public')));

const server = app.listen(PORT, console.log(`Server started on port ${PORT}: http://localhost:${PORT}`));

const io = require('socket.io')(server);
const players = {};
setInterval(heartbeat, 33);
function heartbeat () {
  io.sockets.emit('heartbeat', Object.values(players));
}


io.sockets.on('connection', socket => {
  console.log('new connection ' + socket.id)

  socket.on('update', data => {
    players[socket.id] = data;
  })
  socket.on('disconnect',() => {
    delete players[socket.id]
    console.log('Client has disconnected');
  });
});
