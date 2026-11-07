(() => {
  const key = "robson-portfolio-theme";
  let current = "dark";
  try { current = localStorage.getItem(key) || "dark"; } catch {}
  const apply = () => {
    document.documentElement.dataset.theme = current;
    document.querySelectorAll("[data-theme-toggle]").forEach(button => {
      const light = current === "light";
      button.setAttribute("aria-label", light ? "Ativar tema Hacker Matrix" : "Ativar tema claro");
      button.title = light ? "Ativar tema Hacker Matrix" : "Ativar tema claro";
      const icon = button.querySelector("span");
      if (icon) icon.textContent = light ? "☾" : "☼";
    });
  };
  window.refreshPortfolioTheme = apply;
  document.addEventListener("click", event => {
    const button = event.target.closest("[data-theme-toggle]");
    if (!button) return;
    current = current === "light" ? "dark" : "light";
    try { localStorage.setItem(key, current); } catch {}
    apply();
  });
  window.addEventListener("storage", event => {
    if (event.key === key) { current = event.newValue || "dark"; apply(); }
  });
  apply();
})();