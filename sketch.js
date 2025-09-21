class Pulley {
  constructor() {
    this.x = 300;
    this.y = 200;
    this.radius = 40;
    this.angle = 0;
    this.loadHeight = 400;
    this.type = "fixed"; // fixed, movable, compound
    this.speed = 0;
    this.isMoving = false;
  }

  display() {
    // Draw rope
    stroke(150);
    strokeWeight(4);
    this.drawRope();

    // Draw pulley wheel
    fill(100);
    stroke(50);
    strokeWeight(2);
    circle(this.x, this.y, this.radius * 2);

    // Draw load
    fill(200, 100, 100);
    rect(this.x - 30, this.loadHeight, 60, 40);
  }

  drawRope() {
    switch (this.type) {
      case "fixed":
        line(this.x, 0, this.x, this.loadHeight);
        break;
      case "movable":
        line(this.x - this.radius, 0, this.x - this.radius, this.loadHeight);
        line(this.x + this.radius, 0, this.x + this.radius, this.loadHeight);
        break;
      case "compound":
        line(this.x - this.radius, 0, this.x - this.radius, this.loadHeight);
        line(this.x, 0, this.x, this.loadHeight);
        line(this.x + this.radius, 0, this.x + this.radius, this.loadHeight);
        break;
    }
  }

  update() {
    if (this.isMoving) {
      this.angle += this.speed;
      this.loadHeight += this.speed;

      // Limit movement
      this.loadHeight = constrain(this.loadHeight, 200, 400);
      if (this.loadHeight <= 200 || this.loadHeight >= 400) {
        this.isMoving = false;
      }
    }
  }

  changeType() {
    switch (this.type) {
      case "fixed":
        this.type = "movable";
        break;
      case "movable":
        this.type = "compound";
        break;
      case "compound":
        this.type = "fixed";
        break;
    }
  }
}

let pulley;

function setup() {
  const canvas = createCanvas(600, 500);
  canvas.parent("canvasContainer");
  pulley = new Pulley();
}

function draw() {
  background(220);
  pulley.update();
  pulley.display();
}

function mousePressed() {
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    pulley.changeType();
  }
}

function keyPressed() {
  if (keyCode === 32) {
    // Space bar
    pulley.isMoving = !pulley.isMoving;
    pulley.speed = pulley.speed === 0 ? -2 : 0;
  } else if (keyCode === UP_ARROW) {
    pulley.speed *= 1.2;
  } else if (keyCode === DOWN_ARROW) {
    pulley.speed *= 0.8;
  }
}
