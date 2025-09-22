const toggleDark = document.getElementById("toggleDark");
toggleDark.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");
});

const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mobileMenu = document.getElementById("mobileMenu");
mobileMenuBtn.addEventListener("click", () => {
  mobileMenu.classList.toggle("hidden");
});
