let socket;
let player
let border;
let food = []
let players = [];
const initRadius = Math.floor(Math.sqrt(10000 / Math.PI))
let scaleFactor = 1;
let alive = true;
let ammo = 0;
let myBullets = [];
let allBullets = [];
let bulletCounter = 0;
let hitByArray = [];
let hitResetCounter = 0;
let previousLength = 1;
// let lives = 1;
let mapSize = 2000


function setup () {
  socket = io.connect('https://db-game1.herokuapp.com/4000');
  createCanvas(window.innerWidth, window.innerHeight);
  background(39, 43, 48)
  let camera = createVector(0, 0)
  mouseX = width / 2;
  mouseY = height / 2;
  player = new Player(0, 0, 10000, mapSize);
  border = new Border(-mapSize, -mapSize, mapSize*2)
  socket.on('heartbeat', data => {
    players = data.players;
    food = data.food;
    allBullets = data.bullets;
  });
  socket.on('dead', data => {
    console.log(data)
    alive = false;
  });
  socket.on('deleteBullet', bulletId => {
    myBullets = myBullets.filter(bullet => {
      return bullet.bulletId !== bulletId;
    })
  });
}
function mouseClicked () {
  if (ammo >= 1) {
    let target = createVector(mouseX - camera.x, mouseY - camera.y)
    let newVector = target.sub(player.pos)
    myBullets.push(new Bullet(newVector, player.pos.x, player.pos.y, player.radius, bulletCounter))
    bulletCounter++;
    ammo--;
  }
}

function draw () {
  background(255)
  camera.x = (width / 2 - player.pos.x)
  camera.y = (height / 2 - player.pos.y)
  translate(width / 2, height / 2)
  let newScaleFactor = initRadius / player.radius
  scaleFactor = lerp(scaleFactor, newScaleFactor, 0.2)
  scale(scaleFactor)
  translate(-player.pos.x, -player.pos.y)
  border.render();

  renderOtherPlayers();
  if (alive) {
    myBullets.forEach((bullet, index) => {
      bullet.update();
      if (bullet.pos.x > mapSize || bullet.pos.x < -mapSize || bullet.pos.y < -mapSize || bullet.pos.y > mapSize) {
        myBullets.splice(index, 1)
      }
    })
    if (allBullets && allBullets.length) {
      allBullets.forEach(bullet => {
        let d = dist(player.pos.x, player.pos.y, bullet.x, bullet.y)
        console.log(d)
        if (d < player.radius && !hitByArray.includes(bullet.bulletId)) {
          socket.emit('hit', bullet);
          hitByArray.push(bullet.bulletId)
          player.mass = Math.floor(player.mass * 0.75);
          // lives = calculateLives();
          player.updateRadius();
          console.log('hit')
          if (player.mass < 10000) alive = false;
        }
        animateBullet(bullet.x, bullet.y, bullet.heading);
      })
    }
    if (hitByArray.length) bulletReset();
    player.animate(camera)
    foodCheck();
    renderText('Dave', 20, 'red');
    renderText(`Ammo ${Math.floor(ammo)}/10`, 13, 'blue', 20);
    renderText(`Mass: ${player.mass/1000}`, 13, 'blue', 40);
    socket.emit('updatePlayer', {
      id: socket.id,
      x: player.pos.x,
      y: player.pos.y,
      r: player.radius,
      mass: player.mass,
    });
    let bulletData = myBullets.map(bullet => {
      return {
        id: socket.id,
        x: bullet.pos.x,
        y: bullet.pos.y,
        heading: bullet.heading,
        bulletId: bullet.bulletId,
      }
    })
    socket.emit('updateBullets', {
      bullets: bulletData,
    });
  } else {
    renderText('YOU DIED', 50, 'red');
  }
}

function foodCheck () {
  food.forEach((fd, index) => {
    if (fd.radius>0 && dist(player.pos.x, player.pos.y, fd.x, fd.y) < player.radius + fd.radius) {
      if (player.mass < 50000) {
        player.mass += fd.mass;
        // lives = calculateLives();
        player.updateRadius();
      }
      if (ammo < 10) ammo += 0.2;
      socket.emit('foodEaten', index);
      fd.radius=0;
    } else {
      fill(0, 255, 0);
      circle(fd.x, fd.y, fd.radius * 2);
    }
  })
}
function renderOtherPlayers () {
  players.forEach((plyr) => {
    if (plyr.id !== socket.id) {
      let playerDist = dist(player.pos.x, player.pos.y, plyr.x, plyr.y)
      if (playerDist < player.radius && player.radius > plyr.r * 1.2) {
        socket.emit('playerEaten', plyr.id);
        player.mass += plyr.mass;
        // lives = calculateLives();
        player.updateRadius();
      }
      fill(0, 0, 255);
      circle(plyr.x, plyr.y, plyr.r * 2);
    }
  })
}
function renderText (name, size, color, offset = 0) {
  fill(color);
  textAlign(CENTER);
  textSize(size / scaleFactor);
  text(name, player.pos.x, player.pos.y + offset/scaleFactor);
}

function animateBullet (x, y, heading) {
  push();
  translate(x, y)
  rotate(heading);
  fill(255);
  ellipse(0, 0, 35, 7);
  pop();
}
function bulletReset () {
  hitResetCounter++
  if (previousLength === hitByArray.length && hitResetCounter === 60) {
    hitByArray = []
    hitResetCounter = 0;
    previousLength = 1;
  } else if (previousLength < hitByArray.length) hitResetCounter = 0;
  previousLength = hitByArray.length;
};
// function calculateLives () {
//   let myMass = player.mass
//   let lifeCounter = 0;
//   while (myMass > 10000) {
//     myMass *= 0.75
//     lifeCounter++;
//   }
//   return lifeCounter
// }
