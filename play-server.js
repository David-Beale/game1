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
let usedBullets = [];
let mapSize = 2000
function getRndInteger (min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
function distance (x1, y1, x2, y2) {
  return Math.floor(Math.abs(Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))))
}
function playerCheck () {
  Object.values(players).forEach(player => {
    food.forEach(fd => {
      if (distance(player.x, player.y, fd.x, fd.y) < player.r) {
        io.to(`${player.id}`).emit('foodEaten')
        fd.x = getRndInteger(-mapSize, mapSize);
        fd.y = getRndInteger(-mapSize, mapSize);
      }
    })
    if (Object.values(bullets).flat().length) {
      Object.values(bullets).flat().forEach((bullet, index) => {
        let d = distance(player.x, player.y, bullet.x, bullet.y)
        if (d < player.r && !usedBullets.includes(`${bullet.id}: ${bullet.bulletId}`)) {
          usedBullets.push( `${bullet.id}: ${bullet.bulletId}`)
          io.to(`${player.id}`).emit('hit')
          io.to(`${bullet.id}`).emit('deleteBullet')
          bullets[bullet.id].splice(index, 1);
        }
      })
    }
  })
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
  playerCheck();
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
