const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;
const path = require('path');


app.use(express.static(path.join(__dirname, 'public/play')));

const server = app.listen(PORT, console.log(`Server started on port ${PORT}: http://localhost:${PORT}`));

const io = require('socket.io')(server);
const players = {};
let food = [];
let bullets = {};
let mapSize = 2000
function getRndInteger (min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
class Food {
  constructor(x, y) {
    this.mass = 2000;
    this.x = x;
    this.y = y;
    this.radius = 15;
  }
}
for (let i = 0; i < 100; i++) {
  food.push(new Food(getRndInteger(-mapSize, mapSize), getRndInteger(-mapSize, mapSize)))
}
setInterval(heartbeat, 33);
function heartbeat () {
  io.sockets.emit('heartbeat', {
    players: Object.values(players),
    food,
    bullets: Object.values(bullets).flat(),
  });
}


io.sockets.on('connection', socket => {
  console.log('new connection ' + socket.id)

  socket.on('updatePlayer', data => {
    players[socket.id] = data;
  })
  socket.on('updateBullets', data => {
    bullets[socket.id] = data.bullets;
  })
  socket.on('hit', bullet => {
    io.to(`${bullet.id}`).emit('deleteBullet', bullet.bulletId)
  })
  socket.on('foodEaten', index => {
    food[index].x = getRndInteger(-2000, 2000);
    food[index].y = getRndInteger(-2000, 2000);
    io.sockets.emit('heartbeat', {
      players: Object.values(players),
      food,
    });
  })
  socket.on('playerEaten', id => {
    io.to(`${id}`).emit('dead', 'You died')
    delete players[id]
    io.sockets.emit('heartbeat', {
      players: Object.values(players),
      food,
    });
  })

  socket.on('disconnect', () => {
    delete players[socket.id]
    delete bullets[socket.id]
    console.log('Client has disconnected');
  });
});
