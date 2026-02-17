// admin.js
// لوحة الأدمن:
// - عرض جميع المستخدمين المسجلين (يوزرنيم واضح)
// - عرض أسئلة الجميع + الرد عليها

import { apiGet, apiPost } from "./api.js";
import { applyLang, getLang, setLang, t } from "./i18n.js";
import { applyTheme, getTheme, setTheme } from "./theme.js";

applyTheme();
applyLang();

document.getElementById("langBtn").addEventListener("click", () => {
  setLang(getLang() === "ar" ? "en" : "ar");
  loadAll();
});
document.getElementById("themeBtn").addEventListener("click", () => {
  setTheme(getTheme() === "light" ? "dark" : "light");
});
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await apiPost("/api/auth/logout", {});
  location.href = "/index.html";
});

// حماية: لازم أدمن
(async () => {
  try {
    const me = await apiGet("/api/me");
    if (me.user.role !== "admin") return (location.href = "/index.html");
    await loadAll();
  } catch {
    location.href = "/index.html";
  }
})();

async function loadAll() {
  await Promise.all([loadUsers(), loadQuestions()]);
}

async function loadUsers() {
  const box = document.getElementById("usersList");
  box.className = "notice";
  box.textContent = "...";

  try {
    const data = await apiGet("/api/admin/users");
    const users = data.users || [];

    if (users.length === 0) {
      box.textContent = t("noUsersYet");
      return;
    }

    // عرض بسيط وواضح
    const html = users.map(u => {
      const roleTag = u.role === "admin" ? `<span class="pill" style="margin-inline-start:8px;">ADMIN</span>` : "";
      return `
        <div style="padding:10px;border:1px solid var(--border);border-radius:14px;background:var(--cardSolid);margin-top:10px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
          <div style="font-weight:800;">${escapeHtml(u.username)} ${roleTag}</div>
          <div style="color:var(--muted);font-size:13px;">${escapeHtml(u.created_at || "")}</div>
        </div>
      `;
    }).join("");

    box.className = "";
    box.innerHTML = html;
  } catch {
    box.className = "error";
    box.textContent = t("cantLoadUsers");
  }
}

async function loadQuestions() {
  const list = document.getElementById("list");
  list.className = "notice";
  list.textContent = "...";

  try {
    const data = await apiGet("/api/admin/questions");
    const items = data.items || [];

    if (items.length === 0) {
      list.textContent = t("noQuestionsAllYet");
      return;
    }

    const html = items.map(it => {
      const ans = it.answer_text ? escapeHtml(it.answer_text) : "";
      return `
        <div style="padding:12px;border:1px solid var(--border);border-radius:14px;background:var(--cardSolid);margin-top:12px;">
          <div style="font-weight:900;margin-bottom:6px;">
            <span>${t("askedBy")}:</span> ${escapeHtml(it.asked_by)}
          </div>
          <div style="margin-bottom:10px;">
            <span style="font-weight:800;">${t("question")}:</span>
            <div>${escapeHtml(it.question_text)}</div>
          </div>

          <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
            <input class="answerInput" data-id="${it.id}" placeholder="${t("writeAnswer")}" value="${ans}" />
            <button class="btn small" data-action="save" data-id="${it.id}">${t("save")}</button>
          </div>
        </div>
      `;
    }).join("");

    list.className = "";
    list.innerHTML = html;

    // ربط أزرار الحفظ
    list.querySelectorAll('button[data-action="save"]').forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        const input = list.querySelector(`input.answerInput[data-id="${id}"]`);
        const answer = (input?.value || "").trim();

        btn.disabled = true;
        try {
          await apiPost(`/api/admin/questions/${id}/answer`, { answer });
          btn.textContent = t("saved");
          setTimeout(() => (btn.textContent = t("save")), 900);
        } catch {
          alert(t("cantSave"));
        } finally {
          btn.disabled = false;
        }
      });
    });

  } catch {
    list.className = "error";
    list.textContent = t("cantLoadQuestionsAll");
  }
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
