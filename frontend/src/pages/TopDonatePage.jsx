import { useState, useEffect } from 'react'
import axios from 'axios'
import { io } from 'socket.io-client'

const socket = io('/', { autoConnect: false })
const MEDALS = ['🥇', '🥈', '🥉']
const COLORS = ['text-yellow-400', 'text-gray-300', 'text-amber-600']
const BG = ['bg-yellow-400/10 border-yellow-400/30', 'bg-gray-400/10 border-gray-400/30', 'bg-amber-700/10 border-amber-700/30']

export default function TopDonatePage() {
  const [top, setTop] = useState([])
  const [tokens, setTokens] = useState({})

  const load = async () => {
    const [topR, setR] = await Promise.all([
      axios.get('/api/donations/top'),
      axios.get('/api/settings')
    ])
    setTop(topR.data)
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

  const overlayUrl = `${window.location.origin}/overlay/top?token=${tokens.top || ''}`

  return (
    <div className="animate-in">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white">🏆 Top Donate</h1>
        <p className="text-white/40 text-sm mt-0.5">ผู้โดเนทสูงสุด 3 อันดับแรก</p>
      </div>

      <div className="grid gap-4 mb-8">
        {top.length === 0 ? (
          <div className="card text-center py-16 text-white/30">
            <div className="text-5xl mb-3">🏆</div>
            <p>ยังไม่มีข้อมูล</p>
          </div>
        ) : top.map((d, i) => (
          <div key={d.name} className={`card flex items-center gap-5 border ${BG[i]} animate-in`}
            style={{ animationDelay: `${i * 100}ms` }}>
            <div className="text-5xl">{MEDALS[i]}</div>
            <div className="flex-1">
              <p className={`font-display text-xl font-bold ${COLORS[i]}`}>{d.name}</p>
              <p className="text-white/40 text-sm">อันดับ {i + 1}</p>
            </div>
            <div className="text-right">
              <p className={`font-display text-2xl font-bold ${COLORS[i]}`}>
                ฿{d.total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        ))}
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
