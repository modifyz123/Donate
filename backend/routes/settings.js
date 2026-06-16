const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { v4: uuidv4 } = require('uuid');

router.get('/', async (req, res) => {
  await db.ready;
  const rows = await db.all('SELECT * FROM settings');
  const settings = {};
  rows.forEach(r => settings[r.key] = r.value);
  const tokens = await db.all('SELECT * FROM overlay_tokens');
  const overlayTokens = {};
  tokens.forEach(t => overlayTokens[t.type] = t.token);
  res.json({ settings, overlayTokens });
});

router.put('/', async (req, res) => {
  await db.ready;
  const { settings } = req.body;
  for (const [k, v] of Object.entries(settings)) {
    await db.run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [k, String(v)]);
  }
  req.app.get('io').emit('settings-updated');
  res.json({ success: true });
});

router.post('/reset-token/:type', async (req, res) => {
  const { type } = req.params;
  if (!['alert', 'top', 'goal'].includes(type))
    return res.status(400).json({ error: 'Invalid type' });
  await db.ready;
  const newToken = uuidv4().replace(/-/g, '').slice(0, 12);
  await db.run('INSERT OR REPLACE INTO overlay_tokens (type, token) VALUES (?, ?)', [type, newToken]);
  res.json({ token: newToken });
});

router.post('/test-alert', (req, res) => {
  req.app.get('io').to('alert').emit('new-donation', {
    id: 0, name: 'Test', message: 'ทดสอบระบบ Alert',
    amount: 5000, channel: 'PromptPay', created_at: new Date().toISOString()
  });
  res.json({ success: true });
});

module.exports = router;