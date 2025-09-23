// script.js - Pastikan ini dijalankan setelah DOM loaded
document.addEventListener("DOMContentLoaded", function () {
  const toggleDark = document.getElementById("toggleDark");
  if (toggleDark) {
    toggleDark.addEventListener("click", () => {
      document.documentElement.classList.toggle("dark");
      // Update icon dark/light mode
      if (document.documentElement.classList.contains("dark")) {
        toggleDark.textContent = "☀️";
      } else {
        toggleDark.textContent = "🌙";
      }
    });
  }

  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });
  }
});
