import { useState, useEffect } from 'react'
import axios from 'axios'
import { io } from 'socket.io-client'

const socket = io('/', { autoConnect: false })

export default function HistoryPage() {
  const [donations, setDonations] = useState([])
  const [alerting, setAlerting] = useState(null)

  const load = async () => {
    const r = await axios.get('/api/donations')
    setDonations(r.data)
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

  const reAlert = async (id) => {
    setAlerting(id)
    await axios.post(`/api/donations/${id}/alert`)
    setTimeout(() => setAlerting(null), 2000)
  }

  const fmt = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleString('th-TH', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const total = donations.reduce((s, d) => s + d.amount, 0)

  return (
    <div className="animate-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">📋 รายการโดเนท</h1>
          <p className="text-white/40 text-sm mt-0.5">{donations.length} รายการ</p>
        </div>
        <div className="card text-center px-5 py-3">
          <p className="text-white/40 text-xs mb-0.5">ยอดรวม</p>
          <p className="font-display text-xl font-bold text-brand-400">
            ฿{total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        {donations.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            <div className="text-5xl mb-3">📭</div>
            <p>ยังไม่มีรายการโดเนท</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  {['วันที่', 'ชื่อ', 'จำนวนเงิน', 'ช่องทาง', 'ข้อความ', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-white/50 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {donations.map((d, i) => (
                  <tr
                    key={d.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <td className="px-4 py-3 text-white/40 text-xs whitespace-nowrap">{fmt(d.created_at)}</td>
                    <td className="px-4 py-3 font-medium text-white">{d.name}</td>
                    <td className="px-4 py-3 font-display font-semibold text-brand-400">
                      ฿{d.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        d.channel === 'TrueWallet'
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-purple-500/20 text-purple-300'
                      }`}>
                        {d.channel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/60 max-w-xs truncate">{d.message}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => reAlert(d.id)}
                        disabled={alerting === d.id}
                        className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all disabled:opacity-50"
                      >
                        {alerting === d.id ? '✅' : 'Alert ซ้ำ'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
