// intro.js
// صفحة شرح الفعاليتين: لازم فهمت الاثنين لتفعيل Next
// وزر "لم أفهم" يفتح مودال ويرسل سؤال للأدمن
// ✅ تحديثات:
// - إذا المستخدم رجع مرة ثانية (hasSeenIntro=true) ما نعرض له الصفحة أصلاً
// - عند الضغط على Next نسجل أنه شاهد الشرح (intro complete)

import { apiGet, apiPost } from "./api.js";
import { applyLang, getLang, setLang } from "./i18n.js";
import { applyTheme, getTheme, setTheme } from "./theme.js";

applyTheme();
applyLang();

// حماية: لازم يكون المستخدم مسجل
(async () => {
  try {
    const me = await apiGet("/api/me");
    if (me.user.role === "admin") return (location.href = "/admin.html");

    // ✅ لو سبق شاهد الشرح، مباشرة للداشبورد
    if (me.user.hasSeenIntro) return (location.href = "/dashboard.html");
  } catch {
    location.href = "/index.html";
  }
})();

// أزرار الأعلى
document.getElementById("langBtn").addEventListener("click", () => {
  setLang(getLang() === "ar" ? "en" : "ar");
});
document.getElementById("themeBtn").addEventListener("click", () => {
  setTheme(getTheme() === "light" ? "dark" : "light");
});
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await apiPost("/api/auth/logout", {});
  location.href = "/index.html";
});

// تفعيل زر next عند تحقق الشرط
const u1 = document.getElementById("u1");
const u2 = document.getElementById("u2");
const nextBtn = document.getElementById("nextBtn");

function updateNext() {
  nextBtn.disabled = !(u1.checked && u2.checked);
}
u1.addEventListener("change", updateNext);
u2.addEventListener("change", updateNext);

// ✅ عند الضغط على التالي: نسجل أنه شاف الشرح ثم نوديه للداشبورد
nextBtn.addEventListener("click", async () => {
  try {
    await apiPost("/api/intro/complete", {});
  } catch {
    // حتى لو فشل، ما نبغى نوقفه (بس نحاول)
  }
  location.href = "/dashboard.html";
});

/* مودال الأسئلة */
const qModal = document.getElementById("qModal");
const qText = document.getElementById("qText");
const qMsg = document.getElementById("qMsg");

function openQ() {
  qMsg.textContent = "";
  qMsg.className = "";
  qText.value = "";
  qModal.classList.add("show");
}
function closeQ() {
  qModal.classList.remove("show");
}

document.getElementById("not1").addEventListener("click", openQ);
document.getElementById("not2").addEventListener("click", openQ);

document.getElementById("closeQ").addEventListener("click", closeQ);
document.getElementById("cancelQ").addEventListener("click", closeQ);
qModal.addEventListener("click", (e) => {
  if (e.target === qModal) closeQ();
});

document.getElementById("submitQ").addEventListener("click", async () => {
  const question = qText.value.trim();
  if (!question) {
    qMsg.className = "error";
    qMsg.textContent = "اكتب سؤالك أولاً.";
    return;
  }

  try {
    await apiPost("/api/questions", { question });
    qMsg.className = "success";
    qMsg.textContent = "تم إرسال سؤالك للأدمن. تقدر تكمل للخطوة التالية.";

    // ✅ نسمح له يكمل حتى لو ما فعل "فهمت"
    nextBtn.disabled = false;

    setTimeout(() => {
      closeQ();
    }, 1200);

  } catch {
    qMsg.className = "error";
    qMsg.textContent = "تعذر الإرسال. حاول مرة أخرى.";
  }
});
