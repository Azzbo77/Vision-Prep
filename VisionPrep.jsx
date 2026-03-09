import { useState } from "react";

const COLORS = {
  bg: "#0D0F14",
  surface: "#14171F",
  surfaceHigh: "#1C2130",
  border: "#252C3E",
  accent: "#4F7FFF",
  accentGlow: "rgba(79,127,255,0.15)",
  accentDim: "#2A4499",
  success: "#2ECC8A",
  warning: "#F5A623",
  danger: "#FF4D6A",
  text: "#E8EBF4",
  textMuted: "#7A839E",
  textDim: "#4A5168",
};

const mockBuilds = [
  { id: 1, title: "Custom Mechanical Keyboard — TKL Edition", customer: "Alex R.", steps: 18, done: 11, status: "active", section: "Switch Installation" },
  { id: 2, title: "Electronics Enclosure Kit v2", customer: "Studio Works", steps: 24, done: 24, status: "completed", section: "Final QC" },
  { id: 3, title: "Modular Shelf Unit — Oak Finish", customer: "Interior Co.", steps: 12, done: 4, status: "paused", section: "Frame Assembly" },
];

const mockSteps = [
  { id: 1, section: "Preparation", title: "Gather all components", done: true, parts: ["PCB Board", "Switch plate", "Stabilizers x4"], time: "2 min" },
  { id: 2, section: "Preparation", title: "Lubricate stabilizers", done: true, parts: ["Stabilizer lube", "Small brush"], time: "10 min" },
  { id: 3, section: "Switch Installation", title: "Snap in north-facing switches", done: true, parts: ["Switches x87", "Switch puller"], time: "15 min" },
  { id: 4, section: "Switch Installation", title: "Solder switch pins to PCB", done: false, parts: ["Soldering iron", "Solder wire", "Flux"], time: "45 min", active: true },
  { id: 5, section: "Switch Installation", title: "Test all switch connections", done: false, parts: ["VIA software", "USB-C cable"], time: "10 min" },
  { id: 6, section: "Final Assembly", title: "Install sound dampening foam", done: false, parts: ["PE foam", "Scissors"], time: "5 min" },
];

const mockIssues = [
  { id: 1, step: "Solder switch pins", type: "MISSING_PART", desc: "Ran out of rosin-core solder", status: "OPEN", user: "Jay M.", time: "12m ago" },
  { id: 2, step: "Lubricate stabilizers", type: "UNCLEAR_INSTRUCTIONS", desc: "Which lube ratio? Krytox 205g0?", status: "ACKNOWLEDGED", user: "Sam K.", time: "1h ago" },
];

const dashData = [
  { label: "Active Builds", value: 8, icon: "⚡", color: COLORS.accent },
  { label: "Steps Today", value: 47, icon: "✓", color: COLORS.success },
  { label: "Open Issues", value: 3, icon: "!", color: COLORS.warning },
  { label: "Completed", value: 12, icon: "★", color: "#A78BFA" },
];

function NavBar({ view, setView }) {
  const tabs = ["Dashboard", "Builds", "Library", "Builder View"];
  return (
    <div style={{ background: COLORS.surface, borderBottom: `1px solid ${COLORS.border}`, padding: "0 32px", display: "flex", alignItems: "center", gap: 32, height: 56 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 16 }}>
        <div style={{ width: 28, height: 28, background: COLORS.accent, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>👁</div>
        <span style={{ color: COLORS.text, fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: 15, letterSpacing: 1 }}>VISION PREP</span>
      </div>
      {tabs.map(t => (
        <button key={t} onClick={() => setView(t)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 0", fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: view === t ? COLORS.accent : COLORS.textMuted, borderBottom: view === t ? `2px solid ${COLORS.accent}` : "2px solid transparent", transition: "all 0.15s" }}>
          {t}
        </button>
      ))}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.success, boxShadow: `0 0 6px ${COLORS.success}` }} />
        <span style={{ color: COLORS.textMuted, fontSize: 12, fontFamily: "'DM Mono', monospace" }}>v0.1.0-alpha</span>
      </div>
    </div>
  );
}

function Dashboard() {
  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: COLORS.text, fontFamily: "'DM Sans', sans-serif", fontSize: 22, fontWeight: 700, margin: 0 }}>Live Dashboard</h1>
        <p style={{ color: COLORS.textMuted, fontSize: 13, margin: "4px 0 0", fontFamily: "'DM Sans', sans-serif" }}>Real-time overview — Monday, March 9</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {dashData.map(d => (
          <div key={d.label} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "20px 24px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -10, right: -10, fontSize: 52, opacity: 0.06 }}>{d.icon}</div>
            <div style={{ fontSize: 28, fontFamily: "'DM Mono', monospace", fontWeight: 700, color: d.color }}>{d.value}</div>
            <div style={{ fontSize: 12, color: COLORS.textMuted, fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>{d.label}</div>
          </div>
        ))}
      </div>

      {/* Builds progress */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20 }}>
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 24 }}>
          <h3 style={{ color: COLORS.text, fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, margin: "0 0 20px" }}>Active Builds Progress</h3>
          {mockBuilds.map(b => {
            const pct = Math.round((b.done / b.steps) * 100);
            return (
              <div key={b.id} style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div>
                    <span style={{ color: COLORS.text, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>{b.title}</span>
                    <span style={{ color: COLORS.textDim, fontSize: 11, marginLeft: 8, fontFamily: "'DM Mono', monospace" }}>{b.customer}</span>
                  </div>
                  <span style={{ color: COLORS.textMuted, fontSize: 12, fontFamily: "'DM Mono', monospace" }}>{b.done}/{b.steps}</span>
                </div>
                <div style={{ height: 5, background: COLORS.surfaceHigh, borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: b.status === "completed" ? COLORS.success : b.status === "paused" ? COLORS.warning : COLORS.accent, borderRadius: 99, transition: "width 0.5s" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: COLORS.textDim, fontFamily: "'DM Sans', sans-serif" }}>{b.section}</span>
                  <span style={{ fontSize: 11, color: b.status === "completed" ? COLORS.success : b.status === "paused" ? COLORS.warning : COLORS.textMuted, fontFamily: "'DM Mono', monospace" }}>{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Issues panel */}
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 24 }}>
          <h3 style={{ color: COLORS.text, fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, margin: "0 0 20px" }}>Open Issues</h3>
          {mockIssues.map(i => (
            <div key={i.id} style={{ background: COLORS.surfaceHigh, borderRadius: 8, padding: "12px 14px", marginBottom: 10, borderLeft: `3px solid ${i.status === "OPEN" ? COLORS.danger : COLORS.warning}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: i.status === "OPEN" ? COLORS.danger : COLORS.warning, fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>{i.type.replace("_", " ")}</span>
                <span style={{ fontSize: 11, color: COLORS.textDim, fontFamily: "'DM Mono', monospace" }}>{i.time}</span>
              </div>
              <div style={{ fontSize: 12, color: COLORS.text, fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>{i.desc}</div>
              <div style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: "'DM Sans', sans-serif" }}>Step: {i.step} · {i.user}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Builds({ setView, setActiveBuild }) {
  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ color: COLORS.text, fontFamily: "'DM Sans', sans-serif", fontSize: 22, fontWeight: 700, margin: 0 }}>Builds</h1>
          <p style={{ color: COLORS.textMuted, fontSize: 13, margin: "4px 0 0", fontFamily: "'DM Sans', sans-serif" }}>All jobs and assembly runs</p>
        </div>
        <button style={{ background: COLORS.accent, border: "none", borderRadius: 8, padding: "9px 18px", color: "#fff", fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, cursor: "pointer" }}>
          + New Build
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {mockBuilds.map(b => {
          const pct = Math.round((b.done / b.steps) * 100);
          const statusColor = { active: COLORS.accent, completed: COLORS.success, paused: COLORS.warning }[b.status];
          return (
            <div key={b.id} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "20px 24px", display: "flex", alignItems: "center", gap: 24, cursor: "pointer", transition: "border-color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = COLORS.accent}
              onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.border}
              onClick={() => { setActiveBuild(b); setView("Builder View"); }}>
              <div style={{ width: 44, height: 44, background: COLORS.surfaceHigh, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🔧</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: COLORS.text, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{b.title}</div>
                <div style={{ color: COLORS.textMuted, fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>{b.customer} · {b.section}</div>
              </div>
              <div style={{ width: 120 }}>
                <div style={{ height: 4, background: COLORS.surfaceHigh, borderRadius: 99, overflow: "hidden", marginBottom: 4 }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: statusColor, borderRadius: 99 }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: COLORS.textDim, fontFamily: "'DM Mono', monospace" }}>{b.done}/{b.steps} steps</span>
                  <span style={{ fontSize: 11, color: statusColor, fontFamily: "'DM Mono', monospace" }}>{pct}%</span>
                </div>
              </div>
              <div style={{ background: `${statusColor}22`, color: statusColor, borderRadius: 6, padding: "3px 10px", fontSize: 11, fontFamily: "'DM Mono', monospace", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, flexShrink: 0 }}>
                {b.status}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Library() {
  const folders = ["Keyboard Builds", "Electronics Enclosures", "Furniture Kits", "Shared / Common Steps"];
  const [open, setOpen] = useState("Keyboard Builds");
  const steps = [
    { title: "Gather components checklist", uses: 6, images: 2 },
    { title: "Lubricate stabilizers", uses: 4, images: 4 },
    { title: "Solder switches to PCB", uses: 7, images: 6 },
    { title: "Flash firmware (QMK)", uses: 5, images: 3 },
  ];

  return (
    <div style={{ padding: 32, display: "flex", gap: 20 }}>
      {/* Folder tree */}
      <div style={{ width: 220, flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ color: COLORS.textMuted, fontSize: 11, fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: 1 }}>Library</span>
          <button style={{ background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 5, padding: "2px 8px", color: COLORS.textMuted, fontSize: 12, cursor: "pointer" }}>+</button>
        </div>
        {folders.map(f => (
          <div key={f} onClick={() => setOpen(f)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 7, cursor: "pointer", background: open === f ? COLORS.accentGlow : "transparent", color: open === f ? COLORS.accent : COLORS.textMuted, fontSize: 13, fontFamily: "'DM Sans', sans-serif", marginBottom: 2, transition: "all 0.12s" }}>
            <span>{open === f ? "📂" : "📁"}</span>
            {f}
          </div>
        ))}
      </div>

      {/* Steps list */}
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ color: COLORS.text, fontFamily: "'DM Sans', sans-serif", fontSize: 18, fontWeight: 700, margin: 0 }}>{open}</h2>
          <button style={{ background: COLORS.accent, border: "none", borderRadius: 7, padding: "8px 16px", color: "#fff", fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, cursor: "pointer" }}>+ New Step</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 40, height: 40, background: COLORS.surfaceHigh, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>📋</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: COLORS.text, fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500 }}>{s.title}</div>
                <div style={{ color: COLORS.textDim, fontSize: 12, fontFamily: "'DM Mono', monospace", marginTop: 3 }}>
                  Used in {s.uses} builds · {s.images} images
                </div>
              </div>
              <button style={{ background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "5px 12px", color: COLORS.textMuted, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Edit</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BuilderView({ build }) {
  const [activeStep, setActiveStep] = useState(3);
  const [reported, setReported] = useState(false);
  const sections = [...new Set(mockSteps.map(s => s.section))];
  const step = mockSteps[activeStep];

  return (
    <div style={{ display: "flex", height: "calc(100vh - 56px)" }}>
      {/* Sidebar: step list */}
      <div style={{ width: 260, borderRight: `1px solid ${COLORS.border}`, overflowY: "auto", background: COLORS.surface }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${COLORS.border}` }}>
          <div style={{ color: COLORS.text, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600 }}>{build?.title || mockBuilds[0].title}</div>
          <div style={{ color: COLORS.textMuted, fontSize: 11, fontFamily: "'DM Mono', monospace", marginTop: 3 }}>11/18 steps complete</div>
          <div style={{ height: 3, background: COLORS.surfaceHigh, borderRadius: 99, marginTop: 8, overflow: "hidden" }}>
            <div style={{ height: "100%", width: "61%", background: COLORS.accent, borderRadius: 99 }} />
          </div>
        </div>
        {sections.map(sec => (
          <div key={sec}>
            <div style={{ padding: "10px 20px 4px", fontSize: 10, color: COLORS.textDim, fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: 1 }}>{sec}</div>
            {mockSteps.filter(s => s.section === sec).map((s, i) => {
              const idx = mockSteps.indexOf(s);
              return (
                <div key={s.id} onClick={() => setActiveStep(idx)} style={{ padding: "10px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, background: activeStep === idx ? COLORS.accentGlow : "transparent", borderLeft: activeStep === idx ? `2px solid ${COLORS.accent}` : "2px solid transparent" }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, background: s.done ? COLORS.success : activeStep === idx ? COLORS.accent : COLORS.surfaceHigh, color: "#fff", fontFamily: "'DM Mono', monospace" }}>
                    {s.done ? "✓" : idx + 1}
                  </div>
                  <span style={{ fontSize: 12, color: activeStep === idx ? COLORS.text : s.done ? COLORS.textMuted : COLORS.textMuted, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.3 }}>{s.title}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflowY: "auto", padding: 32 }}>
        <div style={{ maxWidth: 680 }}>
          <div style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: "'DM Mono', monospace", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
            Step {activeStep + 1} · {step.section}
          </div>
          <h2 style={{ color: COLORS.text, fontFamily: "'DM Sans', sans-serif", fontSize: 24, fontWeight: 700, margin: "0 0 20px" }}>{step.title}</h2>

          {/* Image placeholder with annotation hint */}
          <div style={{ background: COLORS.surfaceHigh, borderRadius: 12, height: 280, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: 24, border: `1px solid ${COLORS.border}`, position: "relative" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🖼️</div>
            <div style={{ color: COLORS.textMuted, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>Step photo with annotations</div>
            <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 6 }}>
              {["→ Arrow", "◯ Circle", "□ Box"].map(a => (
                <div key={a} style={{ background: `${COLORS.accent}33`, border: `1px solid ${COLORS.accent}66`, borderRadius: 5, padding: "3px 8px", fontSize: 10, color: COLORS.accent, fontFamily: "'DM Mono', monospace" }}>{a}</div>
              ))}
            </div>
          </div>

          {/* Parts required */}
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "16px 20px", marginBottom: 20 }}>
            <div style={{ color: COLORS.textMuted, fontSize: 11, fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Required Parts & Tools</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {step.parts.map(p => (
                <div key={p} style={{ background: COLORS.surfaceHigh, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "5px 12px", fontSize: 12, color: COLORS.text, fontFamily: "'DM Sans', sans-serif" }}>🔩 {p}</div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{ flex: 1, background: step.done ? COLORS.surfaceHigh : COLORS.accent, border: "none", borderRadius: 10, padding: "14px", color: step.done ? COLORS.textMuted : "#fff", fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, cursor: "pointer" }}>
              {step.done ? "✓ Completed" : "Mark as Complete"}
            </button>
            <button onClick={() => setReported(!reported)} style={{ background: reported ? `${COLORS.warning}22` : COLORS.surface, border: `1px solid ${reported ? COLORS.warning : COLORS.border}`, borderRadius: 10, padding: "14px 20px", color: reported ? COLORS.warning : COLORS.textMuted, fontSize: 13, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
              {reported ? "⚠ Issue Flagged" : "Flag Issue"}
            </button>
          </div>

          {reported && (
            <div style={{ marginTop: 14, background: `${COLORS.warning}11`, border: `1px solid ${COLORS.warning}44`, borderRadius: 10, padding: "16px 20px" }}>
              <div style={{ color: COLORS.warning, fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, marginBottom: 10 }}>Report an Issue</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                {["Wrong Part", "Missing Part", "Unclear Instructions", "Damaged Component", "Other"].map(t => (
                  <div key={t} style={{ background: COLORS.surfaceHigh, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "4px 10px", fontSize: 12, color: COLORS.textMuted, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>{t}</div>
                ))}
              </div>
              <textarea placeholder="Describe the issue..." style={{ width: "100%", background: COLORS.surfaceHigh, border: `1px solid ${COLORS.border}`, borderRadius: 7, padding: "10px 12px", color: COLORS.text, fontSize: 13, fontFamily: "'DM Sans', sans-serif", resize: "vertical", minHeight: 70, boxSizing: "border-box", outline: "none" }} />
              <button style={{ marginTop: 10, background: COLORS.warning, border: "none", borderRadius: 7, padding: "9px 20px", color: "#000", fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, cursor: "pointer" }}>Submit Report</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VisionPrep() {
  const [view, setView] = useState("Dashboard");
  const [activeBuild, setActiveBuild] = useState(null);

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; } 
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #252C3E; border-radius: 99px; }
        textarea::placeholder { color: #4A5168; }
      `}</style>
      <NavBar view={view} setView={setView} />
      {view === "Dashboard" && <Dashboard />}
      {view === "Builds" && <Builds setView={setView} setActiveBuild={setActiveBuild} />}
      {view === "Library" && <Library />}
      {view === "Builder View" && <BuilderView build={activeBuild} />}
    </div>
  );
}
