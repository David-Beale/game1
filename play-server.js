const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;
const path = require('path');


app.use(express.static(path.join(__dirname, 'public')));

const server = app.listen(PORT, console.log(`Server started on port ${PORT}: http://localhost:${PORT}`));

const io = require('socket.io')(server);
const players = {};
let food = []
function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}
class Food {
  constructor(x, y) {
    this.mass = 2000;
    this.x = x;
    this.y = y;
    this.radius = 25;
  }
}
for (let i = 0; i < 50; i++) {
  food.push(new Food(getRndInteger(-2000, 2000), getRndInteger(-2000, 2000)))
}
setInterval(heartbeat, 33);
function heartbeat () {
  io.sockets.emit('heartbeat', {
    players: Object.values(players),
    food,
  });
}


io.sockets.on('connection', socket => {
  console.log('new connection ' + socket.id)

  socket.on('update', data => {
    players[socket.id] = data;
  })
  socket.on('foodEaten', index => {
    food[index].x = getRndInteger(-2000, 2000);
    food[index].y = getRndInteger(-2000, 2000);
  })

  socket.on('disconnect', () => {
    delete players[socket.id]
    console.log('Client has disconnected');
  });
});
