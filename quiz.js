const questions = [
  {
    id: 1,
    question:
      "Jika masa benda 50 kg, hitunglah gaya yang di perlukan untuk mengangkat benda tersebut (anggap percepatan gravitasi ditempat tersebut 10 m/s)? hitunglah keuntungan mekanisnya?",
    questionImage: "img/gambar 1.png",
    options: [
      { text: "Gaya = 250 N, KM = 0.5", image: null },
      { text: "Gaya = 500 N, KM = 1", image: null },
      { text: "Gaya = 100 N, KM = 5", image: null },
      { text: "Gaya = 50 N, KM = 10", image: null },
    ],
    correct: 1,
    explanation: `Pembahasan:
Diketahui: m = 50 kg, g = 10 m/s²
Berat benda: W = m × g = 50 kg × 10 m/s² = 500 N
Untuk katrol tetap, gaya yang diperlukan sama dengan berat benda: F = W = 500 N
Keuntungan mekanis: KM = W/F = 500 N/500 N = 1

Jadi, gaya yang diperlukan untuk mengangkat benda tersebut dengan katrol tetap adalah 500 N dan keuntungan mekanisnya adalah 1.`,
  },
  {
    id: 2,
    question:
      "Dua buah benda A dan B masing - masing bermassa 2kg dan 3kg dihubungkan dengan tali melalui sebuah katrol licin (massa tali diabaikan). Jika percepatan gravitasi di tempat itu 10m/s maka besar nya tegangan tali adalah?",
    questionImage: "img/gambar 2.png",
    options: [
      { text: "20N", image: null },
      { text: "48N", image: null },
      { text: "38N", image: null },
      { text: "24N", image: null },
    ],
    correct: 3,
    explanation: `Pembahasan:
Diketahui: m_A = 2 kg, m_B = 3 kg, g = 10 m/s²
Berat benda: w_A = m_A × g = 2 × 10 = 20 N
Berat benda: w_B = m_B × g = 3 × 10 = 30 N
Percepatan sistem: a = (w_B - w_A)/(m_A + m_B) = (30 - 20)/(2 + 3) = 10/5 = 2 m/s²
Tinjau benda A (2 kg) yang bergerak naik: T - w_A = m_A × a → T - 20 = 2 × 2 → T = 20 + 4 = 24 N
Atau tinjau benda B (3 kg) yang bergerak turun: w_B - T = m_B × a → 30 - T = 3 × 2 → T = 30 - 6 = 24 N

Jadi, besar tegangan tali pada sistem tersebut adalah 24 N.`,
  },
  {
    id: 3,
    question:
      "Suatu hari, Angga menggunakan katrol bergerak untuk mengangkat kayu. Diketahui jika gaya yang digunakan Angga adalah sebesar 250 N. Hitunglah berat beban yang dapat diangkat oleh Angga?",
    questionImage: "img/gambar 3.png",
    options: [
      { text: "200 N", image: null },
      { text: "300 N", image: null },
      { text: "450 N", image: null },
      { text: "500 N", image: null },
    ],
    correct: 3,
    explanation: `Pembahasan:
F = 250 N	
Keuntungan mekanik katrol bergerak = 2
KM = w/f
w = KM F
= 2 x 250 N
= 500 N
Jadi, beban yang dapat diangkat angga adalah sebesar 500 N`,
  },
  {
    id: 4,
    question:
      "Tentukan besarnya gaya yang dibutuhkan untuk menarik balok seberat 1.800 N!",
    questionImage: "img/gambar 4.png",
    options: [
      { text: "344 N", image: null },
      { text: "453 N", image: null },
      { text: "600 N", image: null },
      { text: "300 N", image: null },
    ],
    correct: 2,
    explanation: `Pembahasan:
Diketahui:
w = 1.800 N
Ditanya: F =…?
Pembahasan:
Katrol yang digunakan untuk mengangkat balok seperti pada soal adalah katrol majemuk. Katrol majemuknya terdiri dari 3 katrol dengan ketentuan, 2 katrol bergerak dan 1 katrol tetap. Dengan demikian, besarnya gaya untuk menarik balok dirumuskan sebagai berikut.
KM = w/F
F = w/KM
F = 1.800 N/3
F = 600 N
Jadi, besarnya gaya untuk menarik balok seberat 1.800 N adalah 600 N.`,
  },
  {
    id: 5,
    question:
      "Sebuah silinder baja diangkat menggunakan katrol seperti gambar berikut. Jika jarak antara poros katrol dan titik tumpu 15 cm, tentukan beban silinder baja tersebut dan panjang lengan kuasanya!",
    questionImage: "img/gambar 5.png",
    options: [
      { text: "66N dan 20 cm", image: null },
      { text: "76N dan 30 cm", image: null },
      { text: "45N dan 23 cm", image: null },
      { text: "80N dan 25 cm", image: null },
    ],
    correct: 1,
    explanation: `Pembahasan:
Diketahui:
F = 38 N
lb = 15 cm
Ditanya: w =…?
Pembahasan:
Katrol yang digunakan untuk mengangkat silinder baja seperti pada soal adalah katrol bergerak. Keuntungan mekanis katrol bergerak adalah 2, sehingga beban silinder bajanya dirumuskan sebagai berikut.
KM = 2
w/F = 2
w = 2 x F
w = 2 x 38 N
w = 76 N
Jarak antara poros katrol ke titik tumpu adalah 15 cm. Artinya, panjang lengan bebannya = 15 cm. Dengan demikian, lengan kuasanya dirumuskan sebagai berikut.
KM = lk/lb = 2
lk/15 = 2
lk = 2 x 15
lk = 30 cm
Jadi, beban silinder baja tersebut adalah 76 N dan panjang lengan kuasanya adalah 30 cm.`,
  },
];

let currentQuestions = [];
let currentScore = 0;
let currentQuestionIndex = 0;

function shuffleQuestions() {
  currentQuestions = [...questions].sort(() => Math.random() - 0.5).slice(0, 5);
}

function updateQuiz() {
  const question = currentQuestions[currentQuestionIndex];
  document.getElementById("question").innerText = question.question;

  // Update question image
  const questionImageContainer = document.getElementById("questionImage");
  questionImageContainer.innerHTML = "";
  if (question.questionImage) {
    const img = document.createElement("img");
    img.src = question.questionImage;
    img.alt = "Gambar Pertanyaan";
    img.className = "question-image";
    questionImageContainer.appendChild(img);
  }

  // Update options
  const optionsContainer = document.getElementById("optionsContainer");
  optionsContainer.innerHTML = "";

  question.options.forEach((option, index) => {
    const optionDiv = document.createElement("div");
    optionDiv.className = "quiz-option-container";

    const button = document.createElement("button");
    button.id = `option${index}`;
    button.className =
      "quiz-option bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white p-3 rounded font-medium w-full h-full flex flex-col items-center justify-center";
    button.onclick = () => checkAnswer(index);

    // Add text
    const text = document.createElement("span");
    text.innerText = option.text;
    button.appendChild(text);

    optionDiv.appendChild(button);
    optionsContainer.appendChild(optionDiv);
  });

  document.getElementById("explanationContainer").classList.add("hidden");
  document.getElementById("nextButton").classList.add("hidden");
}

function checkAnswer(answer) {
  const correctAnswer = currentQuestions[currentQuestionIndex].correct;
  const selectedOption = document.getElementById(`option${answer}`);

  // Reset semua option ke state normal terlebih dahulu
  const allOptions = document.querySelectorAll(".quiz-option");
  allOptions.forEach((opt) => {
    opt.classList.remove("correct", "wrong");
    opt.disabled = false;
  });

  if (answer === correctAnswer) {
    currentScore += 20;
    selectedOption.classList.add("correct");
  } else {
    selectedOption.classList.add("wrong");
    document.getElementById(`option${correctAnswer}`).classList.add("correct");
  }

  // Disable all options setelah menjawab
  allOptions.forEach((option) => {
    option.disabled = true;
  });

  // Show explanation and next button
  document.getElementById("explanation").innerText =
    currentQuestions[currentQuestionIndex].explanation;
  document.getElementById("explanationContainer").classList.remove("hidden");
  document.getElementById("nextButton").classList.remove("hidden");
}

function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < currentQuestions.length) {
    updateQuiz();
  } else {
    showResults();
  }
}

function showResults() {
  document.getElementById("quizContainer").classList.add("hidden");
  document.getElementById("scoreContainer").classList.remove("hidden");
  document.getElementById("finalScore").innerText = currentScore;
}

function restartQuiz() {
  currentScore = 0;
  currentQuestionIndex = 0;
  shuffleQuestions();
  document.getElementById("quizContainer").classList.remove("hidden");
  document.getElementById("scoreContainer").classList.add("hidden");
  updateQuiz();
}

// Event listeners setelah DOM loaded
document.addEventListener("DOMContentLoaded", function () {
  // Inisialisasi quiz
  shuffleQuestions();
  updateQuiz();

  // Tambahkan event listener untuk next button
  document.getElementById("nextButton").addEventListener("click", nextQuestion);

  // Tambahkan event listener untuk restart button
  document
    .getElementById("restartButton")
    .addEventListener("click", restartQuiz);
});
