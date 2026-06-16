import { useState } from 'react'
import axios from 'axios'

const AMOUNTS = [20, 50, 100, 200, 500, 1000]

export default function DonatePage() {
  const [form, setForm] = useState({ name: '', message: '', amount: '' })
  const [channel, setChannel] = useState('TrueWallet')
  const [qr, setQr] = useState(null)
  const [step, setStep] = useState('form')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [voucherUrl, setVoucherUrl] = useState('')
  const [voucherInfo, setVoucherInfo] = useState(null)
  const [voucherError, setVoucherError] = useState('')
  const [verifying, setVerifying] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.amount || parseFloat(form.amount) < 5 || parseFloat(form.amount) > 20000)
      e.amount = 'จำนวนเงิน 5–20,000 บาท'
    return e
  }

  const handleNext = async () => {
    const e = validate()
    if (Object.keys(e).length) return setErrors(e)
    setErrors({})
    if (channel === 'PromptPay') {
      setLoading(true)
      try {
        const r = await axios.get(`/api/donations/qr/promptpay?amount=${form.amount}`)
        setQr(r.data.qr)
      } catch {}
      setLoading(false)
    }
    setVoucherUrl('')
    setVoucherInfo(null)
    setVoucherError('')
    setStep('payment')
  }

  const handleVerifyVoucher = async () => {
    setVerifying(true)
    setVoucherError('')
    try {
      const r = await axios.post('/api/donations/verify-voucher', { voucher_url: voucherUrl })
      setVoucherInfo(r.data)
      setForm(p => ({ ...p, amount: String(r.data.amount) }))
    } catch (err) {
      setVoucherError(err.response?.data?.error || 'ตรวจสอบไม่ได้ กรุณาลองใหม่')
    }
    setVerifying(false)
  }

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await axios.post('/api/donations', {
        name: form.name || 'Anonymous',
        message: form.message,
        amount: parseFloat(form.amount),
        channel
      })
      setStep('success')
    } catch (err) {
      alert(err.response?.data?.error || 'เกิดข้อผิดพลาด')
    }
    setLoading(false)
  }

  const reset = () => {
    setForm({ name: '', message: '', amount: '' })
    setChannel('TrueWallet')
    setQr(null)
    setVoucherUrl('')
    setVoucherInfo(null)
    setVoucherError('')
    setStep('form')
  }

  if (step === 'success') return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-blue-100">
        <span className="text-4xl">💝</span>
      </div>
      <h2 className="text-2xl font-bold text-blue-900 mb-2">ขอบคุณมาก!</h2>
      <p className="text-blue-400 mb-8">ระบบรับโดเนทของคุณเรียบร้อยแล้ว</p>
      <button onClick={reset}
        className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 transition-colors shadow-lg shadow-blue-200">
        โดเนทอีกครั้ง
      </button>
    </div>
  )

  if (step === 'payment') return (
    <div className="max-w-sm mx-auto px-4 py-6">
      <button onClick={() => setStep('form')}
        className="flex items-center gap-2 text-blue-400 hover:text-blue-600 mb-6 text-sm transition-colors">
        ← กลับ
      </button>

      <div className="bg-white rounded-2xl border border-blue-100 shadow-lg shadow-blue-100 p-6 space-y-6">
        {/* Amount */}
        <div className="text-center pb-4 border-b border-blue-50">
          <p className="text-xs text-blue-300 uppercase tracking-wider mb-1">ยอดชำระ</p>
          <p className="text-5xl font-bold text-blue-600">
            ฿{parseFloat(form.amount || 0).toLocaleString()}
          </p>
          <span className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-400 text-xs rounded-full">
            {channel === 'TrueWallet' ? '🧧 True Wallet อั่งเปา' : '🟣 PromptPay'}
          </span>
        </div>

        {/* PromptPay QR */}
        {channel === 'PromptPay' && qr && (
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 border border-blue-100 rounded-xl shadow-sm">
              <img src={qr} alt="PromptPay QR" className="w-52 h-52" />
            </div>
            <p className="text-xs text-blue-300">สแกน QR Code ด้วยแอปธนาคาร</p>
          </div>
        )}

        {/* True Wallet Voucher */}
        {channel === 'TrueWallet' && (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700 space-y-1.5 border border-blue-100">
              <p className="font-semibold text-blue-800 mb-2">📋 วิธีส่งอั่งเปา</p>
              <p>1. เปิดแอป True Wallet</p>
              <p>2. กด <span className="font-semibold text-blue-600">อั่งเปา → สร้างอั่งเปา</span></p>
              <p>3. ใส่จำนวน <span className="font-semibold text-blue-600">฿{form.amount}</span></p>
              <p>4. Copy ลิงก์ แล้ววางด้านล่าง</p>
            </div>

            <div>
              <input
                className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors placeholder-blue-200 ${
                  voucherError
                    ? 'border-red-300 bg-red-50'
                    : 'border-blue-200 focus:border-blue-400 bg-blue-50/30'
                }`}
                placeholder="https://gift.truemoney.com/campaign/?v=..."
                value={voucherUrl}
                onChange={e => { setVoucherUrl(e.target.value); setVoucherInfo(null); setVoucherError('') }}
              />
              {voucherError && <p className="text-red-400 text-xs mt-1.5">{voucherError}</p>}
            </div>

            {voucherInfo ? (
              <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl p-4">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="text-sm font-semibold text-green-700">ตรวจสอบสำเร็จ</p>
                  <p className="text-xs text-green-500">จาก: {voucherInfo.owner} · ฿{voucherInfo.amount.toLocaleString()}</p>
                </div>
              </div>
            ) : (
              <button onClick={handleVerifyVoucher} disabled={verifying || !voucherUrl}
                className="w-full py-3 border border-blue-200 rounded-xl text-sm text-blue-500 hover:bg-blue-50 disabled:opacity-40 transition-colors">
                {verifying ? 'กำลังตรวจสอบ...' : '🔍 ตรวจสอบอั่งเปา'}
              </button>
            )}
          </div>
        )}

        <button onClick={handleConfirm}
          disabled={loading || (channel === 'TrueWallet' && !voucherInfo)}
          className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-500 disabled:opacity-30 transition-colors shadow-lg shadow-blue-200">
          {loading ? 'กำลังส่ง...'
            : channel === 'TrueWallet' && !voucherInfo ? 'ตรวจสอบอั่งเปาก่อน'
            : '✅ ยืนยันการโดเนท'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-sm mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-blue-900">โดเนท 💝</h1>
        <p className="text-blue-300 text-sm mt-1">สนับสนุนสตรีมเมอร์ที่คุณชื่นชอบ</p>
      </div>

      <div className="bg-white rounded-2xl border border-blue-100 shadow-lg shadow-blue-100 p-6 space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-blue-800 mb-1.5">ชื่อ</label>
          <input
            className="w-full border border-blue-200 bg-blue-50/30 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors placeholder-blue-200"
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="Anonymous"
            maxLength={50}
          />
          <p className="text-blue-300 text-xs mt-1">ชื่อที่จะแสดงบนสตรีม</p>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-blue-800 mb-1.5">ข้อความ</label>
          <textarea
            className="w-full border border-blue-200 bg-blue-50/30 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors placeholder-blue-200 resize-none h-24"
            value={form.message}
            onChange={e => { if (e.target.value.length <= 250) setForm(p => ({ ...p, message: e.target.value })) }}
            placeholder="ข้อความถึงสตรีมเมอร์..."
          />
          <p className="text-right text-blue-200 text-xs">{form.message.length}/250</p>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-blue-800 mb-1.5">จำนวนเงิน (บาท)</label>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {AMOUNTS.map(a => (
              <button key={a} onClick={() => setForm(p => ({ ...p, amount: String(a) }))}
                className={`py-2 rounded-lg text-sm font-medium border transition-all ${
                  form.amount === String(a)
                    ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-200'
                    : 'border-blue-200 text-blue-400 hover:border-blue-400 bg-blue-50/30'
                }`}>
                ฿{a}
              </button>
            ))}
          </div>
          <input
            className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors placeholder-blue-200 ${
              errors.amount
                ? 'border-red-300 bg-red-50'
                : 'border-blue-200 bg-blue-50/30 focus:border-blue-400'
            }`}
            value={form.amount}
            onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
            placeholder="หรือกรอกจำนวนเอง"
            type="number" min="5" max="20000"
          />
          {errors.amount
            ? <p className="text-red-400 text-xs mt-1">{errors.amount}</p>
            : <p className="text-blue-300 text-xs mt-1">5 – 20,000 บาท</p>}
        </div>

        {/* Channel */}
        <div>
          <label className="block text-sm font-medium text-blue-800 mb-1.5">ช่องทางชำระ</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'TrueWallet', label: 'True Wallet', sub: 'อั่งเปา', icon: '🧧' },
              { id: 'PromptPay', label: 'PromptPay', sub: 'QR Code', icon: '🟣' },
            ].map(ch => (
              <button key={ch.id} onClick={() => setChannel(ch.id)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  channel === ch.id
                    ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-200'
                    : 'border-blue-200 bg-blue-50/30 hover:border-blue-400'
                }`}>
                <div className="text-xl mb-1">{ch.icon}</div>
                <div className={`text-sm font-semibold ${channel === ch.id ? 'text-white' : 'text-blue-700'}`}>
                  {ch.label}
                </div>
                <div className={`text-xs ${channel === ch.id ? 'text-blue-100' : 'text-blue-300'}`}>
                  {ch.sub}
                </div>
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleNext} disabled={loading}
          className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-500 disabled:opacity-50 transition-colors shadow-lg shadow-blue-200">
          {loading ? 'กำลังโหลด...' : 'ถัดไป →'}
        </button>

        <p className="text-center text-blue-200 text-xs">
          ระบบไม่เปิดเผยข้อมูลส่วนตัวของท่าน
        </p>
      </div>
    </div>
  )
}