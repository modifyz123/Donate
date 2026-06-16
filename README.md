# 💝 DonateHub — ระบบโดเนทสตรีม

## โครงสร้างโปรเจกต์

```
donation-system/
├── backend/          ← Node.js + Express + Socket.io + SQLite
│   ├── db/
│   ├── routes/
│   ├── server.js
│   ├── overlay-alert.html   ← OBS Overlay
│   ├── overlay-top.html
│   ├── overlay-goal.html
│   └── .env.example
└── frontend/         ← React + Vite + Tailwind
    └── src/
        └── pages/
            ├── DonatePage.jsx       หน้าโดเนท
            ├── HistoryPage.jsx      รายการโดเนท
            ├── AlertSettings.jsx    ตั้งค่า Alert
            ├── TopDonatePage.jsx    Top 3
            └── GoalPage.jsx         Donate Goal
```

---

## 🚀 วิธีติดตั้ง

### 1. Backend
```bash
cd backend
cp .env.example .env
# แก้ไข .env ใส่เบอร์ True Wallet และ PromptPay
npm install
npm run dev
```
Backend จะรันที่ http://localhost:3001

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend จะรันที่ http://localhost:5173

---

## ⚙️ ตั้งค่า .env

```env
PORT=3001
FRONTEND_URL=http://localhost:5173
TRUEWALLET_PHONE=0812345678     # เบอร์ True Wallet ของคุณ
PROMPTPAY_ID=0812345678          # เบอร์/เลขบัตรประชาชน PromptPay
ADMIN_PASSWORD=admin1234
```

---

## 📺 การใช้งาน OBS / Streamlabs

1. เปิดหน้า **Alert Settings** ในเบราเซอร์
2. คัดลอก URL ของ Overlay ที่ต้องการ
3. ใน OBS → เพิ่ม Source → **Browser Source**
4. วาง URL → ตั้งขนาด Width/Height ตามต้องการ
5. กด **ทดสอบ Alert** เพื่อทดสอบ

### ขนาด Browser Source ที่แนะนำ:
- Alert: 800 × 200
- Top Donate: 400 × 150
- Goal: 450 × 80

---

## ✨ ฟีเจอร์

| ฟีเจอร์ | รายละเอียด |
|---|---|
| 💝 หน้าโดเนท | ชื่อ, ข้อความ (250 ตัว), เบอร์โทร, จำนวน 5-20,000 บาท |
| 💳 ช่องทางชำระ | True Wallet + PromptPay QR Code |
| 📋 รายการโดเนท | ดูประวัติ, Alert ซ้ำได้, Real-time |
| 🔔 Alert | ปรับสี/ฟอนต์/Animation/เสียงอ่าน TTS |
| 🏆 Top Donate | Top 3 ผู้โดเนทสูงสุด |
| 🎯 Donate Goal | Progress bar เป้าหมายโดเนท |
| 📺 OBS Overlay | URL สำหรับใส่ใน OBS/Streamlabs |

---

## 🔧 Extensions VSCode แนะนำ

- **ESLint** — ตรวจ code
- **Prettier** — จัด format  
- **ES7+ React Snippets** — shortcut React
- **Tailwind CSS IntelliSense** — autocomplete Tailwind
- **REST Client** — ทดสอบ API
- **DotENV** — highlight .env
- **SQLite Viewer** — ดู database
- **Thunder Client** — ทดสอบ API แบบ GUI
