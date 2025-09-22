// Katrol Tetap - p5.js
// Interaktif: drag beban, ubah massa, ubah gesekan, play/pause, reset
// Paste this into the p5.js web editor (https://editor.p5js.org/) and run.

let pulley; // objek katrol
let leftMassBox, rightMassBox; // posisi & keadaan kotak beban
let g = 9.81; // percepatan gravitasi (m/s^2), digunakan skala visual
let scalePxPerMeter = 120; // konversi meter -> pixel (untuk gerak visual yang layak)
let timeStep = 1 / 60; // dt simulasi (s)
let playing = true;

// UI elements
let mLeftSlider, mRightSlider, frictionSlider;
let playButton, resetButton;
let infoP;

function setup() {
  let c = createCanvas(900, 640);
  c.parent("canvasContainer");
  angleMode(RADIANS);
  rectMode(CENTER);
  textFont("Inter, Arial, sans-serif");

  // Posisi katrol
  pulley = {
    x: width / 2,
    y: 160,
    r: 70, // radius pulley (px)
    angle: 0, // rotation angle
    angVel: 0,
    inertia: 1, // rotasi effective inertia (umur ringan)
  };

  // Mass boxes initial positions (pixels)
  leftMassBox = new MassBox(
    pulley.x - pulley.r - 20,
    pulley.y + 220,
    50,
    50,
    3
  );
  rightMassBox = new MassBox(
    pulley.x + pulley.r + 20,
    pulley.y + 220,
    50,
    50,
    2
  );

  // create sliders and buttons, parent to simControl
  createSpan("Berat Kiri (kg)").parent("simControl");
  mLeftSlider = createSlider(0.5, 15, leftMassBox.mass, 0.1)
    .parent("simControl")
    .style("width", "120px");
  createSpan("Berat Kanan (kg)").parent("simControl");
  mRightSlider = createSlider(0.5, 15, rightMassBox.mass, 0.1)
    .parent("simControl")
    .style("width", "120px");
  createSpan("Gesekan").parent("simControl");
  frictionSlider = createSlider(0, 1.2, 0.08, 0.01)
    .parent("simControl")
    .style("width", "120px");

  playButton = createButton("Pause").parent("simControl");
  playButton.mousePressed(togglePlay);
  resetButton = createButton("Reset").parent("simControl");
  resetButton.mousePressed(resetSystem);

  infoP = createP("")
    .parent("simControl")
    .style("font-family", "monospace")
    .style("line-height", "1.2em")
    .style("margin", "0 0 0 16px");

  // improve visuals on canvas
  drawingContext.shadowBlur = 0;
}

function draw() {
  background(235, 240, 245);
  drawScene();

  // update masses from sliders (unless dragging overriding mass numeric)
  if (!leftMassBox.dragging) leftMassBox.mass = mLeftSlider.value();
  if (!rightMassBox.dragging) rightMassBox.mass = mRightSlider.value();
  let friction = frictionSlider.value();

  if (playing) {
    for (let i = 0; i < 4; i++) {
      // substeps to keep stability
      simulateStep(timeStep / 4, friction);
    }
  }

  // draw pulley and rope & boxes on top
  drawPulley(pulley);
  drawRope();
  leftMassBox.display();
  rightMassBox.display();

  // UI text
  let acceleration = computeAcceleration(friction);
  let velocity = (rightMassBox.v - leftMassBox.v) / 2; // approximate relative vertical vel
  infoP.html(
    `m kiri: ${nf(leftMassBox.mass, 1, 2)} kg &nbsp;&nbsp; m kanan: ${nf(
      rightMassBox.mass,
      1,
      2
    )} kg<br>` +
      `friction (damping): ${nf(friction, 1, 2)} &nbsp;&nbsp; a: ${nf(
        acceleration,
        1,
        3
      )} m/s²`
  );
}

// ---------- Physics ----------
function simulateStep(dt, friction) {
  // Convert pixel positions to vertical displacement relative to pulley rim
  // We model two masses connected by inextensible rope over ideal fixed pulley with friction torque.
  let m1 = leftMassBox.mass;
  let m2 = rightMassBox.mass;

  // Tension and acceleration from Newton for two masses and rotational inertia of pulley:
  // Equations:
  // m1 * a = T1 - m1 * g
  // m2 * a = m2 * g - T2
  // (T2 - T1) * R - b*omega = I * alpha
  // with rope not slipping: a = alpha * R and assume T1 ~= T2 if pulley mass negligible, but we include pulley inertia.
  // Simplification: treat pulley as having small effective inertia I = pulley.inertia
  let R = pulley.r / scalePxPerMeter; // radius in "meters" (approx)
  if (R <= 0) R = 0.01;

  // convert g to px/s^2 for visuals
  let g_px = g * scalePxPerMeter;

  // Compute acceleration a (px/s^2) using derived formula:
  // a = ( (m2 - m1) * g ) / (m1 + m2 + I/R^2)  (then in meters/s^2)
  let I = pulley.inertia; // effective rotational inertia (kg*m^2)
  // convert masses m1,m2 in kg, g in m/s^2 -> a in m/s^2
  // Use R in meters
  let denom = m1 + m2 + I / (R * R);
  let a_m = ((m2 - m1) * g) / denom; // m/s^2 (positive => m2 goes down)
  // friction torque -> approximate as damping on angular velocity
  // convert a_m to angular acceleration alpha = a_m / R
  // update pulley angular velocity with damping
  let alpha = a_m / R;
  // apply friction/damping to angular velocity
  pulley.angVel += alpha * dt;
  pulley.angVel *= 1 - friction * dt; // simple damping model
  pulley.angle += pulley.angVel * dt; // rad

  // update linear velocities of masses (convert m/s -> px/s)
  let a_px = a_m * scalePxPerMeter;
  // update vertical velocities
  leftMassBox.v += -a_px * dt; // left goes up if a positive (m2 heavier)
  rightMassBox.v += a_px * dt; // right goes down if a positive

  // clamp velocities lightly and update positions unless dragging
  if (!leftMassBox.dragging) leftMassBox.y += leftMassBox.v * dt;
  if (!rightMassBox.dragging) rightMassBox.y += rightMassBox.v * dt;

  // soft constraints to avoid passing through pulley base
  let limitY = height - 80;
  leftMassBox.y = constrain(leftMassBox.y, pulley.y + pulley.r + 30, limitY);
  rightMassBox.y = constrain(rightMassBox.y, pulley.y + pulley.r + 30, limitY);

  // If user manually pulls a mass (dragging), reflect that in velocities
  if (leftMassBox.dragging) {
    leftMassBox.v = 0;
  }
  if (rightMassBox.dragging) {
    rightMassBox.v = 0;
  }

  // === Tambahkan ini agar roda berhenti jika beban sudah mentok ===
  // Jika salah satu beban mentok, set kecepatan sudut dan kecepatan beban = 0
  if (
    leftMassBox.y === pulley.y + pulley.r + 30 ||
    leftMassBox.y === limitY ||
    rightMassBox.y === pulley.y + pulley.r + 30 ||
    rightMassBox.y === limitY
  ) {
    pulley.angVel = 0;
    leftMassBox.v = 0;
    rightMassBox.v = 0;
  }
}

// compute acceleration (m/s^2) as shown in info
function computeAcceleration(friction) {
  let m1 = leftMassBox.mass;
  let m2 = rightMassBox.mass;
  let R = pulley.r / scalePxPerMeter;
  let I = pulley.inertia;
  let denom = m1 + m2 + I / (R * R);
  let a_m = ((m2 - m1) * g) / denom;
  return a_m;
}

// ---------- Drawing helpers ----------
function drawScene() {
  // floor/ground
  noStroke();
  fill(245);
  rect(width / 2, height, width, 160);

  // support frame for pulley (a realistic bracket)
  push();
  translate(pulley.x, pulley.y - 20);
  // mounting beam
  fill(90);
  rect(0, -18, 260, 18, 6);
  // bracket arms
  fill(120);
  rect(-120, 0, 18, 70, 6);
  rect(120, 0, 18, 70, 6);
  pop();

  // subtle shadow under pulley
  drawingContext.shadowOffsetX = 0;
  drawingContext.shadowOffsetY = 8;
  drawingContext.shadowBlur = 30;
  drawingContext.shadowColor = "rgba(0,0,0,0.25)";
  fill(0, 0, 0, 0.15);
  ellipse(pulley.x, pulley.y + pulley.r + 28, pulley.r * 1.85, 26);
  drawingContext.shadowBlur = 0;
}

function drawPulley(p) {
  push();
  translate(p.x, p.y);
  rotate(p.angle);

  // wheel shading and texture
  // rim
  fill(200, 170, 120);
  stroke(110);
  strokeWeight(1.6);
  ellipse(0, 0, p.r * 2.05, p.r * 2.05);

  // groove
  fill(170, 140, 90);
  ellipse(0, 0, p.r * 1.95, p.r * 1.95);

  // spokes - subtle
  stroke(110, 90);
  strokeWeight(2);
  for (let i = 0; i < 8; i++) {
    push();
    rotate((TWO_PI / 8) * i);
    line(0, 0, p.r * 0.65, 0);
    pop();
  }

  // hub
  fill(110);
  noStroke();
  ellipse(0, 0, p.r * 0.6, p.r * 0.6);

  // highlight
  noFill();
  stroke(255, 120);
  strokeWeight(1);
  arc(0, 0, p.r * 2.02, p.r * 2.02, -PI / 3, PI / 6);

  pop();

  // vertical support rod
  stroke(100);
  strokeWeight(6);
  line(p.x, p.y - p.r - 18, p.x, p.y - p.r - 80);
  strokeWeight(1);
}

function drawRope() {
  // Rope path: from left mass up tangent to pulley, around half circle, to right mass.
  strokeWeight(6);
  strokeCap(ROUND);

  // left tangent point
  let leftT = tangentPoint(true);
  let rightT = tangentPoint(false);

  // left segment
  stroke(90, 60, 30);
  line(leftMassBox.x, leftMassBox.y - leftMassBox.h / 2, leftT.x, leftT.y);

  // arc along pulley between tangents (calculate start and end angles)
  let angle1 = atan2(leftT.y - pulley.y, leftT.x - pulley.x);
  let angle2 = atan2(rightT.y - pulley.y, rightT.x - pulley.x);
  // Ensure correct direction to draw rope visually over top of pulley
  noFill();
  strokeWeight(6);
  stroke(90, 60, 30);
  // draw nice arc following correct direction
  arc(pulley.x, pulley.y, pulley.r * 2, pulley.r * 2, angle1, angle2);

  // right segment
  line(rightT.x, rightT.y, rightMassBox.x, rightMassBox.y - rightMassBox.h / 2);

  // small rope texture (dashes)
  strokeWeight(1.4);
  let dashCount = 12;
  for (let i = 0; i <= dashCount; i++) {
    let t = i / dashCount;
    let sx = lerp(leftMassBox.x, leftT.x, t);
    let sy = lerp(leftMassBox.y - leftMassBox.h / 2, leftT.y, t);
    point(sx, sy);
    sx = lerp(rightT.x, rightMassBox.x, t);
    sy = lerp(rightT.y, rightMassBox.y - rightMassBox.h / 2, t);
    point(sx, sy);
  }
}

// find tangent points from mass top center to pulley rim
function tangentPoint(isLeft) {
  let px = pulley.x;
  let py = pulley.y;
  let mx = isLeft ? leftMassBox.x : rightMassBox.x;
  let my =
    (isLeft ? leftMassBox.y : rightMassBox.y) -
    (isLeft ? leftMassBox.h / 2 : rightMassBox.h / 2);

  // vector from pulley to mass top
  let vx = mx - px;
  let vy = my - py;
  let dist = sqrt(vx * vx + vy * vy);
  let r = pulley.r;
  if (dist <= r + 1) {
    // fallback if mass is dangerously close: return top point
    return { x: px, y: py - r };
  }
  // angle from center to mass
  let baseAng = atan2(vy, vx);
  // angle between base vector and tangent
  let phi = acos(r / dist);
  let tangAng = isLeft ? baseAng + phi : baseAng - phi;
  return { x: px + r * cos(tangAng), y: py + r * sin(tangAng) };
}

// ---------- MassBox class ----------
class MassBox {
  constructor(x, y, w, h, mass) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.mass = mass;
    this.v = 0; // vertical velocity (px/s)
    this.dragging = false;
    this.offsetY = 0;
  }

  display() {
    // box body with slight 3D shading
    push();
    translate(this.x, this.y);
    // drop shadow
    noStroke();
    fill(0, 0, 0, 0.18);
    ellipse(0, this.h * 0.6, this.w * 1.4, 12);
    // box
    if (this.dragging) {
      stroke(30, 144, 255);
      strokeWeight(2.2);
    } else {
      stroke(80);
      strokeWeight(1);
    }
    fill(245, 245, 255);
    rect(0, 0, this.w, this.h, 6);
    // weight label
    noStroke();
    fill(45);
    textAlign(CENTER, CENTER);
    textSize(14);
    text(`${nf(this.mass, 1, 2)} kg`, 0, -2);
    // little hang point and hook
    stroke(90);
    strokeWeight(3);
    line(0, -this.h / 2, 0, -this.h / 2 - 18);
    fill(90);
    ellipse(0, -this.h / 2 - 22, 10, 10);

    pop();
  }
}

// ---------- Interaction ----------
function mousePressed() {
  if (leftMassBox.over(mouseX, mouseY)) {
    leftMassBox.dragging = true;
    leftMassBox.offsetY = mouseY - leftMassBox.y;
    return;
  }
  if (rightMassBox.over(mouseX, mouseY)) {
    rightMassBox.dragging = true;
    rightMassBox.offsetY = mouseY - rightMassBox.y;
    return;
  }
}

function mouseDragged() {
  if (leftMassBox.dragging) {
    leftMassBox.y = mouseY - leftMassBox.offsetY;
    leftMassBox.y = constrain(
      leftMassBox.y,
      pulley.y + pulley.r + 30,
      height - 80
    );
    // reflect slider to match mass value? No - keep mass separate; slider controls mass numeric
    leftMassBox.v = 0;
  }
  if (rightMassBox.dragging) {
    rightMassBox.y = mouseY - rightMassBox.offsetY;
    rightMassBox.y = constrain(
      rightMassBox.y,
      pulley.y + pulley.r + 30,
      height - 80
    );
    rightMassBox.v = 0;
  }
}

function mouseReleased() {
  leftMassBox.dragging = false;
  rightMassBox.dragging = false;
}

// helper for massbox detection
MassBox.prototype.over = function (mx, my) {
  return (
    mx > this.x - this.w / 2 &&
    mx < this.x + this.w / 2 &&
    my > this.y - this.h / 2 &&
    my < this.y + this.h / 2
  );
};

// Buttons
function togglePlay() {
  playing = !playing;
  playButton.html(playing ? "Pause" : "Play");
}

function resetSystem() {
  leftMassBox.y = pulley.y + pulley.r + 220;
  rightMassBox.y = pulley.y + pulley.r + 220;
  leftMassBox.v = 0;
  rightMassBox.v = 0;
  leftMassBox.mass = 3;
  rightMassBox.mass = 2;
  mLeftSlider.value(leftMassBox.mass);
  mRightSlider.value(rightMassBox.mass);
  pulley.angVel = 0;
  pulley.angle = 0;
  frictionSlider.value(0.08);
  playing = true;
  playButton.html("Pause");
}
