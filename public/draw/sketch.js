let socket;

function setup () {
  createCanvas(window.innerWidth, window.innerHeight);
  background(39, 43, 48);
  socket = io.connect('http://localhost:4000')
  socket.on('mouse', drawNew)
}

function drawNew (data) {
  noStroke();
  fill(255,0,100);
  circle(data.x, data.y, 30); 
}

function mouseDragged () {
  const data = {
    x: mouseX,
    y: mouseY,
  }
  socket.emit('mouse', data)
  noStroke();
  fill(255);
  circle(mouseX, mouseY, 30); 
}

function draw () {
  // background(39, 43, 48);

}