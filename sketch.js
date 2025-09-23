let pulleys = []; // array of pulleys (bisa lebih dari satu)
let leftMassBox, rightMassBox;
let g = 9.81;
let scalePxPerMeter = 120;
let timeStep = 1 / 60;
let playing = true;

// UI elements
let mLeftSlider, mRightSlider, frictionSlider;
let pulleyTypeSelect, addPulleyButton, removePulleyButton;
let playButton, resetButton;
let infoP;

function setup() {
  let c = createCanvas(900, 640);
  c.parent("canvasContainer");
  angleMode(RADIANS);
  rectMode(CENTER);
  textFont("Inter, Arial, sans-serif");

  // Inisialisasi katrol pertama (tetap)
  pulleys.push(new Pulley(width / 2, 160, 70, false, 0));

  // Mass boxes initial positions
  leftMassBox = new MassBox(
    pulleys[0].x - pulleys[0].r - 20,
    pulleys[0].y + 220,
    50,
    50,
    3
  );
  rightMassBox = new MassBox(
    pulleys[0].x + pulleys[0].r + 20,
    pulleys[0].y + 220,
    50,
    50,
    2
  );

  // UI Controls
  createSpan("Jenis Katrol").parent("simControl");
  pulleyTypeSelect = createSelect().parent("simControl");
  pulleyTypeSelect.option("Tetap");
  pulleyTypeSelect.option("Bergerak");
  pulleyTypeSelect.option("Majemuk");
  pulleyTypeSelect.changed(updatePulleySystem);

  addPulleyButton = createButton("Tambah Katrol").parent("simControl");
  addPulleyButton.mousePressed(addPulley);

  removePulleyButton = createButton("Hapus Katrol").parent("simControl");
  removePulleyButton.mousePressed(removePulley);

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

  drawingContext.shadowBlur = 0;
}

class Pulley {
  constructor(x, y, r, isMovable, id) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.isMovable = isMovable;
    this.id = id;
    this.angle = 0;
    this.angVel = 0;
    this.inertia = 1;
    this.vy = 0; // kecepatan vertikal untuk katrol bergerak
    this.connectedTo = null; // untuk katrol majemuk - menghubungkan ke katrol lain
  }

  display() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);

    // Gambar katrol dengan warna berbeda berdasarkan jenis
    if (this.isMovable) {
      fill(200, 220, 255); // biru muda untuk katrol bergerak
    } else {
      fill(200, 170, 120); // coklat untuk katrol tetap
    }

    stroke(110);
    strokeWeight(1.6);
    ellipse(0, 0, this.r * 2.05, this.r * 2.05);

    if (this.isMovable) {
      fill(170, 190, 220); // biru untuk katrol bergerak
    } else {
      fill(170, 140, 90); // coklat untuk katrol tetap
    }
    ellipse(0, 0, this.r * 1.95, this.r * 1.95);

    stroke(110, 90);
    strokeWeight(2);
    for (let i = 0; i < 8; i++) {
      push();
      rotate((TWO_PI / 8) * i);
      line(0, 0, this.r * 0.65, 0);
      pop();
    }

    // hub
    fill(110);
    noStroke();
    ellipse(0, 0, this.r * 0.6, this.r * 0.6);

    // highlight
    noFill();
    stroke(255, 120);
    strokeWeight(1);
    arc(0, 0, this.r * 2.02, this.r * 2.02, -PI / 3, PI / 6);

    pop();

    // Gambar penyangga hanya untuk katrol tetap
    if (!this.isMovable) {
      stroke(100);
      strokeWeight(6);
      line(this.x, this.y - this.r - 18, this.x, this.y - this.r - 80);
      strokeWeight(1);
    }

    // Gambar hook untuk katrol bergerak
    if (this.isMovable) {
      stroke(90);
      strokeWeight(3);
      line(this.x, this.y + this.r + 10, this.x, this.y + this.r + 30);
      fill(90);
      ellipse(this.x, this.y + this.r + 35, 10, 10);
    }
  }
}

function draw() {
  background(235, 240, 245);
  drawScene();

  // update masses from sliders
  if (!leftMassBox.dragging) leftMassBox.mass = mLeftSlider.value();
  if (!rightMassBox.dragging) rightMassBox.mass = mRightSlider.value();
  let friction = frictionSlider.value();

  if (playing) {
    for (let i = 0; i < 4; i++) {
      simulateStep(timeStep / 4, friction);
    }
  }

  // Gambar semua elemen
  drawRope();
  for (let pulley of pulleys) {
    pulley.display();
  }
  leftMassBox.display();
  rightMassBox.display();

  // Update info text
  let acceleration = computeAcceleration(friction);
  let velocity = (rightMassBox.v - leftMassBox.v) / 2;
  let mechanicalAdvantage = calculateMechanicalAdvantage();

  infoP.html(
    `Jenis: ${pulleyTypeSelect.value()} &nbsp;&nbsp; Jumlah Katrol: ${
      pulleys.length
    }<br>` +
      `m kiri: ${nf(leftMassBox.mass, 1, 2)} kg &nbsp;&nbsp; m kanan: ${nf(
        rightMassBox.mass,
        1,
        2
      )} kg<br>` +
      `Keuntungan Mekanis: ${nf(mechanicalAdvantage, 1, 2)}<br>` +
      `friction: ${nf(friction, 1, 2)} &nbsp;&nbsp; a: ${nf(
        acceleration,
        1,
        3
      )} m/s²`
  );
}

function simulateStep(dt, friction) {
  // Untuk sistem katrol tunggal
  if (pulleys.length === 1) {
    let pulley = pulleys[0];
    let m1 = leftMassBox.mass;
    let m2 = rightMassBox.mass;
    let R = pulley.r / scalePxPerMeter;

    if (pulley.isMovable) {
      // Fisika untuk katrol bergerak
      // Dalam katrol bergerak, tegangan tali adalah setengah dari berat total
      // dan percepatan sistem berbeda
      let totalMass = m1 + m2;
      let netForce = (m2 - m1) * g;
      let effectiveMass = totalMass;

      // Untuk katrol bergerak, massa katrol juga mempengaruhi (diabaikan di sini)
      let a_m = netForce / effectiveMass;

      // Percepatan katrol bergerak adalah setengah dari percepatan beban
      let pulleyAcceleration = a_m / 2;

      // Update posisi dan kecepatan katrol
      pulley.vy += pulleyAcceleration * scalePxPerMeter * dt;
      pulley.y += pulley.vy * dt;

      // Update kecepatan sudut
      pulley.angVel = pulley.vy / (pulley.r / scalePxPerMeter);
      pulley.angle += pulley.angVel * dt;

      // Update posisi beban (terkait dengan gerakan katrol)
      leftMassBox.v = -pulley.vy;
      rightMassBox.v = pulley.vy;
    } else {
      // Fisika untuk katrol tetap (seperti sebelumnya)
      let I = pulley.inertia;
      let denom = m1 + m2 + I / (R * R);
      let a_m = ((m2 - m1) * g) / denom;

      let alpha = a_m / R;
      pulley.angVel += alpha * dt;
      pulley.angVel *= 1 - friction * dt;
      pulley.angle += pulley.angVel * dt;

      let a_px = a_m * scalePxPerMeter;
      leftMassBox.v += -a_px * dt;
      rightMassBox.v += a_px * dt;
    }

    // Update posisi beban
    if (!leftMassBox.dragging) leftMassBox.y += leftMassBox.v * dt;
    if (!rightMassBox.dragging) rightMassBox.y += rightMassBox.v * dt;

    // Constraints
    let limitY = height - 80;
    leftMassBox.y = constrain(leftMassBox.y, pulley.y + pulley.r + 30, limitY);
    rightMassBox.y = constrain(
      rightMassBox.y,
      pulley.y + pulley.r + 30,
      limitY
    );

    // Jika katrol bergerak, batasi pergerakannya
    if (pulley.isMovable) {
      pulley.y = constrain(pulley.y, 100, height - 200);
    }

    // Reset velocities jika dragging
    if (leftMassBox.dragging) leftMassBox.v = 0;
    if (rightMassBox.dragging) rightMassBox.v = 0;

    // Berhenti jika mentok
    if (
      leftMassBox.y === pulley.y + pulley.r + 30 ||
      leftMassBox.y === limitY ||
      rightMassBox.y === pulley.y + pulley.r + 30 ||
      rightMassBox.y === limitY
    ) {
      pulley.angVel = 0;
      leftMassBox.v = 0;
      rightMassBox.v = 0;
      if (pulley.isMovable) pulley.vy = 0;
    }
  }
  // Untuk sistem katrol majemuk (disederhanakan)
  else if (pulleys.length > 1) {
    // Implementasi sederhana untuk katrol majemuk
    // Dalam sistem nyata, ini akan lebih kompleks
    let m1 = leftMassBox.mass;
    let m2 = rightMassBox.mass;

    // Untuk sistem katrol majemuk, keuntungan mekanis meningkatkan gaya
    let mechanicalAdvantage = calculateMechanicalAdvantage();
    let effectiveMass2 = m2 / mechanicalAdvantage;

    let netForce = (effectiveMass2 - m1) * g;
    let totalMass = m1 + effectiveMass2;
    let a_m = netForce / totalMass;

    // Update semua katrol dan beban
    for (let pulley of pulleys) {
      if (!pulley.isMovable) {
        // Katrol tetap berputar
        pulley.angVel = (a_m * scalePxPerMeter) / (pulley.r / scalePxPerMeter);
        pulley.angle += pulley.angVel * dt;
      } else {
        // Katrol bergerak bergerak vertikal
        pulley.vy = (a_m * scalePxPerMeter) / mechanicalAdvantage;
        pulley.y += pulley.vy * dt;
        pulley.y = constrain(pulley.y, 100, height - 200);
      }
    }

    // Update beban
    leftMassBox.v = -a_m * scalePxPerMeter;
    rightMassBox.v = (a_m * scalePxPerMeter) / mechanicalAdvantage;

    if (!leftMassBox.dragging) leftMassBox.y += leftMassBox.v * dt;
    if (!rightMassBox.dragging) rightMassBox.y += rightMassBox.v * dt;

    // Constraints
    let limitY = height - 80;
    leftMassBox.y = constrain(
      leftMassBox.y,
      pulleys[0].y + pulleys[0].r + 30,
      limitY
    );
    rightMassBox.y = constrain(
      rightMassBox.y,
      pulleys[0].y + pulleys[0].r + 30,
      limitY
    );
  }
}

function computeAcceleration(friction) {
  if (pulleys.length === 1) {
    let m1 = leftMassBox.mass;
    let m2 = rightMassBox.mass;
    let R = pulleys[0].r / scalePxPerMeter;
    let I = pulleys[0].inertia;

    if (pulleys[0].isMovable) {
      // Untuk katrol bergerak
      let totalMass = m1 + m2;
      let netForce = (m2 - m1) * g;
      return netForce / totalMass;
    } else {
      // Untuk katrol tetap
      let denom = m1 + m2 + I / (R * R);
      return ((m2 - m1) * g) / denom;
    }
  } else {
    // Untuk katrol majemuk
    let m1 = leftMassBox.mass;
    let m2 = rightMassBox.mass;
    let mechanicalAdvantage = calculateMechanicalAdvantage();
    let effectiveMass2 = m2 / mechanicalAdvantage;

    let netForce = (effectiveMass2 - m1) * g;
    let totalMass = m1 + effectiveMass2;
    return netForce / totalMass;
  } 
}

function calculateMechanicalAdvantage() {
  if (pulleys.length === 1) {
    return pulleys[0].isMovable ? 2 : 1;
  } else {
    // Untuk sistem katrol majemuk, keuntungan mekanis = jumlah tali yang menahan beban
    return pulleys.length; // Penyederhanaan - dalam sistem nyata lebih kompleks
  }
}

function drawScene() {
  // floor/ground
  noStroke();
  fill(245);
  rect(width / 2, height, width, 160);

  // support frame untuk katrol tetap
  for (let pulley of pulleys) {
    if (!pulley.isMovable) {
      push();
      translate(pulley.x, pulley.y - 20);
      fill(90);
      rect(0, -18, 260, 18, 6);
      fill(120);
      rect(-120, 0, 18, 70, 6);
      rect(120, 0, 18, 70, 6);
      pop();
    }
  }

  // shadow
  drawingContext.shadowOffsetX = 0;
  drawingContext.shadowOffsetY = 8;
  drawingContext.shadowBlur = 30;
  drawingContext.shadowColor = "rgba(0,0,0,0.25)";
  fill(0, 0, 0, 0.15);
  for (let pulley of pulleys) {
    ellipse(pulley.x, pulley.y + pulley.r + 28, pulley.r * 1.85, 26);
  }
  drawingContext.shadowBlur = 0;
}

function drawRope() {
  strokeWeight(6);
  strokeCap(ROUND);
  stroke(90, 60, 30);

  if (pulleys.length === 1) {
    // Untuk sistem katrol tunggal
    let pulley = pulleys[0];
    let leftT = tangentPoint(true, pulley);
    let rightT = tangentPoint(false, pulley);

    // left segment
    line(leftMassBox.x, leftMassBox.y - leftMassBox.h / 2, leftT.x, leftT.y);

    // arc along pulley
    let angle1 = atan2(leftT.y - pulley.y, leftT.x - pulley.x);
    let angle2 = atan2(rightT.y - pulley.y, rightT.x - pulley.x);
    noFill();
    arc(pulley.x, pulley.y, pulley.r * 2, pulley.r * 2, angle1, angle2);

    // right segment
    line(
      rightT.x,
      rightT.y,
      rightMassBox.x,
      rightMassBox.y - rightMassBox.h / 2
    );
  } else {
    // Untuk sistem katrol majemuk - gambar tali yang melewati semua katrol
    // Implementasi sederhana - dalam sistem nyata lebih kompleks
    let lastX = leftMassBox.x;
    let lastY = leftMassBox.y - leftMassBox.h / 2;

    for (let i = 0; i < pulleys.length; i++) {
      let pulley = pulleys[i];
      let tangent = tangentPointToPulley(lastX, lastY, pulley, i === 0);

      line(lastX, lastY, tangent.x, tangent.y);

      // Gambar busur di sekitar katrol
      let nextPulley = i < pulleys.length - 1 ? pulleys[i + 1] : null;
      let exitTangent = nextPulley
        ? tangentPointToPulley(nextPulley.x, nextPulley.y, pulley, false)
        : tangentPoint(false, pulley);

      let angle1 = atan2(tangent.y - pulley.y, tangent.x - pulley.x);
      let angle2 = atan2(exitTangent.y - pulley.y, exitTangent.x - pulley.x);
      arc(pulley.x, pulley.y, pulley.r * 2, pulley.r * 2, angle1, angle2);

      lastX = exitTangent.x;
      lastY = exitTangent.y;
    }

    // Tali terakhir ke beban kanan
    line(lastX, lastY, rightMassBox.x, rightMassBox.y - rightMassBox.h / 2);
  }

  // rope texture
  strokeWeight(1.4);
  let dashCount = 12;
  for (let i = 0; i <= dashCount; i++) {
    let t = i / dashCount;
    // Implementasi dashes akan lebih kompleks untuk sistem majemuk
    // Di sini kita sederhanakan
    if (pulleys.length === 1) {
      let pulley = pulleys[0];
      let leftT = tangentPoint(true, pulley);
      let sx = lerp(leftMassBox.x, leftT.x, t);
      let sy = lerp(leftMassBox.y - leftMassBox.h / 2, leftT.y, t);
      point(sx, sy);

      let rightT = tangentPoint(false, pulley);
      sx = lerp(rightT.x, rightMassBox.x, t);
      sy = lerp(rightT.y, rightMassBox.y - rightMassBox.h / 2, t);
      point(sx, sy);
    }
  }
}

function tangentPoint(isLeft, pulley) {
  let px = pulley.x;
  let py = pulley.y;
  let mx = isLeft ? leftMassBox.x : rightMassBox.x;
  let my =
    (isLeft ? leftMassBox.y : rightMassBox.y) -
    (isLeft ? leftMassBox.h / 2 : rightMassBox.h / 2);

  let vx = mx - px;
  let vy = my - py;
  let dist = sqrt(vx * vx + vy * vy);
  let r = pulley.r;
  if (dist <= r + 1) {
    return { x: px, y: py - r };
  }

  let baseAng = atan2(vy, vx);
  let phi = acos(r / dist);
  let tangAng = isLeft ? baseAng + phi : baseAng - phi;
  return { x: px + r * cos(tangAng), y: py + r * sin(tangAng) };
}

function tangentPointToPulley(fromX, fromY, toPulley, isLeft) {
  let px = toPulley.x;
  let py = toPulley.y;
  let mx = fromX;
  let my = fromY;

  let vx = mx - px;
  let vy = my - py;
  let dist = sqrt(vx * vx + vy * vy);
  let r = toPulley.r;
  if (dist <= r + 1) {
    return { x: px, y: py - r };
  }

  let baseAng = atan2(vy, vx);
  let phi = acos(r / dist);
  let tangAng = isLeft ? baseAng + phi : baseAng - phi;
  return { x: px + r * cos(tangAng), y: py + r * sin(tangAng) };
}

// Kelas MassBox (tetap sama)
class MassBox {
  constructor(x, y, w, h, mass) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.mass = mass;
    this.v = 0;
    this.dragging = false;
    this.offsetY = 0;
  }

  display() {
    push();
    translate(this.x, this.y);
    noStroke();
    fill(0, 0, 0, 0.18);
    ellipse(0, this.h * 0.6, this.w * 1.4, 12);

    if (this.dragging) {
      stroke(30, 144, 255);
      strokeWeight(2.2);
    } else {
      stroke(80);
      strokeWeight(1);
    }
    fill(245, 245, 255);
    rect(0, 0, this.w, this.h, 6);

    noStroke();
    fill(45);
    textAlign(CENTER, CENTER);
    textSize(14);
    text(`${nf(this.mass, 1, 2)} kg`, 0, -2);

    stroke(90);
    strokeWeight(3);
    line(0, -this.h / 2, 0, -this.h / 2 - 18);
    fill(90);
    ellipse(0, -this.h / 2 - 22, 10, 10);

    pop();
  }
}

// Fungsi interaksi (tetap sama)
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
      pulleys[0].y + pulleys[0].r + 30,
      height - 80
    );
    leftMassBox.v = 0;
  }
  if (rightMassBox.dragging) {
    rightMassBox.y = mouseY - rightMassBox.offsetY;
    rightMassBox.y = constrain(
      rightMassBox.y,
      pulleys[0].y + pulleys[0].r + 30,
      height - 80
    );
    rightMassBox.v = 0;
  }
}

function mouseReleased() {
  leftMassBox.dragging = false;
  rightMassBox.dragging = false;
}

MassBox.prototype.over = function (mx, my) {
  return (
    mx > this.x - this.w / 2 &&
    mx < this.x + this.w / 2 &&
    my > this.y - this.h / 2 &&
    my < this.y + this.h / 2
  );
};

// Fungsi kontrol baru untuk katrol
function updatePulleySystem() {
  let type = pulleyTypeSelect.value();

  if (type === "Tetap") {
    // Sistem katrol tetap - satu katrol tetap
    pulleys = [new Pulley(width / 2, 160, 70, false, 0)];
  } else if (type === "Bergerak") {
    // Sistem katrol bergerak - satu katrol bergerak
    pulleys = [new Pulley(width / 2, 300, 70, true, 0)];
  } else if (type === "Majemuk") {
    // Sistem katrol majemuk - satu tetap, satu bergerak
    pulleys = [
      new Pulley(width / 2, 160, 70, false, 0),
      new Pulley(width / 2, 300, 50, true, 1),
    ];
  }

  // Reset posisi beban
  leftMassBox.y = pulleys[0].y + pulleys[0].r + 220;
  rightMassBox.y = pulleys[0].y + pulleys[0].r + 220;
  leftMassBox.v = 0;
  rightMassBox.v = 0;
}

function addPulley() {
  if (pulleys.length < 3) {
    // Batasi maksimal 3 katrol
    let newId = pulleys.length;
    let isMovable = pulleyTypeSelect.value() === "Majemuk" && newId > 0;
    let yPos = 160 + newId * 140;
    pulleys.push(new Pulley(width / 2, yPos, 60, isMovable, newId));
  }
}

function removePulley() {
  if (pulleys.length > 1) {
    pulleys.pop();
  }
}

function togglePlay() {
  playing = !playing;
  playButton.html(playing ? "Pause" : "Play");
}

function resetSystem() {
  updatePulleySystem(); // Reset ke konfigurasi berdasarkan jenis yang dipilih
  leftMassBox.mass = 3;
  rightMassBox.mass = 2;
  mLeftSlider.value(leftMassBox.mass);
  mRightSlider.value(rightMassBox.mass);
  frictionSlider.value(0.08);
  playing = true;
  playButton.html("Pause");
}
