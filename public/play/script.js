let socket;
let player
let border;
let food = []
let players = [];
const initRadius = Math.floor(Math.sqrt(10000 / Math.PI))
let scaleFactor = 1;

function setup () {
  socket = io.connect('http://localhost:4000')
  createCanvas(window.innerWidth, window.innerHeight);
  background(39, 43, 48)
  player = new Player(0, 0, 10000, 2000);

  for (let i = 0; i < 50; i++) {
    food.push(new Player(random(-2000, 2000), random(-2000, 2000), 2000, 1))
  }
  border = new Border(-2000,-2000,4000)
  socket.on('heartbeat', data =>{
    players = data;
  } );
}


function draw () {
  background(255)
  let camera = createVector((width / 2 - player.pos.x), (height / 2 - player.pos.y))
  translate(width/2, height/2)
  let newScaleFactor = initRadius/player.radius
  scaleFactor = lerp(scaleFactor, newScaleFactor, 0.2)
  scale(scaleFactor)
  translate(-player.pos.x, -player.pos.y)
  border.render();
  player.animate(camera)
  food.forEach(fd => {
    if (p5.Vector.dist(player.pos, fd.pos) < player.radius + fd.radius) {
      player.mass += fd.mass;
      player.updateRadius();
      fd.pos = createVector(random(-2000, 2000), random(-2000, 2000));
    }
    fd.render()
  })
  players.forEach( plyr => {
    if (plyr.id !== socket.id) {
      fill(0, 0, 255);
      console.log('go')
      circle(plyr.x, plyr.y, plyr.r*2);
    }
  })
  player.render()
  socket.emit('update', {
    id: socket.id,
    x: player.pos.x,
    y: player.pos.y,
    r: player.radius
  });
}