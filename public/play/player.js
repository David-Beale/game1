class Player {
  constructor(x, y, mass, map) {
    this.mass = mass
    this.pos = createVector(x, y)
    this.radius = Math.floor(Math.sqrt(mass / Math.PI))
    this.map = map;
  }

  animate (camera) {
    let target = createVector(mouseX -camera.x, mouseY -camera.y)
    const d = p5.Vector.dist(this.pos, target)
    target.sub(this.pos)
    target.setMag(Math.min(Math.pow((d / 100), 2), 10))
    this.pos.add(target)
    this.pos.x = constrain(this.pos.x, -this.map+this.radius, this.map-this.radius)
    this.pos.y = constrain(this.pos.y, -this.map+this.radius, this.map-this.radius)
  }
  updateRadius () {
    this.radius = Math.floor(Math.sqrt(this.mass / Math.PI))
  }

  render () {
    fill(255);
    circle(this.pos.x, this.pos.y, this.radius * 2);
  }
}