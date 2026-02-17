// dashboard.js
// 1) يعرض أسئلة المستخدم وردود الأدمن
// 2) يرسم دائرة الأسماء ويطبق شرط عدم التكرار (بدون حذف الأسماء من العرض)
// 3) مراجعة الشرح داخل مودال
// ✅ تحديثات جديدة:
// - منع عرض صفحة الداشبورد إذا المستخدم ما أنهى intro
// - قبل تشغيل العجلة لازم المستخدم يحدد اسمه الحقيقي (self_name)
// - أثناء الدوران يظهر مؤشر حالة + توقف واضح على الاسم + ثم مودال تهنئة + كونفيتي

import { apiGet, apiPost } from "./api.js";
import { applyLang, getLang, setLang, t } from "./i18n.js";
import { applyTheme, getTheme, setTheme } from "./theme.js";
import { launchConfetti } from "./confetti.js";

applyTheme();
applyLang();

// حماية الدخول
let currentUser = null;

(async () => {
  try {
    const me = await apiGet("/api/me");
    if (me.user.role === "admin") return location.href = "/admin.html";

    // ✅ لو ما شاف intro، نرجعه لها
    if (!me.user.hasSeenIntro) return location.href = "/intro.html";

    currentUser = me.user;
    document.getElementById("helloUser").textContent = (getLang() === "ar")
      ? `ياهلا وسهلا(${currentUser.username}) تو ما نوور الموقع حياك الله على قل الكلافه`
      : `${t("hello")} ${currentUser.username} 👋`;

await loadMyQuestions();
    await initWheel();
  } catch {
    location.href = "/index.html";
  }
})();

// أزرار الأعلى
document.getElementById("langBtn").addEventListener("click", () => {
  setLang(getLang() === "ar" ? "en" : "ar");
  // نعيد رسم الدائرة لأن اتجاه/نصوص قد تختلف
  drawWheel(currentRotation);
});
document.getElementById("themeBtn").addEventListener("click", () => {
  setTheme(getTheme() === "light" ? "dark" : "light");
  drawWheel(currentRotation);
});
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await apiPost("/api/auth/logout", {});
  location.href = "/index.html";
});

/* =========================
 *  (1) الأسئلة والردود
 * ========================= */

async function loadMyQuestions() {
  const box = document.getElementById("qaList");
  box.textContent = "...";

  try {
    const data = await apiGet("/api/questions/mine");
    const items = data.items || [];

    if (items.length === 0) {
      box.className = "notice";
      box.textContent = t("noQuestionsYet");
      return;
    }

    const html = items.map(q => {
      const ans = q.answer_text ? q.answer_text : t("noAnswerYet");
      return `
        <div style="padding:10px;border:1px solid var(--border);border-radius:14px;background:var(--cardSolid);margin-top:10px;">
          <div style="font-weight:800;margin-bottom:6px;">${t("yourQuestion")}: ${escapeHtml(q.question_text)}</div>
          <div style="color:var(--muted);">${t("ourAnswer")}: ${escapeHtml(ans)}</div>
        </div>
      `;
    }).join("");

    box.className = "";
    box.innerHTML = html;
  } catch {
    box.className = "error";
    box.textContent = t("cantLoadQuestions");
  }
}

document.getElementById("sendQ").addEventListener("click", async () => {
  const question = (document.getElementById("qaText").value || "").trim();
  const msg = document.getElementById("qaMsg");
  msg.className = "";
  msg.textContent = "";

  if (!question) {
    msg.className = "error";
    msg.textContent = t("writeQuestionFirst");
    return;
  }

  try {
    await apiPost("/api/questions", { question });
    document.getElementById("newQ").value = "";
    msg.className = "success";
    msg.textContent = t("questionSent");
    await loadMyQuestions();
  } catch {
    msg.className = "error";
    msg.textContent = t("cantSend");
  }
});

/* =========================
 *  (2) الدائرة (Wheel)
 * ========================= */

const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");

let wheelNames = [];
let myPickedName = null;
let mySelfName = null;

// زاوية الدوران الحالية (نحتفظ فيها لتحديث الرسم عند تغيير اللغة/الثيم)
let currentRotation = 0;

// حالة دوران
let spinning = false;

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", () => {
  resizeCanvas();
  drawWheel(currentRotation);
});

async function initWheel() {
  // نعرف هل عنده اسم مسبق + selfName
  const mine = await apiGet("/api/wheel/mine");
  myPickedName = mine.myName;
  mySelfName = mine.selfName;

  const namesRes = await apiGet("/api/wheel/names");
  wheelNames = namesRes.names || [];

  // تجهيز الكانفاس
  resizeCanvas();
  drawWheel(0);

  // إذا سبق اختار اسم
  if (myPickedName) {
    document.getElementById("pickedLabel").textContent = `${t("yourPick")} ${myPickedName}`;
    document.getElementById("wheelTitle").textContent = myPickedName;
    document.getElementById("spinBtn").disabled = true;
  } else {
    // ملاحظة: حتى لو كل الأسماء تم اختيارها من الآخرين، الزر يفضل يظل موجود لكن عند الضغط يصير NO_NAMES_LEFT
    document.getElementById("spinBtn").disabled = false;
  }

  // تجهيز خيارات self name داخل المودال
  buildSelfNameOptions();
}

function drawWheel(rotation = 0) {
  currentRotation = rotation;

  const w = canvas.getBoundingClientRect().width;
  const h = canvas.getBoundingClientRect().height;
  const r = Math.min(w, h) / 2;

  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(rotation);

  const n = Math.max(1, wheelNames.length);
  const angleStep = (Math.PI * 2) / n;

  // حجم الخط يتدرج حسب حجم الدائرة
  const fontSize = Math.max(11, Math.min(16, Math.floor(r / 12)));

  for (let i = 0; i < n; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, i * angleStep, (i + 1) * angleStep);
    ctx.closePath();

    ctx.fillStyle = `hsla(${(i * 360) / n}, 80%, 60%, 0.35)`;
    ctx.fill();

    ctx.strokeStyle = "rgba(0,0,0,0.10)";
    ctx.stroke();

    const label = wheelNames[i] || "—";
    ctx.save();
    ctx.rotate(i * angleStep + angleStep / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--text");
    ctx.font = `800 ${fontSize}px ui-sans-serif`;
    ctx.fillText(label, r - 16, 6);
    ctx.restore();
  }

  ctx.restore();
}

function setSpinStatus(text, type) {
  const el = document.getElementById("spinStatus");
  if (!text) {
    el.style.display = "none";
    el.className = "notice";
    el.textContent = "";
    return;
  }
  el.style.display = "block";
  el.className = type === "error" ? "error" : (type === "success" ? "success" : "notice");
  el.textContent = text;
}

/* ==== مودال: تحديد اسمك ==== */
const selfNameModal = document.getElementById("selfNameModal");
const selfNameSelect = document.getElementById("selfNameSelect");
const selfNameMsg = document.getElementById("selfNameMsg");

let pendingSpinAfterSelfName = false;

function buildSelfNameOptions() {
  // إذا ما فيه أسماء لسبب ما، نخلي السلكت فاضي
  selfNameSelect.innerHTML = "";

  const opt0 = document.createElement("option");
  opt0.value = "";
  opt0.textContent = t("selectPlaceholder");
  selfNameSelect.appendChild(opt0);

  wheelNames.forEach((n) => {
    const opt = document.createElement("option");
    opt.value = n;
    opt.textContent = n;
    selfNameSelect.appendChild(opt);
  });

  if (mySelfName) selfNameSelect.value = mySelfName;
}

function openSelfNameModal() {
  selfNameMsg.className = "";
  selfNameMsg.textContent = "";
  selfNameModal.classList.add("show");
}

function closeSelfNameModal() {
  selfNameModal.classList.remove("show");
}

document.getElementById("closeSelfName").addEventListener("click", () => {
  closeSelfNameModal();
});
document.getElementById("cancelSelfName").addEventListener("click", () => {
  closeSelfNameModal();
});
selfNameModal.addEventListener("click", (e) => {
  if (e.target === selfNameModal) closeSelfNameModal();
});

document.getElementById("saveSelfName").addEventListener("click", async () => {
  const pick = (selfNameSelect.value || "").trim();
  if (!pick) {
    selfNameMsg.className = "error";
    selfNameMsg.textContent = t("mustChooseSelfName");
    return;
  }

  try {
    await apiPost("/api/users/self-name", { selfName: pick });
    mySelfName = pick;
    selfNameMsg.className = "success";
    selfNameMsg.textContent = t("saved");

    setTimeout(() => {
      closeSelfNameModal();
      if (pendingSpinAfterSelfName) {
        pendingSpinAfterSelfName = false;
        document.getElementById("spinBtn").click();
      }
    }, 500);
  } catch (e) {
    selfNameMsg.className = "error";
    if (e?.error === "INVALID_SELF_NAME") selfNameMsg.textContent = t("invalidSelfName");
    else selfNameMsg.textContent = t("cantSave");
  }
});

/* ==== دوران العجلة ==== */

function normalizeAngle(a) {
  const two = Math.PI * 2;
  let x = a % two;
  if (x < 0) x += two;
  return x;
}

function computeTargetRotationForName(name) {
  const idx = wheelNames.indexOf(name);
  if (idx < 0) return null;

  const n = wheelNames.length || 1;
  const step = (Math.PI * 2) / n;
  const center = idx * step + step / 2;

  // المؤشر في أعلى الدائرة (تقريباً -90°)
  const pointerAngle = -Math.PI / 2;

  // نحتاج rotation بحيث (rotation + center) = pointerAngle
  const base = pointerAngle - center;
  return base;
}

function animateTo(finalRotation, ms = 3200) {
  return new Promise((resolve) => {
    const start = performance.now();
    const from = currentRotation;
    const to = finalRotation;

    const tick = (now) => {
      const t01 = Math.min(1, (now - start) / ms);
      // easeOutCubic
      const ease = 1 - Math.pow(1 - t01, 3);
      const rot = from + (to - from) * ease;
      drawWheel(rot);

      if (t01 < 1) requestAnimationFrame(tick);
      else resolve();
    };
    requestAnimationFrame(tick);
  });
}

document.getElementById("spinBtn").addEventListener("click", async () => {
  if (spinning) return;

  // ✅ لازم يحدد self name أولاً
  if (!mySelfName) {
    pendingSpinAfterSelfName = true;
    openSelfNameModal();
    return;
  }

  spinning = true;
  const btn = document.getElementById("spinBtn");
  btn.disabled = true;

  // تذكير/حالة
  setSpinStatus(t("spinPicking"), "notice");

  try {
    const out = await apiPost("/api/wheel/spin", {});
    const name = out.name;

    // حساب زاوية الوقوف
    const baseTarget = computeTargetRotationForName(name);
    if (baseTarget === null) throw new Error("NAME_NOT_FOUND_IN_WHEEL");

    // نخليها تدور لفات كثيرة للأثر
    const spins = 7; // عدد لفات إضافية
    // نخلي النهاية قريبة من baseTarget لكن مع لفات
    const finalRotation = baseTarget + spins * Math.PI * 2;

    setSpinStatus(t("spinningNow"), "notice");
    await animateTo(finalRotation, 3200);

    // ✅ بعد ما توقف: نوضح أنه وقف عند الاسم
    setSpinStatus(`${t("stoppedAt")} ${name}`, "success");

    // تحديث الواجهة
    myPickedName = name;
    document.getElementById("wheelTitle").textContent = myPickedName;
    document.getElementById("pickedLabel").textContent = `${t("yourPick")} ${myPickedName}`;

    // ننتظر شوي ثم نفتح مودال التهنئة + كونفيتي
    setTimeout(() => {
      openPickModal(name);
      launchConfetti(1600);
      setSpinStatus("", "notice");
    }, 650);

    // بعد الاختيار: نوقف الزر (كل مستخدم اختيار واحد)
    btn.disabled = true;
  } catch (e) {
    btn.disabled = false;

    if (e?.error === "NEED_SELF_NAME") {
      // السيرفر رفض (ما حدد selfName)
      pendingSpinAfterSelfName = true;
      openSelfNameModal();
      setSpinStatus("", "notice");
    } else if (e?.error === "NO_NAMES_LEFT") {
      setSpinStatus(t("noNamesLeft"), "error");
    } else {
      setSpinStatus(t("spinTryAgain"), "error");
    }
  } finally {
    spinning = false;
  }
});

/* مودال اختيار الاسم (تهنئة) */
const pickModal = document.getElementById("pickModal");
document.getElementById("closePick").addEventListener("click", () => pickModal.classList.remove("show"));
pickModal.addEventListener("click", (e) => {
  if (e.target === pickModal) pickModal.classList.remove("show");
});

function openPickModal(name) {
  document.getElementById("pickTitle").textContent = name;
  document.getElementById("pickDesc").textContent = t("congratsPick");
  pickModal.classList.add("show");
}

/* مراجعة الشرح */
const reviewModal = document.getElementById("reviewModal");
document.getElementById("reviewBtn").addEventListener("click", () => reviewModal.classList.add("show"));
document.getElementById("closeReview").addEventListener("click", () => reviewModal.classList.remove("show"));
reviewModal.addEventListener("click", (e) => {
  if (e.target === reviewModal) reviewModal.classList.remove("show");
});

/* حماية بسيطة ضد XSS */
function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
