// class Pulley {
//   constructor() {
//     this.x = 300;
//     this.y = 200;
//     this.radius = 40;
//     this.angle = 0;
//     this.loadHeight = 400;
//     this.type = "fixed"; // fixed, movable, compound
//     this.speed = 0;
//     this.isMoving = false;
//   }

//   display() {
//     // Draw rope
//     stroke(150);
//     strokeWeight(4);
//     this.drawRope();

//     // Draw pulley wheel
//     fill(100);
//     stroke(50);
//     strokeWeight(2);
//     circle(this.x, this.y, this.radius * 2);

//     // Draw load
//     fill(200, 100, 100);
//     rect(this.x - 30, this.loadHeight, 60, 40);
//   }

//   drawRope() {
//     switch (this.type) {
//       case "fixed":
//         line(this.x, 0, this.x, this.loadHeight);
//         break;
//       case "movable":
//         line(this.x - this.radius, 0, this.x - this.radius, this.loadHeight);
//         line(this.x + this.radius, 0, this.x + this.radius, this.loadHeight);
//         break;
//       case "compound":
//         line(this.x - this.radius, 0, this.x - this.radius, this.loadHeight);
//         line(this.x, 0, this.x, this.loadHeight);
//         line(this.x + this.radius, 0, this.x + this.radius, this.loadHeight);
//         break;
//     }
//   }

//   update() {
//     if (this.isMoving) {
//       this.angle += this.speed;
//       this.loadHeight += this.speed;

//       // Limit movement
//       this.loadHeight = constrain(this.loadHeight, 200, 400);
//       if (this.loadHeight <= 200 || this.loadHeight >= 400) {
//         this.isMoving = false;
//       }
//     }
//   }

//   changeType() {
//     switch (this.type) {
//       case "fixed":
//         this.type = "movable";
//         break;
//       case "movable":
//         this.type = "compound";
//         break;
//       case "compound":
//         this.type = "fixed";
//         break;
//     }
//   }
// }

// let pulley;

// function setup() {
//   const canvas = createCanvas(600, 500);
//   canvas.parent("canvasContainer");
//   pulley = new Pulley();
// }

// function draw() {
//   background(220);
//   pulley.update();
//   pulley.display();
// }

// function mousePressed() {
//   if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
//     pulley.changeType();
//   }
// }

// function keyPressed() {
//   if (keyCode === 32) {
//     // Space bar
//     pulley.isMoving = !pulley.isMoving;
//     pulley.speed = pulley.speed === 0 ? -2 : 0;
//   } else if (keyCode === UP_ARROW) {
//     pulley.speed *= 1.2;
//   } else if (keyCode === DOWN_ARROW) {
//     pulley.speed *= 0.8;
//   }
// }

// Sistem Katrol Lengkap - Tetap, Bergerak, dan Majemuk
let currentMode = "tetap"; // 'tetap', 'bergerak', 'majemuk'

// Variabel umum
let g = 9.81;
let scalePxPerMeter = 120;
let timeStep = 1 / 60;
let playing = true;

// UI elements umum
let playButton, resetButton, infoP;

// ========== KATROL TETAP ==========
let pulleyFixed;
let leftMassBoxFixed, rightMassBoxFixed;
let mLeftSliderFixed, mRightSliderFixed, frictionSliderFixed;

// ========== KATROL BERGERAK ==========
let pulleyMovable;
let massBoxMovable, counterWeightMovable;
let massSliderMovable, frictionSliderMovable;

// ========== KATROL MAJEMUK ==========
let pulleysCompound = [];
let massBoxCompound, counterWeightCompound;
let massSliderCompound, frictionSliderCompound, pulleyCountSlider;

function setup() {
  let c = createCanvas(900, 640);
  c.parent("canvasContainer");
  angleMode(RADIANS);
  rectMode(CENTER);
  textFont("Inter, Arial, sans-serif");

  setupKatrolTetap();
  setupKatrolBergerak();
  setupKatrolMajemuk();

  setupUI();
  setupEventListeners();
}

function draw() {
  background(235, 240, 245);

  switch (currentMode) {
    case "tetap":
      drawKatrolTetap();
      break;
    case "bergerak":
      drawKatrolBergerak();
      break;
    case "majemuk":
      drawKatrolMajemuk();
      break;
  }
}

// ========== SETUP FUNCTIONS ==========

function setupKatrolTetap() {
  pulleyFixed = {
    x: width / 2,
    y: 160,
    r: 70,
    angle: 0,
    angVel: 0,
    inertia: 1,
  };

  leftMassBoxFixed = new MassBox(
    pulleyFixed.x - pulleyFixed.r - 20,
    pulleyFixed.y + 220,
    50,
    50,
    3
  );
  rightMassBoxFixed = new MassBox(
    pulleyFixed.x + pulleyFixed.r + 20,
    pulleyFixed.y + 220,
    50,
    50,
    2
  );
}

function setupKatrolBergerak() {
  pulleyMovable = {
    x: width / 2,
    y: 300,
    r: 50,
    angle: 0,
    angVel: 0,
    inertia: 0.5,
  };

  massBoxMovable = new MassBox(width / 2, 450, 50, 50, 3);
  counterWeightMovable = { x: width / 2, y: 150, mass: 1 };
}

function setupKatrolMajemuk() {
  // Setup untuk katrol majemuk dengan 2 katrol
  pulleysCompound = [
    { x: width / 2, y: 120, r: 40, angle: 0, angVel: 0, fixed: true },
    { x: width / 2, y: 250, r: 40, angle: 0, angVel: 0, fixed: false },
  ];

  massBoxCompound = new MassBox(width / 2, 400, 50, 50, 4);
  counterWeightCompound = { x: width / 2, y: 80, mass: 1 };
}

function setupUI() {
  // UI akan dibuat/dihancurkan berdasarkan mode
}

function setupEventListeners() {
  // Event listeners untuk tombol mode
  document
    .getElementById("katrolTetapBtn")
    .addEventListener("click", () => switchMode("tetap"));
  document
    .getElementById("katrolBergerakBtn")
    .addEventListener("click", () => switchMode("bergerak"));
  document
    .getElementById("katrolMajemukBtn")
    .addEventListener("click", () => switchMode("majemuk"));
}

// ========== MODE SWITCHING ==========

function switchMode(mode) {
  currentMode = mode;

  // Update tombol aktif
  document
    .querySelectorAll(".katrol-btn")
    .forEach((btn) => btn.classList.remove("active"));
  document
    .getElementById(`katrol${capitalizeFirst(mode)}Btn`)
    .classList.add("active");

  // Hapus UI lama
  selectAll("#simControl > *").forEach((el) => el.remove());

  // Buat UI baru berdasarkan mode
  createUIForMode(mode);

  // Reset sistem
  resetSystem();
}

function capitalizeFirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function createUIForMode(mode) {
  switch (mode) {
    case "tetap":
      createSpan("Berat Kiri (kg)").parent("simControl");
      mLeftSliderFixed = createSlider(0.5, 15, 3, 0.1)
        .parent("simControl")
        .style("width", "120px");
      createSpan("Berat Kanan (kg)").parent("simControl");
      mRightSliderFixed = createSlider(0.5, 15, 2, 0.1)
        .parent("simControl")
        .style("width", "120px");
      createSpan("Gesekan").parent("simControl");
      frictionSliderFixed = createSlider(0, 1.2, 0.08, 0.01)
        .parent("simControl")
        .style("width", "120px");
      break;

    case "bergerak":
      createSpan("Massa Beban (kg)").parent("simControl");
      massSliderMovable = createSlider(0.5, 15, 3, 0.1)
        .parent("simControl")
        .style("width", "120px");
      createSpan("Gesekan").parent("simControl");
      frictionSliderMovable = createSlider(0, 1.2, 0.08, 0.01)
        .parent("simControl")
        .style("width", "120px");
      break;

    case "majemuk":
      createSpan("Massa Beban (kg)").parent("simControl");
      massSliderCompound = createSlider(0.5, 15, 4, 0.1)
        .parent("simControl")
        .style("width", "120px");
      createSpan("Jumlah Katrol").parent("simControl");
      pulleyCountSlider = createSlider(1, 4, 2, 1)
        .parent("simControl")
        .style("width", "120px");
      createSpan("Gesekan").parent("simControl");
      frictionSliderCompound = createSlider(0, 1.2, 0.08, 0.01)
        .parent("simControl")
        .style("width", "120px");
      break;
  }

  // Tombol kontrol umum
  playButton = createButton("Pause").parent("simControl");
  playButton.mousePressed(togglePlay);
  resetButton = createButton("Reset").parent("simControl");
  resetButton.mousePressed(resetSystem);

  infoP = createP("")
    .parent("simControl")
    .style("font-family", "monospace")
    .style("line-height", "1.2em")
    .style("margin", "0 0 0 16px");
}

// ========== DRAW FUNCTIONS ==========

function drawKatrolTetap() {
  drawSceneFixed();

  if (!leftMassBoxFixed.dragging)
    leftMassBoxFixed.mass = mLeftSliderFixed.value();
  if (!rightMassBoxFixed.dragging)
    rightMassBoxFixed.mass = mRightSliderFixed.value();

  if (playing) {
    for (let i = 0; i < 4; i++) {
      simulateStepFixed(timeStep / 4, frictionSliderFixed.value());
    }
  }

  drawPulleyFixed(pulleyFixed);
  drawRopeFixed();
  leftMassBoxFixed.display();
  rightMassBoxFixed.display();

  updateInfoFixed();
}

function drawKatrolBergerak() {
  drawSceneMovable();

  if (!massBoxMovable.dragging) massBoxMovable.mass = massSliderMovable.value();

  if (playing) {
    for (let i = 0; i < 4; i++) {
      simulateStepMovable(timeStep / 4, frictionSliderMovable.value());
    }
  }

  drawPulleyMovable();
  drawRopeMovable();
  massBoxMovable.display();

  updateInfoMovable();
}

function drawKatrolMajemuk() {
  drawSceneCompound();

  if (!massBoxCompound.dragging)
    massBoxCompound.mass = massSliderCompound.value();

  if (playing) {
    for (let i = 0; i < 4; i++) {
      simulateStepCompound(timeStep / 4, frictionSliderCompound.value());
    }
  }

  drawPulleysCompound();
  drawRopeCompound();
  massBoxCompound.display();

  updateInfoCompound();
}

// ========== FISIKA SIMULASI ==========
// (Implementasi fisika untuk masing-masing jenis katrol)

function simulateStepFixed(dt, friction) {
  // Implementasi fisika katrol tetap (sama seperti kode asli)
  // ... kode fisika katrol tetap ...
}

function simulateStepMovable(dt, friction) {
  // Implementasi fisika katrol bergerak
  // ... kode fisika katrol bergerak ...
}

function simulateStepCompound(dt, friction) {
  // Implementasi fisika katrol majemuk
  // ... kode fisika katrol majemuk ...
}

// ========== FUNGSI BANTUAN LAINNYA ==========

function togglePlay() {
  playing = !playing;
  playButton.html(playing ? "Pause" : "Play");
}

function resetSystem() {
  switch (currentMode) {
    case "tetap":
      resetKatrolTetap();
      break;
    case "bergerak":
      resetKatrolBergerak();
      break;
    case "majemuk":
      resetKatrolMajemuk();
      break;
  }
  playing = true;
  playButton.html("Pause");
}

// ... implementasi fungsi reset untuk masing-masing katrol ...

// MassBox class (sama seperti sebelumnya)
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
    // ... kode display ...
  }

  over(mx, my) {
    return (
      mx > this.x - this.w / 2 &&
      mx < this.x + this.w / 2 &&
      my > this.y - this.h / 2 &&
      my < this.y + this.h / 2
    );
  }
}

// ... fungsi interaksi mouse ...
function mousePressed() {
  // ... implementasi berdasarkan mode ...
}

function mouseDragged() {
  // ... implementasi berdasarkan mode ...
}

function mouseReleased() {
  // ... implementasi berdasarkan mode ...
}
