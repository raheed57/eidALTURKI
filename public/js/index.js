// index.js
// منطق صفحة الترحيب + تسجيل الدخول + تحويل حسب الدور (user/admin)
// ✅ تحديثات مهمة:
// - تذكرني: إذا كان المستخدم مسجل (كوكي موجود) ندخله مباشرة
// - شرح الفعاليتين يظهر مرة واحدة فقط بعد إنشاء الحساب

import { apiPost, apiGet } from "./api.js";
import { applyLang, getLang, setLang } from "./i18n.js";
import { applyTheme, getTheme, setTheme } from "./theme.js";

applyTheme();
applyLang();

// أزرار الأعلى
document.getElementById("langBtn").addEventListener("click", () => {
  const lang = getLang();
  setLang(lang === "ar" ? "en" : "ar");
});

document.getElementById("themeBtn").addEventListener("click", () => {
  const th = getTheme();
  setTheme(th === "light" ? "dark" : "light");
});

// لو المستخدم أصلاً مسجل دخول (تذكرني) نوديه مباشرة
(async () => {
  try {
    const me = await apiGet("/api/me");
    if (me?.user?.role === "admin") return (location.href = "/admin.html");

    // ✅ إذا سبق شاف شرح الفعاليتين، نوديه مباشرة للداشبورد
    if (me?.user?.hasSeenIntro) return (location.href = "/dashboard.html");

    // ✅ إذا ما شافه، نوديه لصفحة الشرح
    return (location.href = "/intro.html");
  } catch {
    // عادي، غير مسجل
  }
})();

const welcomeCard = document.getElementById("welcomeCard");
const loginCard = document.getElementById("loginCard");

document.getElementById("toLoginBtn").addEventListener("click", () => {
  welcomeCard.style.display = "none";
  loginCard.style.display = "block";
});

document.getElementById("backBtn").addEventListener("click", () => {
  loginCard.style.display = "none";
  welcomeCard.style.display = "block";
});

function showMsg(type, text) {
  const box = document.getElementById("msg");
  box.className = type === "error" ? "error" : "success";
  box.textContent = text;
}

// تسجيل دخول
document.getElementById("loginBtn").addEventListener("click", async () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const rememberMe = document.getElementById("rememberMe").checked;

  if (!username || !password) {
    showMsg("error", "رجاءً اكتبي اسم المستخدم وكلمة المرور.");
    return;
  }

  try {
    const out = await apiPost("/api/auth/login", { username, password, rememberMe });

    // تحويل حسب الدور
    if (out.role === "admin") return (location.href = "/admin.html");

    // ✅ شرح الفعاليتين يظهر فقط إذا ما انعرض سابقاً
    if (out.hasSeenIntro) return (location.href = "/dashboard.html");
    return (location.href = "/intro.html");
  } catch (e) {
    if (e?.error === "WRONG_PASSWORD") showMsg("error", "كلمة المرور غير صحيحة لهذا الاسم.");
    else showMsg("error", "حدث خطأ. تأكدي من البيانات وحاولي مرة أخرى.");
  }
});
