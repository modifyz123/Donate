const express = require('express');
const router = express.Router();
const db = require('../db/database');
const QRCode = require('qrcode');
const generatePayload = require('promptpay-qr');
const axios = require('axios');

// PromptPay QR
router.get('/qr/promptpay', async (req, res) => {
  const { amount } = req.query;
  const promptpayId = process.env.PROMPTPAY_ID || '0960530977';
  try {
    const payload = generatePayload(promptpayId, { amount: parseFloat(amount) || 0 });
    const qrDataUrl = await QRCode.toDataURL(payload, { width: 300, margin: 2 });
    res.json({ qr: qrDataUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// True Wallet info
router.get('/truewallet-info', (req, res) => {
  res.json({ phone: process.env.TRUEWALLET_PHONE || '0960530977' });
});

// ตรวจสอบอั่งเปา True Wallet
router.post('/verify-voucher', async (req, res) => {
  const { voucher_url, phone } = req.body;
  try {
    const match = voucher_url.match(/[?&]v=([^&]+)/);
    if (!match) return res.status(400).json({ error: 'ลิงก์อั่งเปาไม่ถูกต้อง' });
    const voucherCode = match[1];

    const response = await axios.get(
      `https://gift.truemoney.com/campaign/vouchers/${voucherCode}/verify?mobile=${phone}`,
      { headers: { 'Content-Type': 'application/json' } }
    );

    const data = response.data;
    if (data.status?.code !== 'SUCCESS') {
      return res.status(400).json({ error: 'อั่งเปาไม่ถูกต้องหรือหมดอายุแล้ว' });
    }

    const amount = parseFloat(data.data?.voucher?.amount_baht || 0);
    const owner = data.data?.voucher?.owner_fullname || 'ไม่ทราบชื่อ';
    res.json({ success: true, amount, owner, voucherCode });
  } catch (err) {
    res.status(500).json({ error: 'ไม่สามารถตรวจสอบอั่งเปาได้' });
  }
});

// สร้างโดเนท
router.post('/', async (req, res) => {
  const { name, message, phone, amount, channel } = req.body;
  if (!amount || amount < 5 || amount > 20000)
    return res.status(400).json({ error: 'จำนวนเงินต้องอยู่ระหว่าง 5-20000 บาท' });
  if (!channel || !['TrueWallet', 'PromptPay'].includes(channel))
    return res.status(400).json({ error: 'ช่องทางชำระไม่ถูกต้อง' });
  try {
    await db.ready;
    const result = await db.run(
      'INSERT INTO donations (name, message, phone, amount, channel) VALUES (?, ?, ?, ?, ?)',
      [name?.trim() || 'Anonymous', message?.trim() || '', phone?.trim() || '', parseFloat(amount), channel]
    );
    const donation = await db.get('SELECT * FROM donations WHERE id = ?', [result.lastInsertRowid]);
    const io = req.app.get('io');
    io.to('alert').emit('new-donation', donation);
    io.to('top').emit('top-updated');
    io.to('goal').emit('goal-updated');
    io.to('admin').emit('donation-list-updated');
    res.json({ success: true, donation });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// รายการโดเนท
router.get('/', async (req, res) => {
  await db.ready;
  const donations = await db.all('SELECT * FROM donations ORDER BY created_at DESC LIMIT 100');
  res.json(donations);
});

// Top 3
router.get('/top', async (req, res) => {
  await db.ready;
  const top = await db.all(
    'SELECT name, SUM(amount) as total FROM donations GROUP BY name ORDER BY total DESC LIMIT 3'
  );
  res.json(top);
});

// Goal stats
router.get('/goal-stats', async (req, res) => {
  await db.ready;
  const goalRow = await db.get("SELECT value FROM settings WHERE key='goal_amount'");
  const titleRow = await db.get("SELECT value FROM settings WHERE key='goal_title'");
  const totalRow = await db.get('SELECT COALESCE(SUM(amount),0) as total FROM donations');
  const goalAmount = parseFloat(goalRow?.value || 2000);
  const goalTitle = titleRow?.value || 'Donate Goal';
  const total = totalRow?.total || 0;
  res.json({ total, goalAmount, goalTitle, percent: Math.min(100, (total / goalAmount) * 100) });
});

// Re-alert
router.post('/:id/alert', async (req, res) => {
  await db.ready;
  const donation = await db.get('SELECT * FROM donations WHERE id = ?', [req.params.id]);
  if (!donation) return res.status(404).json({ error: 'ไม่พบรายการ' });
  req.app.get('io').to('alert').emit('new-donation', donation);
  res.json({ success: true });
});

module.exports = router;