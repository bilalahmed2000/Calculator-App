import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/CalcBase.css";

/* ── helpers ── */
const MONTHS = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];
const thisYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => thisYear - 3 + i);
const daysInMonth = (m, y) => new Date(y, m, 0).getDate();
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + Math.round(n)); return x; };
const fmtDate = (d) => d instanceof Date && isFinite(d)
  ? d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—";
const pickerToDate = ({ month, day, year }) => new Date(year, month - 1, day);
const defaultPicker = () => { const t = new Date(); return { month: t.getMonth()+1, day: t.getDate(), year: t.getFullYear() }; };
const CYCLE_OPTIONS = Array.from({ length: 26 }, (_, i) => i + 20);

const LS = {
  label: { display:"block", fontSize:11, fontWeight:700, color:"#6b7a9e", marginBottom:6, letterSpacing:"0.4px", textTransform:"uppercase" },
  sel: { flex:1, minWidth:100, padding:"9px 10px", fontSize:14, fontWeight:600, color:"#1e1b4b", background:"#f8f9ff", border:"1.5px solid rgba(99,102,241,0.22)", borderRadius:10, outline:"none", cursor:"pointer" },
  row: { display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" },
  divider: { height:1, background:"rgba(99,102,241,0.1)", margin:"18px 0" },
  errBox: { background:"#fef2f2", border:"1px solid #fca5a5", color:"#dc2626", borderRadius:10, padding:"10px 14px", marginBottom:14, fontSize:13.5 },
  resultHeader: { background:"rgba(16,185,129,0.10)", border:"1px solid rgba(16,185,129,0.28)", borderRadius:14, padding:"16px 20px", marginBottom:20 },
  mRow: (h) => ({ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 14px", background:h?"#f0eeff":"transparent", borderRadius:8, marginBottom:4 }),
  mLabel: (h) => ({ fontSize:13.5, color:h?"#4f46e5":"#4b5280", fontWeight:h?700:400 }),
  mVal: (h) => ({ fontSize:13.5, color:h?"#4f46e5":"#1e1b4b", fontWeight:h?800:600 }),
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

function MRow({ label, value, highlight }) {
  return (
    <div style={LS.mRow(highlight)}>
      <span style={LS.mLabel(highlight)}>{label}</span>
      <span style={LS.mVal(highlight)}>{value}</span>
    </div>
  );
}

export default function PregnancyConceptionCalculator() {
  const [mode, setMode] = useState("lmp"); // "lmp" | "dueDate"
  const [lmpDate, setLmpDate] = useState(defaultPicker());
  const [cycleLen, setCycleLen] = useState(28);
  const [dueDate, setDueDate] = useState(defaultPicker());
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const calculate = () => {
    setError("");
    try {
      let lmp;
      if (mode === "lmp") {
        lmp = pickerToDate(lmpDate);
        if (!isFinite(lmp)) { setError("Please enter a valid LMP date."); return; }
        // Adjust for cycle length
        lmp = addDays(lmp, cycleLen - 28);
      } else {
        const dd = pickerToDate(dueDate);
        if (!isFinite(dd)) { setError("Please enter a valid due date."); return; }
        lmp = addDays(dd, -280);
      }

      const conceptionDate = addDays(lmp, 14);
      const conceptionWindowStart = addDays(lmp, 11);
      const conceptionWindowEnd   = addDays(lmp, 17);
      const dueDateCalc = addDays(lmp, 280);
      const t1End = addDays(lmp, 13 * 7);
      const t2End = addDays(lmp, 26 * 7);

      const today = new Date();
      const gestDays = Math.max(0, Math.floor((today - lmp) / 86400000));
      const gestWeeks = Math.floor(gestDays / 7);
      const gestRem   = gestDays % 7;

      setResult({ conceptionDate, conceptionWindowStart, conceptionWindowEnd, lmp, dueDateCalc, t1End, t2End, gestWeeks, gestRem });
    } catch { setError("An error occurred. Please check your inputs."); }
  };

  const clear = () => {
    setResult(null); setError("");
    setLmpDate(defaultPicker()); setDueDate(defaultPicker()); setCycleLen(28);
  };

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Pregnancy Conception Calculator</h1>
        <p className="muted">
          Find out when conception likely occurred based on your last menstrual period
          or your due date, along with the probable conception window.
        </p>
      </header>

      <div style={{ maxWidth:780, margin:"0 auto", display:"flex", flexDirection:"column", gap:20 }}>
        <section className="card">
          <div style={{ marginBottom:20 }}>
            <label style={LS.label}>Calculate By:</label>
            <select style={{ ...LS.sel, width:"100%", flex:"none" }} value={mode}
              onChange={e => { setMode(e.target.value); setResult(null); setError(""); }}>
              <option value="lmp">Last Menstrual Period (LMP)</option>
              <option value="dueDate">Due Date</option>
            </select>
          </div>
          <div style={LS.divider} />

          {mode === "lmp" && (
            <>
              <DatePicker label="First Day of Last Menstrual Period:" value={lmpDate} onChange={setLmpDate} />
              <div style={{ marginBottom:16 }}>
                <label style={LS.label}>Average Cycle Length:</label>
                <div style={LS.row}>
                  <select style={{ ...LS.sel, maxWidth:100 }} value={cycleLen}
                    onChange={e => setCycleLen(Number(e.target.value))}>
                    {CYCLE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <span style={{ fontSize:14, fontWeight:600, color:"#6b7a9e" }}>days</span>
                </div>
              </div>
            </>
          )}

          {mode === "dueDate" && (
            <DatePicker label="Due Date:" value={dueDate} onChange={setDueDate} />
          )}

          {error && <div style={LS.errBox}>{error}</div>}

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:8 }}>
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
            <div style={LS.resultHeader}>
              <div style={{ fontSize:12, fontWeight:700, color:"#065f46", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:6 }}>
                Estimated Conception Date
              </div>
              <div style={{ fontSize:28, fontWeight:900, color:"#065f46", letterSpacing:"-0.5px" }}>
                {fmtDate(result.conceptionDate)}
              </div>
              <div style={{ marginTop:8, fontSize:13.5, color:"#065f46", opacity:0.85 }}>
                Possible conception window: <strong>{fmtDate(result.conceptionWindowStart)}</strong> – <strong>{fmtDate(result.conceptionWindowEnd)}</strong>
              </div>
            </div>

            <MRow label="Last Menstrual Period (LMP)"           value={fmtDate(result.lmp)} />
            <MRow label="Most Likely Conception Date"           value={fmtDate(result.conceptionDate)} highlight />
            <MRow label="Conception Window (Start)"             value={fmtDate(result.conceptionWindowStart)} />
            <MRow label="Conception Window (End)"               value={fmtDate(result.conceptionWindowEnd)} />
            <MRow label="Estimated Due Date"                    value={fmtDate(result.dueDateCalc)} />
            <MRow label="End of 1st Trimester (Week 13)"        value={fmtDate(result.t1End)} />
            <MRow label="End of 2nd Trimester (Week 26)"        value={fmtDate(result.t2End)} />

            {(result.gestWeeks > 0 || result.gestRem > 0) && (
              <div style={{ marginTop:14, padding:"12px 16px", background:"#f0eeff", borderRadius:10, fontSize:13.5, color:"#4f46e5", fontWeight:700 }}>
                Current gestational age: {result.gestWeeks} week{result.gestWeeks !== 1 ? "s" : ""} and {result.gestRem} day{result.gestRem !== 1 ? "s" : ""}
              </div>
            )}

            <p style={{ fontSize:12, color:"#9ca3af", marginTop:16, lineHeight:1.65 }}>
              These are estimates assuming ovulation on day {cycleLen === 28 && mode === "lmp" ? "14" : "14"} of your cycle.
              Actual conception may vary. Consult your healthcare provider for confirmation.
            </p>
          </section>
        )}

        <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
          <span style={{ fontSize:13, fontWeight:700, color:"#6b7a9e" }}>Related:</span>
          {[
            { label:"Due Date Calculator",    to:"/due-date" },
            { label:"Pregnancy Calculator",   to:"/pregnancy" },
            { label:"Ovulation Calculator",   to:"/ovulation" },
          ].map(({ label, to }) => (
            <Link key={to} to={to}
              style={{ padding:"7px 16px", borderRadius:999, border:"1.5px solid rgba(99,102,241,0.28)", fontSize:13, fontWeight:600, color:"#4f46e5", textDecoration:"none", background:"#f5f3ff" }}>
              {label}
            </Link>
          ))}
        </div>

        <section className="card" style={{ lineHeight:1.75, color:"#374151", fontSize:14 }}>
          <h2 className="card-title">How Conception Date Is Estimated</h2>
          <p>
            Conception usually occurs around ovulation, which takes place approximately <strong>14 days after
            the first day of the last menstrual period</strong> for a standard 28-day cycle. If your cycle length
            differs, ovulation shifts accordingly — one day earlier or later for each day the cycle deviates from 28.
          </p>
          <p style={{ marginTop:12 }}>
            The <strong>conception window</strong> spans roughly 6 days ending on ovulation day — the 5 days
            before ovulation plus ovulation itself — because sperm can survive up to 5 days in the
            reproductive tract.
          </p>
          <p style={{ marginTop:12, padding:"12px 16px", background:"#f0eeff", borderRadius:10, fontSize:13, color:"#4b5280" }}>
            <strong>Note:</strong> Only a DNA test can definitively confirm paternity or exact conception timing.
            This calculator provides statistical estimates for informational purposes.
          </p>
        </section>
      </div>
    </div>
  );
}
