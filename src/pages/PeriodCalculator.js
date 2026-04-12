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
  ? d.toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric", year:"numeric" }) : "—";
const fmtShort = (d) => d instanceof Date && isFinite(d)
  ? d.toLocaleDateString("en-US", { month:"short", day:"numeric" }) : "—";
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

// Month name for a Date
const monthName = (d) => MONTHS[d.getMonth()];
const monthYear = (d) => `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

// Group an array of period ranges by month
function groupByMonth(periods) {
  const map = new Map();
  periods.forEach(p => {
    const key = monthYear(p.start);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(p);
  });
  return map;
}

export default function PeriodCalculator() {
  const [lmpDate, setLmpDate] = useState(defaultPicker());
  const [cycleLen, setCycleLen] = useState(28);
  const [periodLen, setPeriodLen] = useState(5);
  const [numPeriods, setNumPeriods] = useState(12);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const calculate = () => {
    setError("");
    const lmp = pickerToDate(lmpDate);
    if (!isFinite(lmp)) { setError("Please enter a valid date."); return; }

    const periods = Array.from({ length: numPeriods }, (_, i) => {
      const start = addDays(lmp, i * cycleLen);
      const end   = addDays(start, periodLen - 1);
      const ovulation = addDays(start, cycleLen - 14);
      const fertileStart = addDays(ovulation, -5);
      return { start, end, ovulation, fertileStart, idx: i };
    });

    setResult(periods);
  };

  const clear = () => { setResult(null); setError(""); setLmpDate(defaultPicker()); setCycleLen(28); setPeriodLen(5); setNumPeriods(12); };

  const today = new Date();

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Period Calculator</h1>
        <p className="muted">
          Predict your upcoming menstrual period dates, along with your ovulation and
          fertile window for each cycle over the next several months.
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
              <label style={LS.label}>Periods to Predict</label>
              <select style={{ ...LS.sel, width:"100%" }} value={numPeriods}
                onChange={e => setNumPeriods(Number(e.target.value))}>
                {[6,8,10,12,18,24].map(n => <option key={n} value={n}>{n}</option>)}
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
            <h2 className="card-title">Predicted Period Dates</h2>

            {/* Legend */}
            <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginBottom:18, fontSize:12 }}>
              {[
                { color:"#fce7f3", label:"Period" },
                { color:"#bfdbfe", label:"Fertile Window" },
                { color:"#e0e7ff", label:"Ovulation" },
              ].map(({ color, label }) => (
                <div key={label} style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ width:14, height:14, borderRadius:4, background:color, border:"1px solid rgba(0,0,0,0.1)" }} />
                  <span style={{ color:"#6b7a9e", fontWeight:600 }}>{label}</span>
                </div>
              ))}
            </div>

            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Period Start</th>
                  <th>Period End</th>
                  <th>Fertile Window</th>
                  <th>Ovulation</th>
                </tr>
              </thead>
              <tbody>
                {result.map((p, i) => {
                  const isCurrent = p.start <= today && today <= addDays(p.start, cycleLen - 1);
                  const isPast    = addDays(p.start, cycleLen - 1) < today;
                  return (
                    <tr key={i} style={{
                      background: isCurrent ? "#f0eeff" : isPast ? "#fafafa" : "#fff",
                      opacity: isPast ? 0.6 : 1,
                    }}>
                      <td><strong style={{ color: isCurrent ? "#4f46e5" : "inherit" }}>{i+1}{isCurrent ? " ●" : ""}</strong></td>
                      <td style={{ background:"#fce7f3", fontWeight:700 }}>{fmtDate(p.start)}</td>
                      <td style={{ background:"#fce7f3", fontWeight:700 }}>{fmtDate(p.end)}</td>
                      <td style={{ background:"#dbeafe", fontSize:12 }}>{fmtShort(p.fertileStart)} – {fmtShort(p.ovulation)}</td>
                      <td style={{ background:"#e0e7ff", fontWeight:700 }}>{fmtShort(p.ovulation)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <p style={{ fontSize:12, color:"#9ca3af", marginTop:12, lineHeight:1.65 }}>
              Highlighted row (●) indicates the current cycle. Ovulation is estimated {cycleLen - 14} days
              after period start. Dates are predictions — actual timing may vary.
            </p>
          </section>
        )}

        <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
          <span style={{ fontSize:13, fontWeight:700, color:"#6b7a9e" }}>Related:</span>
          {[
            { label:"Ovulation Calculator",  to:"/ovulation" },
            { label:"Conception Calculator", to:"/conception" },
            { label:"Due Date Calculator",   to:"/due-date" },
          ].map(({ label, to }) => (
            <Link key={to} to={to}
              style={{ padding:"7px 16px", borderRadius:999, border:"1.5px solid rgba(99,102,241,0.28)", fontSize:13, fontWeight:600, color:"#4f46e5", textDecoration:"none", background:"#f5f3ff" }}>
              {label}
            </Link>
          ))}
        </div>

        <section className="card" style={{ lineHeight:1.75, color:"#374151", fontSize:14 }}>
          <h2 className="card-title">How the Period Calculator Works</h2>
          <p>
            A menstrual cycle begins on the first day of your period and ends the day before your
            next period starts. The calculator predicts future periods by adding your average
            <strong> cycle length</strong> (typically 21–35 days) repeatedly to your last period date.
          </p>
          <h3 style={{ fontSize:15, fontWeight:700, color:"#312e81", margin:"16px 0 8px" }}>Tracking Your Cycle</h3>
          <p>
            Most cycles range from 21 to 35 days, with an average of 28 days. Period duration
            typically lasts 2–7 days. Cycle length can vary month to month due to stress, illness,
            diet, exercise, and hormonal changes.
          </p>
          <p style={{ marginTop:12, padding:"12px 16px", background:"#f0eeff", borderRadius:10, fontSize:13, color:"#4b5280" }}>
            <strong>Note:</strong> This calculator assumes a regular cycle. If your cycle is irregular,
            predictions may be less accurate. Consult a healthcare provider for irregular cycles.
          </p>
        </section>
      </div>
    </div>
  );
}
