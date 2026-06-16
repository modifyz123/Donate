import { useState, useEffect } from 'react'
import axios from 'axios'
import { io } from 'socket.io-client'

const socket = io('/', { autoConnect: false })

export default function GoalPage() {
  const [stats, setStats] = useState({ total: 0, goalAmount: 2000, goalTitle: 'Donate Goal', percent: 0 })
  const [settings, setSettings] = useState({ goal_amount: '2000', goal_title: 'Donate Goal' })
  const [tokens, setTokens] = useState({})
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)

  const load = async () => {
    const [statsR, setR] = await Promise.all([
      axios.get('/api/donations/goal-stats'),
      axios.get('/api/settings')
    ])
    setStats(statsR.data)
    setSettings(s => ({
      ...s,
      goal_amount: setR.data.settings.goal_amount || '2000',
      goal_title: setR.data.settings.goal_title || 'Donate Goal'
    }))
    setTokens(setR.data.overlayTokens)
  }

  useEffect(() => {
    load()
    socket.connect()
    socket.emit('join-room', { room: 'admin' })
    socket.on('donation-list-updated', load)
    return () => {
      socket.off('donation-list-updated', load)
      socket.disconnect()
    }
  }, [])

  const saveGoal = async () => {
    await axios.put('/api/settings', { settings })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setEditing(false)
    load()
  }

  const overlayUrl = `${window.location.origin}/overlay/goal?token=${tokens.goal || ''}`

  return (
    <div className="animate-in">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white">🎯 Donate Goal</h1>
        <p className="text-white/40 text-sm mt-0.5">เป้าหมายการโดเนท</p>
      </div>

      {/* Goal preview */}
      <div className="card mb-6">
        <div className="text-center mb-4">
          <p className="font-display text-lg text-white/70">{stats.goalTitle}</p>
          <p className="font-display text-4xl font-bold text-brand-400 mt-1">
            ฿{stats.total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-white/30 text-sm mt-1">จาก ฿{stats.goalAmount.toLocaleString()}</p>
        </div>

        {/* Progress bar */}
        <div className="relative h-8 bg-dark-700 rounded-full overflow-hidden border border-white/10">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-1000"
            style={{ width: `${Math.max(2, stats.percent)}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-display font-bold text-white drop-shadow">
              {stats.percent.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="flex justify-between mt-2 text-xs text-white/30">
          <span>฿0</span>
          <span>฿{stats.goalAmount.toLocaleString()}</span>
        </div>
      </div>

      {/* Edit Goal */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-white/40 text-xs uppercase tracking-wider">⚙️ ตั้งค่าเป้าหมาย</p>
          <button className="btn-secondary text-xs" onClick={() => setEditing(!editing)}>
            {editing ? 'ยกเลิก' : 'แก้ไข'}
          </button>
        </div>
        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">ชื่อเป้าหมาย</label>
              <input className="input-field" value={settings.goal_title}
                onChange={e => setSettings(p => ({ ...p, goal_title: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">ยอดเป้าหมาย (บาท)</label>
              <input className="input-field" type="number" min="1" value={settings.goal_amount}
                onChange={e => setSettings(p => ({ ...p, goal_amount: e.target.value }))} />
            </div>
            <button className="btn-primary w-full" onClick={saveGoal}>
              {saved ? '✅ บันทึกแล้ว' : '💾 บันทึก'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-white/30 mb-1">ชื่อเป้าหมาย</p>
              <p className="text-white font-medium">{settings.goal_title}</p>
            </div>
            <div>
              <p className="text-white/30 mb-1">ยอดเป้าหมาย</p>
              <p className="text-brand-400 font-display font-bold">฿{parseFloat(settings.goal_amount).toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>

      {/* Overlay URL */}
      <div className="card">
        <p className="text-white/40 text-xs mb-3 uppercase tracking-wider">🔗 Overlay URL สำหรับ OBS</p>
        <div className="flex gap-2">
          <input readOnly className="input-field flex-1 text-xs text-white/50 font-mono" value={overlayUrl} />
          <button onClick={() => navigator.clipboard.writeText(overlayUrl)} className="btn-secondary text-xs px-3">
            Copy
          </button>
        </div>
        <p className="text-white/30 text-xs mt-2">เพิ่ม URL นี้ในโปรแกรม OBS/Streamlabs เป็น Browser Source</p>
      </div>
    </div>
  )
}
