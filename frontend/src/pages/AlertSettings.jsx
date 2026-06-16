import { useState, useEffect } from "react";
import axios from "axios";

const FONTS = [
  "Pridi",
  "Chakra Petch",
  "IBM Plex Sans Thai",
  "Kanit",
  "Sarabun",
  "Mitr",
];
const ANIMATIONS_IN = [
  "fadeIn",
  "bounceIn",
  "zoomIn",
  "slideInDown",
  "slideInLeft",
  "rotateIn",
];
const ANIMATIONS_OUT = [
  "fadeOut",
  "bounceOut",
  "zoomOut",
  "slideOutUp",
  "slideOutRight",
  "rotateOut",
];
const BASE =
  import.meta.env.VITE_API_URL ||
  window.location.origin.replace("5173", "3001");

export default function AlertSettings() {
  const [settings, setSettings] = useState({});
  const [tokens, setTokens] = useState({});
  const [saved, setSaved] = useState(false);
  const [resetting, setResetting] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const r = await axios.get("/api/settings");
    setSettings(r.data.settings);
    setTokens(r.data.overlayTokens);
  };

  const set = (k, v) => setSettings((p) => ({ ...p, [k]: v }));

  const save = async () => {
    await axios.put("/api/settings", { settings });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const testAlert = () => axios.post("/api/settings/test-alert");

  const resetToken = async (type) => {
    setResetting(type);
    const r = await axios.post(`/api/settings/reset-token/${type}`);
    setTokens((p) => ({ ...p, [type]: r.data.token }));
    setResetting(null);
  };

  const overlayUrl = (type) =>
    `${window.location.origin}/overlay/${type}?token=${tokens[type] || ""}`;

  const copy = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="animate-in space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-white">
          🔔 Alert Settings
        </h1>
        <div className="flex gap-3">
          <button className="btn-secondary" onClick={testAlert}>
            🧪 ทดสอบ Alert
          </button>
          <button className="btn-primary" onClick={save}>
            {saved ? "✅ บันทึกแล้ว" : "💾 บันทึก"}
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="card">
        <p className="text-white/40 text-xs mb-3 uppercase tracking-wider">
          Preview
        </p>
        <div
          className="rounded-xl p-8 text-center"
          style={{
            background: "#1a1a1a",
            minHeight: "120px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p
            style={{
              fontFamily: settings.alert_font || "Pridi",
              fontSize: `${settings.alert_font_size || 48}px`,
              color: settings.alert_text_color || "#cc0000",
              fontWeight: "bold",
              lineHeight: 1.2,
            }}
          >
            Test{" "}
            <span
              style={{ color: settings.alert_highlight_color || "#f5a623" }}
            >
              {settings.alert_message || "ให้ค่าขนม"}
            </span>{" "}
            ฿5,000
          </p>
          <p
            style={{
              color: settings.alert_message_color || "#cc44cc",
              fontFamily: settings.alert_font || "Pridi",
              fontSize: "16px",
              marginTop: "8px",
            }}
          >
            ตัวอย่าง Donate Alert
          </p>
        </div>
      </div>

      {/* Colors */}
      <div className="card">
        <p className="text-white/40 text-xs mb-4 uppercase tracking-wider">
          สี
        </p>
        <div className="grid grid-cols-3 gap-5">
          {[
            { key: "alert_highlight_color", label: "สี Highlight" },
            { key: "alert_text_color", label: "สีตัวอักษร" },
            { key: "alert_message_color", label: "สีข้อความ" },
          ].map((c) => (
            <div key={c.key}>
              <label className="block text-sm text-white/60 mb-2">
                {c.label}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings[c.key] || "#ffffff"}
                  onChange={(e) => set(c.key, e.target.value)}
                  className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent"
                />
                <span className="text-white/40 text-sm font-mono">
                  {settings[c.key]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message & Duration */}
      <div className="card grid grid-cols-2 gap-5">
        <div>
          <label className="block text-sm text-white/60 mb-2">
            ข้อความโดเนท
          </label>
          <input
            className="input-field"
            value={settings.alert_message || ""}
            onChange={(e) => set("alert_message", e.target.value)}
            placeholder="ให้ค่าขนม"
          />
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-2">
            แสดงเป็นเวลา (วินาที): {settings.alert_duration}s
          </label>
          <input
            type="range"
            min="1"
            max="60"
            value={settings.alert_duration || 10}
            onChange={(e) => set("alert_duration", e.target.value)}
            className="w-full accent-yellow-400"
          />
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-2">
            ขนาดฟอนต์: {settings.alert_font_size}px
          </label>
          <input
            type="range"
            min="20"
            max="100"
            value={settings.alert_font_size || 48}
            onChange={(e) => set("alert_font_size", e.target.value)}
            className="w-full accent-yellow-400"
          />
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-2">ฟอนต์</label>
          <select
            className="input-field"
            value={settings.alert_font || "Pridi"}
            onChange={(e) => set("alert_font", e.target.value)}
          >
            {FONTS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Animation */}
      <div className="card grid grid-cols-2 gap-5">
        <div>
          <label className="block text-sm text-white/60 mb-2">
            Animation เข้า
          </label>
          <select
            className="input-field"
            value={settings.alert_animation_in || "fadeIn"}
            onChange={(e) => set("alert_animation_in", e.target.value)}
          >
            {ANIMATIONS_IN.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-2">
            Animation ออก
          </label>
          <select
            className="input-field"
            value={settings.alert_animation_out || "bounceOut"}
            onChange={(e) => set("alert_animation_out", e.target.value)}
          >
            {ANIMATIONS_OUT.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      {/* TTS */}
      <div className="card">
        <p className="text-white/40 text-xs mb-4 uppercase tracking-wider">
          เสียงอ่านข้อความ (TTS)
        </p>
        <div className="flex items-center gap-4 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 accent-yellow-400"
              checked={settings.alert_tts_enabled === "true"}
              onChange={(e) =>
                set("alert_tts_enabled", String(e.target.checked))
              }
            />
            <span className="text-white/70">เปิดเสียงอ่านข้อความ</span>
          </label>
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-2">
            ความเร็วการอ่าน: {settings.alert_tts_rate}x
          </label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={settings.alert_tts_rate || 1}
            onChange={(e) => set("alert_tts_rate", e.target.value)}
            className="w-full accent-yellow-400"
          />
        </div>
      </div>

      {/* Overlay URLs */}
      <div className="card space-y-5">
        <p className="text-white/40 text-xs uppercase tracking-wider">
          🔗 Overlay URLs (สำหรับ OBS/Streamlabs)
        </p>
        {[
          { type: "alert", label: "🔔 Alert Overlay" },
          { type: "top", label: "🏆 Top Donate Overlay" },
          { type: "goal", label: "🎯 Goal Overlay" },
        ].map(({ type, label }) => (
          <div key={type}>
            <p className="text-sm text-white/60 mb-2">{label}</p>
            <div className="flex gap-2">
              <input
                readOnly
                className="input-field flex-1 text-xs text-white/50 font-mono"
                value={overlayUrl(type)}
              />
              <button
                onClick={() => copy(overlayUrl(type))}
                className="btn-secondary text-xs px-3"
              >
                Copy
              </button>
              <button
                onClick={() => resetToken(type)}
                disabled={resetting === type}
                className="btn-secondary text-xs px-3 text-red-400 hover:text-red-300"
              >
                {resetting === type ? "..." : "Reset"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
