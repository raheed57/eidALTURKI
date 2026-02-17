// server.js
// سيرفر Express + APIs للتسجيل/تذكرني/الأسئلة/الAdmin/الدائرة
// ✅ تم تحسينه لتحقيق المتطلبات بدون حذف أي ميزة:
// 1) تذكرني: كوكي ثابت للجهاز (Remember Me) + يدخله تلقائيًا عند الرجوع
// 2) الأدمن صار "مستخدم" داخل قاعدة البيانات (يوزر واحد + باس واحد)
// 3) شرح الفعاليتين يظهر مرة واحدة فقط بعد إنشاء الحساب (has_seen_intro)
// 4) الدائرة تعرض كل الأسماء دائمًا لكن اختيار الاسم لا يتكرر (بدون كشف الأسماء المختارة)
// 5) الدائرة تمنع أن يطلع للمستخدم "اسمه" (self_name) + لازم يحدد اسمه قبل السحب

require("dotenv").config();
const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { db, initDb, seedWheelNames } = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "CHANGE_ME";

// بيانات الأدمن المطلوبة (يوزر واحد + باس واحد)
const ADMIN_USERNAME = "admen";
const ADMIN_PASSWORD = "noOneCanSee57";

// ✅ مهم لـ Render/Proxy عشان req.secure و X-Forwarded-Proto
app.set("trust proxy", 1);

// إعدادات عامة
app.use(express.json());
app.use(cookieParser());

// تقديم ملفات الواجهة (Front-end)
app.use(express.static(path.join(__dirname, "..", "public")));

// تهيئة DB
initDb();

// مثال: ضعي أسماء عائلتك هنا (عدليها قبل التشغيل أول مرة)
// ✅ قائمة الأسماء المطلوبة (لا تغيّر الترتيب)
seedWheelNames([
  "بابا",
  "ماما",
  "ريناد",
  "ريفال",
  "عبدالله",
  "حمد",
  "رهيد",
  "يوسف"
]);

// ✅ إنشاء/تأكيد حساب الأدمن داخل DB (مرة واحدة)
(function ensureAdminUser() {
  try {
    db.get(`SELECT id, username, role FROM users WHERE username = ?`, [ADMIN_USERNAME], (err, row) => {
      if (err) return console.error("[ADMIN] DB error:", err.message);

      const hash = bcrypt.hashSync(ADMIN_PASSWORD, 10);

      if (!row) {
        // إنشاء أدمن جديد
        db.run(
          `INSERT INTO users (username, password_hash, role, has_seen_intro) VALUES (?, ?, 'admin', 1)`,
          [ADMIN_USERNAME, hash],
          (err2) => {
            if (err2) console.error("[ADMIN] Create error:", err2.message);
            else console.log("[ADMIN] Admin user created.");
          }
        );
        return;
      }

      // إذا موجود: نتأكد أنه role=admin (بدون تعدد)
      if (row.role !== "admin") {
        db.run(
          `UPDATE users SET role = 'admin', password_hash = ?, has_seen_intro = 1 WHERE username = ?`,
          [hash, ADMIN_USERNAME],
          (err3) => {
            if (err3) console.error("[ADMIN] Update error:", err3.message);
            else console.log("[ADMIN] Admin user updated to admin role.");
          }
        );
      }
    });
  } catch (e) {
    console.error("[ADMIN] ensureAdminUser failed:", e);
  }
})();

/** =========================
 *  أدوات مساعدة للتوثيق
 *  ========================= */

// إنشاء توكن JWT
function signToken(payload, rememberMe) {
  // إذا تذكرني = true: نخلي التوكن طويل (30 يوم)
  // إذا false: أقصر (8 ساعات) حتى لو كان الكوكي جلسة
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: rememberMe ? "30d" : "8h" });
  return token;
}

// هل الاتصال HTTPS؟ (مهم للكوكي على Render)
function isHttps(req) {
  const xf = (req.headers["x-forwarded-proto"] || "").toString().toLowerCase();
  return req.secure || xf === "https";
}

// ميدل وير: قراءة المستخدم من الكوكي
function authRequired(req, res, next) {
  try {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ error: "UNAUTHORIZED" });
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, username, role }
    return next();
  } catch (e) {
    return res.status(401).json({ error: "UNAUTHORIZED" });
  }
}

// شرط الأدمن
function adminRequired(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "FORBIDDEN" });
  }
  return next();
}

/** =========================
 *  Auth APIs
 *  ========================= */

// تسجيل دخول (وأيضًا إنشاء حساب تلقائي إذا المستخدم جديد)
app.post("/api/auth/login", (req, res) => {
  const { username, password, rememberMe } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "MISSING_FIELDS" });
  }

  // نبحث عنه في DB (بما فيهم الأدمن)
  db.get(
    `SELECT id, username, password_hash, role, has_seen_intro, self_name FROM users WHERE username = ?`,
    [String(username).trim()],
    async (err, row) => {
      if (err) return res.status(500).json({ error: "DB_ERROR" });

      // إذا غير موجود: إنشاء حساب جديد تلقائيًا
      if (!row) {
        try {
          const hash = await bcrypt.hash(password, 10);
          db.run(
            `INSERT INTO users (username, password_hash, role, has_seen_intro) VALUES (?, ?, 'user', 0)`,
            [String(username).trim(), hash],
            function (err2) {
              if (err2) return res.status(500).json({ error: "DB_ERROR" });

              const userId = this.lastID;
              const token = signToken({ id: userId, username: String(username).trim(), role: "user" }, !!rememberMe);

              // إعداد الكوكي
              res.cookie("auth_token", token, {
                httpOnly: true,
                sameSite: "lax",
                secure: isHttps(req),
                maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : undefined
              });

              return res.json({
                ok: true,
                role: "user",
                username: String(username).trim(),
                hasSeenIntro: false,
                isNew: true
              });
            }
          );
        } catch {
          return res.status(500).json({ error: "HASH_ERROR" });
        }
        return;
      }

      // موجود: لازم كلمة المرور تطابق (شرط: لكل يوزر باس واحد فقط)
      const isOk = await bcrypt.compare(password, row.password_hash);
      if (!isOk) {
        return res.status(401).json({ error: "WRONG_PASSWORD" });
      }

      const token = signToken({ id: row.id, username: row.username, role: row.role }, !!rememberMe);

      res.cookie("auth_token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: isHttps(req),
        maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : undefined
      });

      return res.json({
        ok: true,
        role: row.role,
        username: row.username,
        hasSeenIntro: !!row.has_seen_intro,
        isNew: false
      });
    }
  );
});

// تسجيل خروج
app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("auth_token");
  return res.json({ ok: true });
});

// معلومات المستخدم الحالي (مهم للأوتو-لوقين)
app.get("/api/me", authRequired, (req, res) => {
  // نرجع معلومات إضافية من DB (خصوصاً has_seen_intro/self_name)
  db.get(
    `SELECT id, username, role, has_seen_intro, self_name FROM users WHERE id = ?`,
    [req.user.id],
    (err, row) => {
      if (err) return res.status(500).json({ error: "DB_ERROR" });
      if (!row) return res.status(401).json({ error: "UNAUTHORIZED" });

      return res.json({
        ok: true,
        user: {
          id: row.id,
          username: row.username,
          role: row.role,
          hasSeenIntro: !!row.has_seen_intro,
          selfName: row.self_name || null
        }
      });
    }
  );
});

/** =========================
 *  Intro APIs
 *  ========================= */

// تعليم أن المستخدم شاهد شرح الفعاليتين (مرة واحدة)
app.post("/api/intro/complete", authRequired, (req, res) => {
  if (req.user.role === "admin") return res.json({ ok: true });

  db.run(
    `UPDATE users SET has_seen_intro = 1 WHERE id = ?`,
    [req.user.id],
    (err) => {
      if (err) return res.status(500).json({ error: "DB_ERROR" });
      return res.json({ ok: true });
    }
  );
});

// حفظ اسم المستخدم الحقيقي (عشان لا يطلع له اسمه في العجلة)
app.post("/api/users/self-name", authRequired, (req, res) => {
  if (req.user.role === "admin") return res.status(400).json({ error: "ADMIN_NO_SELFNAME" });

  const { selfName } = req.body || {};
  const clean = String(selfName || "").trim();
  if (!clean) return res.status(400).json({ error: "MISSING_SELF_NAME" });

  // نتأكد الاسم موجود ضمن wheel_names (عشان ما يدخل أي شيء)
  db.get(
    `SELECT id FROM wheel_names WHERE name_text = ? LIMIT 1`,
    [clean],
    (err, row) => {
      if (err) return res.status(500).json({ error: "DB_ERROR" });
      if (!row) return res.status(400).json({ error: "INVALID_SELF_NAME" });

      db.run(
        `UPDATE users SET self_name = ? WHERE id = ?`,
        [clean, req.user.id],
        (err2) => {
          if (err2) return res.status(500).json({ error: "DB_ERROR" });
          return res.json({ ok: true, selfName: clean });
        }
      );
    }
  );
});

/** =========================
 *  Questions APIs
 *  ========================= */

// إرسال سؤال للأدمن
app.post("/api/questions", authRequired, (req, res) => {
  const { question } = req.body || {};
  if (!question || !String(question).trim()) return res.status(400).json({ error: "EMPTY_QUESTION" });

  // الأدمن ما يحتاج يسأل هنا
  if (req.user.role === "admin") return res.status(400).json({ error: "ADMIN_CANNOT_ASK_HERE" });

  db.run(
    `INSERT INTO questions (user_id, question_text) VALUES (?, ?)`,
    [req.user.id, String(question).trim()],
    function (err) {
      if (err) return res.status(500).json({ error: "DB_ERROR" });
      return res.json({ ok: true, questionId: this.lastID });
    }
  );
});

// جلب أسئلة المستخدم
app.get("/api/questions/mine", authRequired, (req, res) => {
  if (req.user.role === "admin") return res.json({ ok: true, items: [] });

  db.all(
    `SELECT id, question_text, answer_text, created_at, answered_at
     FROM questions
     WHERE user_id = ?
     ORDER BY id DESC`,
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "DB_ERROR" });
      return res.json({ ok: true, items: rows || [] });
    }
  );
});

/** =========================
 *  Admin APIs
 *  ========================= */

// قائمة كل المستخدمين (للوحة الأدمن)
app.get("/api/admin/users", authRequired, adminRequired, (req, res) => {
  db.all(
    `SELECT username, role, created_at FROM users ORDER BY id ASC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "DB_ERROR" });
      return res.json({ ok: true, users: rows || [] });
    }
  );
});

// جلب أسئلة الجميع للأدمن
app.get("/api/admin/questions", authRequired, adminRequired, (req, res) => {
  db.all(
    `SELECT q.id, q.question_text, q.answer_text, q.created_at, q.answered_at,
            u.username AS asked_by
     FROM questions q
     JOIN users u ON u.id = q.user_id
     ORDER BY q.id DESC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "DB_ERROR" });
      return res.json({ ok: true, items: rows || [] });
    }
  );
});

// رد الأدمن على سؤال
app.post("/api/admin/questions/:id/answer", authRequired, adminRequired, (req, res) => {
  const { answer } = req.body || {};
  const qid = Number(req.params.id);
  if (!qid) return res.status(400).json({ error: "BAD_ID" });

  db.run(
    `UPDATE questions
     SET answer_text = ?, answered_at = datetime('now')
     WHERE id = ?`,
    [String(answer || "").trim(), qid],
    function (err) {
      if (err) return res.status(500).json({ error: "DB_ERROR" });
      return res.json({ ok: true, updated: this.changes });
    }
  );
});

/** =========================
 *  Wheel APIs
 *  ========================= */

// ✅ عرض الأسماء: لازم دائماً ترجع كل الأسماء (بدون حذف) حتى ما يبان للمستخدم إيش انحجز
app.get("/api/wheel/names", authRequired, (req, res) => {
  // الأدمن ما يحتاج
  if (req.user.role === "admin") return res.json({ ok: true, names: [] });

  db.all(
    `SELECT name_text FROM wheel_names ORDER BY id ASC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "DB_ERROR" });
      return res.json({ ok: true, names: (rows || []).map(r => r.name_text) });
    }
  );
});

// اسم المستخدم المختار (إذا سبق له اختيار)
app.get("/api/wheel/mine", authRequired, (req, res) => {
  if (req.user.role === "admin") return res.json({ ok: true, myName: null, selfName: null });

  db.get(
    `SELECT name_text FROM wheel_names WHERE chosen_by_user_id = ? LIMIT 1`,
    [req.user.id],
    (err, row) => {
      if (err) return res.status(500).json({ error: "DB_ERROR" });

      db.get(
        `SELECT self_name FROM users WHERE id = ?`,
        [req.user.id],
        (err2, urow) => {
          if (err2) return res.status(500).json({ error: "DB_ERROR" });
          return res.json({ ok: true, myName: row ? row.name_text : null, selfName: urow?.self_name || null });
        }
      );
    }
  );
});

// اختيار اسم من الدائرة (مرة واحدة لكل مستخدم، ولا يتكرر على مستوى الموقع)
app.post("/api/wheel/spin", authRequired, (req, res) => {
  if (req.user.role === "admin") return res.status(400).json({ error: "ADMIN_NO_SPIN" });

  // أولاً: لازم يكون المستخدم حدد self_name (اسمها الحقيقي)
  db.get(`SELECT self_name FROM users WHERE id = ?`, [req.user.id], (err0, urow) => {
    if (err0) return res.status(500).json({ error: "DB_ERROR" });
    const selfName = (urow?.self_name || "").trim();
    if (!selfName) return res.status(400).json({ error: "NEED_SELF_NAME" });

    // إذا المستخدم عنده اسم سابق، نرجعه
    db.get(
      `SELECT id, name_text FROM wheel_names WHERE chosen_by_user_id = ? LIMIT 1`,
      [req.user.id],
      (err, existing) => {
        if (err) return res.status(500).json({ error: "DB_ERROR" });
        if (existing) return res.json({ ok: true, name: existing.name_text, alreadyHad: true });

        // Transaction
        db.serialize(() => {
          db.run("BEGIN IMMEDIATE TRANSACTION");

          // نجيب الأسماء المتاحة (غير مختارة سابقاً) + ونستبعد self_name عشان ما يطلع له اسمه
          db.all(
            `SELECT id, name_text
             FROM wheel_names
             WHERE chosen_by_user_id IS NULL
               AND name_text <> ?`,
            [selfName],
            (err2, rows) => {
              if (err2) {
                db.run("ROLLBACK");
                return res.status(500).json({ error: "DB_ERROR" });
              }

              if (!rows || rows.length === 0) {
                db.run("ROLLBACK");
                return res.status(409).json({ error: "NO_NAMES_LEFT" });
              }

              const pick = rows[Math.floor(Math.random() * rows.length)];

              // تحديث محمي: لو أحد سبقنا في نفس اللحظة ما يتكرر الاسم
              db.run(
                `UPDATE wheel_names
                 SET chosen_by_user_id = ?, chosen_at = datetime('now')
                 WHERE id = ? AND chosen_by_user_id IS NULL`,
                [req.user.id, pick.id],
                function (err3) {
                  if (err3) {
                    db.run("ROLLBACK");
                    return res.status(500).json({ error: "DB_ERROR" });
                  }

                  if (this.changes === 0) {
                    db.run("ROLLBACK");
                    return res.status(409).json({ error: "RACE_TRY_AGAIN" });
                  }

                  db.run("COMMIT");
                  return res.json({ ok: true, name: pick.name_text, alreadyHad: false });
                }
              );
            }
          );
        });
      }
    );
  });
});

/** =========================
 *  تشغيل السيرفر
 *  ========================= */

app.listen(PORT, () => {
  console.log("Server running on http://localhost:" + PORT);
});
