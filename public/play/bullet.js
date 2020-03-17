class Bullet {
  constructor(vector, x, y, radius,id) {
    this.target = vector;
    this.target.setMag(radius+17);
    this.heading = this.target.heading();
    this.pos = createVector(x, y);
    this.pos.add(this.target)
    this.target.setMag(20)
    this.bulletId = id;
  }

  update () {
    this.pos.add(this.target)
  }   

  
}