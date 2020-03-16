class Border {
  constructor(x, y, size) {
    this.x = x
    this.y = y
    this.size = size;
  }

  render () {
    stroke('white');
    fill(39, 43, 48);
    rect(this.x, this.y, this.size, this.size);
  }
}