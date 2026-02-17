// db.js
// هذا الملف مسؤول عن إنشاء قاعدة البيانات (SQLite) والجداول المطلوبة تلقائيًا
// ✅ تم تحديثه ليشمل:
// 1) role (تمييز الأدمن)
// 2) has_seen_intro (عشان شرح الفعاليتين يطلع مرة واحدة فقط)
// 3) self_name (اسم المستخدم الحقيقي لتجنب أن يطلع له اسمه في العجلة)

const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const DB_PATH = path.join(__dirname, "eid_family.sqlite");
const db = new sqlite3.Database(DB_PATH);

// دالة مساعدة: تنفيذ أمر SQL وتجاهل أخطاء "العمود موجود" في حالة المايجريشن
function runSafe(sql) {
  db.run(sql, (err) => {
    // ❗نطنش أخطاء إضافة أعمدة موجودة مسبقاً
    if (err) {
      const msg = String(err.message || "");
      if (msg.includes("duplicate column") || msg.includes("already exists")) return;
      // باقي الأخطاء نخليها تظهر بالكونسول للتشخيص
      console.error("[DB] Migration error:", err.message);
    }
  });
}

// تهيئة DB والجداول
function initDb() {
  db.serialize(() => {
    // جدول المستخدمين (بالهيكل الجديد)
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        has_seen_intro INTEGER NOT NULL DEFAULT 0,
        self_name TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    // 👇 لو الجدول كان قديم (بدون أعمدة role/has_seen_intro/self_name)، نضيفها بدون ما نكسر شيء
    runSafe(`ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'`);
    runSafe(`ALTER TABLE users ADD COLUMN has_seen_intro INTEGER NOT NULL DEFAULT 0`);
    runSafe(`ALTER TABLE users ADD COLUMN self_name TEXT`);

    // جدول الأسئلة/الردود
    db.run(`
      CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        question_text TEXT NOT NULL,
        answer_text TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        answered_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // جدول أسماء الدائرة (الفعالية الأولى)
    // مهم: الأسماء تظل موجودة دائماً (ما تنحذف من العرض)،
    // لكن اختيار الاسم يتم مرة واحدة فقط عبر chosen_by_user_id
    db.run(`
      CREATE TABLE IF NOT EXISTS wheel_names (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name_text TEXT UNIQUE NOT NULL,
        chosen_by_user_id INTEGER,
        chosen_at TEXT,
        FOREIGN KEY (chosen_by_user_id) REFERENCES users(id)
      )
    `);
  });
}

/**
 * إضافة أسماء الدائرة مرة واحدة.
 * إذا كان الاسم موجود، يتجاهله.
 */
function seedWheelNames(names = []) {
  db.serialize(() => {
    const stmt = db.prepare(`INSERT OR IGNORE INTO wheel_names (name_text) VALUES (?)`);
    for (const n of names) stmt.run(n);
    stmt.finalize();
  });
}

module.exports = { db, initDb, seedWheelNames };
