// theme.js
// حفظ/تطبيق وضع نهاري/ليلي

export function getTheme() {
  return localStorage.getItem("theme") || "light";
}

export function setTheme(theme) {
  localStorage.setItem("theme", theme);
  applyTheme();
}

export function applyTheme() {
  const theme = getTheme();
  document.documentElement.setAttribute("data-theme", theme);
}
