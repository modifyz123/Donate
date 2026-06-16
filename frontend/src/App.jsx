import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import DonatePage from './pages/DonatePage'
import HistoryPage from './pages/HistoryPage'
import AlertSettings from './pages/AlertSettings'
import TopDonatePage from './pages/TopDonatePage'
import GoalPage from './pages/GoalPage'

const navItems = [
  { to: '/', label: '💝 โดเนท', end: true },
  { to: '/history', label: '📋 รายการ' },
  { to: '/alert', label: '🔔 Alert' },
  { to: '/top', label: '🏆 Top Donate' },
  { to: '/goal', label: '🎯 Goal' },
]

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        {/* Top Nav */}
        <nav className="glass border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 flex items-center gap-1 h-14">
            <span className="font-display font-bold text-brand-400 text-lg mr-4">DonateHub</span>
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-body transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Content */}
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<DonatePage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/alert" element={<AlertSettings />} />
            <Route path="/top" element={<TopDonatePage />} />
            <Route path="/goal" element={<GoalPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
