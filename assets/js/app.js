const maintenanceConfig = {
  vps: false,
  games: false,
  web: false,
  message: "Service temporarily unavailable"
};

const reveals = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  },
  { threshold: 0.15 }
);

reveals.forEach((el) => observer.observe(el));

const serviceCards = document.querySelectorAll("[data-service]");
serviceCards.forEach((card) => {
  const key = card.getAttribute("data-service");
  if (!key) return;
  if (maintenanceConfig[key]) {
    card.classList.add("maintenance");
    const chip = card.querySelector(".chip");
    if (chip) {
      chip.textContent = "Maintenance";
    }
    const button = card.querySelector(".btn");
    if (button) {
      button.textContent = maintenanceConfig.message;
    }
  }
});
