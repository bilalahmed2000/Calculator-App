import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/CalcBase.css";

/* ── helpers ── */
const MONTHS = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];
const thisYear = new Date().getFullYear();
const YEARS = Array.from({ length: 3 }, (_, i) => thisYear - 1 + i);
const daysInMonth = (m, y) => new Date(y, m, 0).getDate();
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + Math.round(n)); return x; };
const fmtDate = (d) => d instanceof Date && isFinite(d)
  ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
const fmtFull = (d) => d instanceof Date && isFinite(d)
  ? d.toLocaleDateString("en-US", { weekday:"short", month: "long", day: "numeric", year: "numeric" }) : "—";
const pickerToDate = ({ month, day, year }) => new Date(year, month - 1, day);
const defaultPicker = () => { const t = new Date(); return { month: t.getMonth()+1, day: t.getDate(), year: t.getFullYear() }; };
const CYCLE_OPTIONS = Array.from({ length: 26 }, (_, i) => i + 20);
const PERIOD_OPTIONS = Array.from({ length: 8 }, (_, i) => i + 2);

const LS = {
  label: { display:"block", fontSize:11, fontWeight:700, color:"#6b7a9e", marginBottom:6, letterSpacing:"0.4px", textTransform:"uppercase" },
  sel: { flex:1, minWidth:100, padding:"9px 10px", fontSize:14, fontWeight:600, color:"#1e1b4b", background:"#f8f9ff", border:"1.5px solid rgba(99,102,241,0.22)", borderRadius:10, outline:"none", cursor:"pointer" },
  row: { display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" },
  divider: { height:1, background:"rgba(99,102,241,0.1)", margin:"18px 0" },
  errBox: { background:"#fef2f2", border:"1px solid #fca5a5", color:"#dc2626", borderRadius:10, padding:"10px 14px", marginBottom:14, fontSize:13.5 },
};

function DatePicker({ label, value, onChange }) {
  const maxDay = daysInMonth(value.month, value.year);
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);
  const update = (key, val) => {
    const next = { ...value, [key]: Number(val) };
    if (next.day > daysInMonth(next.month, next.year)) next.day = daysInMonth(next.month, next.year);
    onChange(next);
  };
  return (
    <div style={{ marginBottom:16 }}>
      {label && <label style={LS.label}>{label}</label>}
      <div style={LS.row}>
        <select style={LS.sel} value={value.month} onChange={e => update("month", e.target.value)}>
          {MONTHS.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
        </select>
        <select style={{ ...LS.sel, maxWidth:72 }} value={value.day} onChange={e => update("day", e.target.value)}>
          {days.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select style={{ ...LS.sel, maxWidth:90 }} value={value.year} onChange={e => update("year", e.target.value)}>
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
    </div>
  );
}

export default function OvulationCalculator() {
  const [lmpDate, setLmpDate] = useState(defaultPicker());
  const [cycleLen, setCycleLen] = useState(28);
  const [periodLen, setPeriodLen] = useState(5);
  const [cycles, setCycles] = useState(6); // how many future cycles to show
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const calculate = () => {
    setError("");
    const lmp = pickerToDate(lmpDate);
    if (!isFinite(lmp)) { setError("Please enter a valid date."); return; }

    // Ovulation typically occurs (cycleLen - 14) days after LMP
    const ovulationOffset = cycleLen - 14;

    const upcoming = Array.from({ length: cycles }, (_, i) => {
      const cycleLmp       = addDays(lmp, i * cycleLen);
      const ovulation      = addDays(cycleLmp, ovulationOffset);
      const fertileStart   = addDays(ovulation, -5);
      const fertileEnd     = addDays(ovulation, 1);
      const nextPeriod     = addDays(cycleLmp, cycleLen);
      const periodEnd      = addDays(cycleLmp, periodLen);
      return { cycleLmp, ovulation, fertileStart, fertileEnd, nextPeriod, periodEnd, idx: i };
    });

    setResult({ upcoming, ovulationOffset });
  };

  const clear = () => { setResult(null); setError(""); setLmpDate(defaultPicker()); setCycleLen(28); setPeriodLen(5); setCycles(6); };

  const today = new Date();

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Ovulation Calculator</h1>
        <p className="muted">
          Predict your ovulation date and fertile window based on your last menstrual period
          and average cycle length. See your most fertile days for the next several cycles.
        </p>
      </header>

      <div style={{ maxWidth:780, margin:"0 auto", display:"flex", flexDirection:"column", gap:20 }}>
        <section className="card">
          <DatePicker label="First Day of Last Menstrual Period:" value={lmpDate} onChange={setLmpDate} />
          <div style={LS.divider} />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginBottom:16 }}>
            <div>
              <label style={LS.label}>Cycle Length (days)</label>
              <select style={{ ...LS.sel, width:"100%" }} value={cycleLen}
                onChange={e => setCycleLen(Number(e.target.value))}>
                {CYCLE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label style={LS.label}>Period Length (days)</label>
              <select style={{ ...LS.sel, width:"100%" }} value={periodLen}
                onChange={e => setPeriodLen(Number(e.target.value))}>
                {PERIOD_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label style={LS.label}>Cycles to Show</label>
              <select style={{ ...LS.sel, width:"100%" }} value={cycles}
                onChange={e => setCycles(Number(e.target.value))}>
                {[3,4,5,6,8,10,12].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          {error && <div style={LS.errBox}>{error}</div>}

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <button onClick={calculate}
              style={{ padding:"12px", borderRadius:12, border:"none", cursor:"pointer", fontWeight:700, fontSize:14, background:"linear-gradient(135deg,#4f46e5,#7c3aed)", color:"#fff", boxShadow:"0 4px 14px rgba(79,70,229,0.3)" }}>
              Calculate
            </button>
            <button onClick={clear}
              style={{ padding:"12px", borderRadius:12, border:"1.5px solid rgba(99,102,241,0.22)", cursor:"pointer", fontWeight:700, fontSize:14, background:"#fff", color:"#6b7a9e" }}>
              Clear
            </button>
          </div>
        </section>

        {result && (
          <section className="card">
            <h2 className="card-title">Your Ovulation & Fertile Windows</h2>

            {/* Legend */}
            <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginBottom:18, fontSize:12 }}>
              {[
                { color:"#bbf7d0", label:"Period" },
                { color:"#bfdbfe", label:"Fertile Window" },
                { color:"#4f46e5", label:"Ovulation Day" },
              ].map(({ color, label }) => (
                <div key={label} style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ width:14, height:14, borderRadius:4, background:color, border:"1px solid rgba(0,0,0,0.1)" }} />
                  <span style={{ color:"#6b7a9e", fontWeight:600 }}>{label}</span>
                </div>
              ))}
            </div>

            {result.upcoming.map((cyc, i) => {
              const isCurrent = cyc.cycleLmp <= today && today < cyc.nextPeriod;
              return (
                <div key={i} style={{
                  marginBottom:12, borderRadius:14, overflow:"hidden",
                  border: isCurrent ? "2px solid #4f46e5" : "1px solid rgba(99,102,241,0.15)",
                  boxShadow: isCurrent ? "0 0 0 3px rgba(99,102,241,0.1)" : "none",
                }}>
                  <div style={{ background: isCurrent ? "#4f46e5" : "#f5f3ff", padding:"10px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontWeight:800, fontSize:14, color: isCurrent ? "#fff" : "#312e81" }}>
                      Cycle {i + 1} {isCurrent ? "(Current)" : ""}
                    </span>
                    <span style={{ fontSize:12, color: isCurrent ? "rgba(255,255,255,0.8)" : "#6b7a9e", fontWeight:600 }}>
                      {fmtDate(cyc.cycleLmp)} – {fmtDate(cyc.nextPeriod)}
                    </span>
                  </div>
                  <div style={{ padding:"12px 16px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, background:"#fff" }}>
                    <div style={{ padding:"8px 12px", background:"#bbf7d0", borderRadius:8 }}>
                      <div style={{ fontSize:10, fontWeight:700, color:"#065f46", textTransform:"uppercase", letterSpacing:"0.4px" }}>Period</div>
                      <div style={{ fontSize:13, fontWeight:700, color:"#065f46" }}>{fmtDate(cyc.cycleLmp)} – {fmtDate(cyc.periodEnd)}</div>
                    </div>
                    <div style={{ padding:"8px 12px", background:"#bfdbfe", borderRadius:8 }}>
                      <div style={{ fontSize:10, fontWeight:700, color:"#1e40af", textTransform:"uppercase", letterSpacing:"0.4px" }}>Fertile Window</div>
                      <div style={{ fontSize:13, fontWeight:700, color:"#1e40af" }}>{fmtDate(cyc.fertileStart)} – {fmtDate(cyc.fertileEnd)}</div>
                    </div>
                    <div style={{ padding:"8px 12px", background:"#e0e7ff", borderRadius:8, gridColumn:"1 / -1" }}>
                      <div style={{ fontSize:10, fontWeight:700, color:"#3730a3", textTransform:"uppercase", letterSpacing:"0.4px" }}>Ovulation Day (Peak Fertility)</div>
                      <div style={{ fontSize:15, fontWeight:900, color:"#4f46e5" }}>{fmtFull(cyc.ovulation)}</div>
                    </div>
                  </div>
                </div>
              );
            })}

            <p style={{ fontSize:12, color:"#9ca3af", marginTop:8, lineHeight:1.65 }}>
              Ovulation is estimated {result.ovulationOffset} days after the start of your period
              (cycle length − 14). The fertile window covers the 5 days before ovulation and
              ovulation day itself. These are estimates — actual ovulation can vary.
            </p>
          </section>
        )}

        <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
          <span style={{ fontSize:13, fontWeight:700, color:"#6b7a9e" }}>Related:</span>
          {[
            { label:"Period Calculator",              to:"/period" },
            { label:"Conception Calculator",          to:"/conception" },
            { label:"Due Date Calculator",            to:"/due-date" },
          ].map(({ label, to }) => (
            <Link key={to} to={to}
              style={{ padding:"7px 16px", borderRadius:999, border:"1.5px solid rgba(99,102,241,0.28)", fontSize:13, fontWeight:600, color:"#4f46e5", textDecoration:"none", background:"#f5f3ff" }}>
              {label}
            </Link>
          ))}
        </div>

        <section className="card" style={{ lineHeight:1.75, color:"#374151", fontSize:14 }}>
          <h2 className="card-title">Understanding Ovulation</h2>
          <p>
            Ovulation is the release of an egg from the ovary. It typically occurs <strong>14 days before the
            end of your menstrual cycle</strong>. For a 28-day cycle, this is around day 14. For a 30-day
            cycle, ovulation would fall around day 16.
          </p>
          <h3 style={{ fontSize:15, fontWeight:700, color:"#312e81", margin:"16px 0 8px" }}>Fertile Window</h3>
          <p>
            An egg can only be fertilized for 12–24 hours after ovulation. However, sperm can survive
            in the reproductive tract for up to 5 days, creating a fertile window of about <strong>6 days</strong>:
            the 5 days before ovulation and ovulation day itself.
          </p>
          <p style={{ marginTop:12, padding:"12px 16px", background:"#f0eeff", borderRadius:10, fontSize:13, color:"#4b5280" }}>
            <strong>Tip:</strong> For the best chance of conception, aim to have intercourse every 1–2 days
            during the fertile window, particularly in the 2–3 days leading up to ovulation.
          </p>
        </section>
      </div>
    </div>
  );
}
