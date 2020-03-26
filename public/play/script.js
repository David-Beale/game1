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
let mapSize = 2000
let face;
let name;
let faces = {};
let profileImage;
let dbID;

async function preload () {
  url = window.location.href;
  let id = getQueryParams('a', url);
  let pw = getQueryParams('b', url);
  name = '';
  font = loadFont('./font.otf');
  if (id && pw) {
    // await fetch(`http://localhost:4000/profile/?a=${id}&b=${pw}`)
    await fetch(`https://db-game1.herokuapp.com/profile/?a=${id}&b=${pw}`)
      .then(res => res.status < 400 ? res : Promise.reject(res))
      .then(res => {
        return res.json()
      })
      .then(data => {
        name = data.name
        dbID = data._id;
        profileImage = data.avatar
      })
  }

}

function setup () {
  socket = io();

  createCanvas(window.innerWidth, window.innerHeight);
  background(39, 43, 48)
  let camera = createVector(0, 0)
  mouseX = width / 2;
  mouseY = height / 2;
  player = new Player(0, 0, 10000, mapSize, face);
  border = new Border(-mapSize, -mapSize, mapSize * 2)
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
    console.log(bulletId)
    myBullets = myBullets.filter(bullet => {
      return bullet.bulletId !== bulletId;
    })
    socket.emit('updateBullets', {
      bullets: genBulletData(),
    });
  });
  socket.on('foodEaten', () => {
    if (player.mass < 50000) {
      player.mass += 2000;
      player.updateRadius();
    }
    if (ammo < 10) ammo += 0.2;
  });
  socket.on('hit', () => {
    console.log('hit')
    player.mass = Math.floor(player.mass * 0.75);
    player.updateRadius();
    if (player.mass < 10000) alive = false;
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
  if (profileImage) {
    player.face = loadImage(profileImage);
    profileImage = '';
  }
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
        animateBullet(bullet.x, bullet.y, bullet.heading);
      })
    }
    renderFood();
    player.animate(camera)
    renderText(name, 20, 'red', player.pos.x, player.pos.y, -30);
    renderText(`Ammo ${Math.floor(ammo)}/10`, 13, 'blue', player.pos.x, player.pos.y, 38);
    renderText(`Mass: ${player.mass / 1000}`, 13, 'blue', player.pos.x, player.pos.y, 50);
    socket.emit('updatePlayer', {
      id: socket.id,
      x: player.pos.x,
      y: player.pos.y,
      r: player.radius,
      mass: player.mass,
      name,
      dbID,
    });
    socket.emit('updateBullets', {
      bullets: genBulletData(),
    });
  } else {
    renderText('YOU DIED', 50, 'red', player.pos.x, player.pos.y);
  }
}

function renderFood () {
  food.forEach((fd) => {
    fill(0, 255, 0);
    circle(fd.x, fd.y, fd.radius * 2);
  })
}
function renderOtherPlayers () {
  players.forEach((plyr) => {
    if (plyr.id !== socket.id) {
      let playerDist = dist(player.pos.x, player.pos.y, plyr.x, plyr.y)
      if (playerDist < player.radius && player.radius > plyr.r * 1.2) {
        console.log('omnomnom')
        socket.emit('playerEaten', plyr.id);
        player.mass += plyr.mass;
        plyr.mass = 0;
        player.updateRadius();
      }
      if (plyr.dbID && !faces[plyr.id]) {
        getPlayerPic(plyr.id, plyr.dbID);
        faces[plyr.id] = 'loading'
      }
      if (faces[plyr.id] && faces[plyr.id] !== 'loading') {
        image(faces[plyr.id], plyr.x - plyr.r, plyr.y - plyr.r, plyr.r * 2, plyr.r * 2);
      } else {
        fill(0, 0, 255);
        circle(plyr.x, plyr.y, plyr.r * 2);
      }
      renderOtherText(plyr.name, 20, 'blue', plyr.x, plyr.y, plyr.r, -30);
    }
  })
}
function renderText (name, size, color, xPos, yPos, offset = 0) {
  let x = xPos;
  let y = yPos + offset / scaleFactor;
  let bbox = font.textBounds(name, x, y, size / scaleFactor);
  fill(255);
  rect(bbox.x - 2, bbox.y, bbox.w + 4, bbox.h);

  fill(color);
  textAlign(CENTER);
  textFont(font);
  textSize(size / scaleFactor);
  text(name, x, y);
}
function renderOtherText (name, size, color, xPos, yPos, radius, offset = 0) {
  let newSF = scaleFactor * (player.radius / radius)
  let x = xPos;
  let y = yPos + offset / newSF;
  let bbox = font.textBounds(name, x, y, size / newSF);
  fill(255);
  rect(bbox.x - 2, bbox.y, bbox.w + 4, bbox.h);

  fill(color);
  textAlign(CENTER);
  textFont(font);
  textSize(size / newSF);
  text(name, x, y);
}

function animateBullet (x, y, heading) {
  push();
  translate(x, y)
  rotate(heading);
  fill(255);
  ellipse(0, 0, 35, 7);
  pop();
}

function genBulletData () {
  return myBullets.map(bullet => {
    return {
      id: socket.id,
      x: bullet.pos.x,
      y: bullet.pos.y,
      heading: bullet.heading,
      bulletId: bullet.bulletId,
    }
  })

}
function getQueryParams (params, url) {

  let href = url;
  let reg = new RegExp('[?&]' + params + '=([^&#]*)', 'i');
  let queryString = reg.exec(href);
  return queryString ? queryString[1] : null;
};

function getPlayerPic (socketID, dbID) {
  fetch(`https://db-game1.herokuapp.com/face/?a=${dbID}`)
    .then(res => res.status < 400 ? res : Promise.reject(res))
    .then(res => {
      return res.json()
    })
    .then(data => {
      if (data) {
        faces[socketID] = loadImage(data.avatar)
      }
    })
}
