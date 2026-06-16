const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, 'donations.db');
const rawDb = new sqlite3.Database(dbPath);

const run = (sql, params = []) => new Promise((res, rej) =>
  rawDb.run(sql, params, function(err) { err ? rej(err) : res({ lastInsertRowid: this.lastID }) }));
const get = (sql, params = []) => new Promise((res, rej) =>
  rawDb.get(sql, params, (err, row) => err ? rej(err) : res(row)));
const all = (sql, params = []) => new Promise((res, rej) =>
  rawDb.all(sql, params, (err, rows) => err ? rej(err) : res(rows)));

const db = { run, get, all };

async function init() {
  await new Promise((res, rej) => rawDb.exec(`
    CREATE TABLE IF NOT EXISTS donations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL DEFAULT 'Anonymous',
      message TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      amount REAL NOT NULL,
      channel TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      alerted INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS overlay_tokens (type TEXT PRIMARY KEY, token TEXT NOT NULL);
  `, err => err ? rej(err) : res()));

  const defaults = [
    ['goal_amount','2000'],['goal_title','Donate Goal'],
    ['goal_start_date', new Date().toISOString()],
    ['alert_highlight_color','#f5a623'],['alert_text_color','#cc0000'],
    ['alert_message_color','#cc44cc'],['alert_message','ให้ค่าขนม'],
    ['alert_duration','10'],['alert_font_size','48'],
    ['alert_animation_in','fadeIn'],['alert_animation_out','bounceOut'],
    ['alert_sound',''],['alert_tts_enabled','true'],['alert_tts_rate','1'],
  ];
  for (const [k, v] of defaults)
    await run('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)', [k, v]);
  for (const type of ['alert', 'top', 'goal']) {
    const token = uuidv4().replace(/-/g, '').slice(0, 12);
    await run('INSERT OR IGNORE INTO overlay_tokens (type, token) VALUES (?, ?)', [type, token]);
  }
}

db.ready = init();
module.exports = db;
