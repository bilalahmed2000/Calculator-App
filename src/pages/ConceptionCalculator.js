import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/CalcBase.css";

/* ── helpers ── */
const MONTHS = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];
const thisYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => thisYear - 1 + i);
const daysInMonth = (m, y) => new Date(y, m, 0).getDate();
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + Math.round(n)); return x; };
const fmtDate = (d) => d instanceof Date && isFinite(d)
  ? d.toLocaleDateString("en-US", { weekday:"short", month:"long", day:"numeric", year:"numeric" }) : "—";
const fmtShort = (d) => d instanceof Date && isFinite(d)
  ? d.toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }) : "—";
const pickerToDate = ({ month, day, year }) => new Date(year, month - 1, day);
const defaultPicker = () => { const t = new Date(); return { month: t.getMonth()+1, day: t.getDate(), year: t.getFullYear() }; };
const CYCLE_OPTIONS = Array.from({ length: 26 }, (_, i) => i + 20);

const LS = {
  label: { display:"block", fontSize:11, fontWeight:700, color:"#6b7a9e", marginBottom:6, letterSpacing:"0.4px", textTransform:"uppercase" },
  sel: { flex:1, minWidth:100, padding:"9px 10px", fontSize:14, fontWeight:600, color:"#1e1b4b", background:"#f8f9ff", border:"1.5px solid rgba(99,102,241,0.22)", borderRadius:10, outline:"none", cursor:"pointer" },
  row: { display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" },
  divider: { height:1, background:"rgba(99,102,241,0.1)", margin:"18px 0" },
  errBox: { background:"#fef2f2", border:"1px solid #fca5a5", color:"#dc2626", borderRadius:10, padding:"10px 14px", marginBottom:14, fontSize:13.5 },
  resultHeader: { background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.25)", borderRadius:14, padding:"16px 20px", marginBottom:20 },
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

export default function ConceptionCalculator() {
  // Mode: "byDueDate" (find LMPs that give the due date) or "byLMP" (find best times to conceive for a target due date)
  const [mode, setMode] = useState("byDueDate");
  const [dueDate, setDueDate]   = useState(defaultPicker());
  const [lmpDate, setLmpDate]   = useState(defaultPicker());
  const [targetDue, setTargetDue] = useState(defaultPicker());
  const [cycleLen, setCycleLen] = useState(28);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState("");

  const calculate = () => {
    setError("");
    try {
      if (mode === "byDueDate") {
        // Given a due date, find conception date
        const dd = pickerToDate(dueDate);
        if (!isFinite(dd)) { setError("Please enter a valid due date."); return; }
        const lmp             = addDays(dd, -280);
        const conceptionDate  = addDays(lmp, cycleLen - 14); // adjusted ovulation
        const fertileStart    = addDays(conceptionDate, -5);
        const fertileEnd      = addDays(conceptionDate, 1);
        const t1End           = addDays(lmp, 13 * 7);
        const t2End           = addDays(lmp, 26 * 7);
        setResult({ mode:"byDueDate", dd, lmp, conceptionDate, fertileStart, fertileEnd, t1End, t2End });

      } else if (mode === "byLMP") {
        // Given LMP, find ovulation & fertile window + estimated due date
        const lmp = pickerToDate(lmpDate);
        if (!isFinite(lmp)) { setError("Please enter a valid LMP date."); return; }
        const conceptionDate  = addDays(lmp, cycleLen - 14);
        const fertileStart    = addDays(conceptionDate, -5);
        const fertileEnd      = addDays(conceptionDate, 1);
        const dd              = addDays(lmp, 280 + (cycleLen - 28));
        setResult({ mode:"byLMP", lmp, conceptionDate, fertileStart, fertileEnd, dd });

      } else {
        // Plan ahead: find LMP cycles that result in the target due date
        const target = pickerToDate(targetDue);
        if (!isFinite(target)) { setError("Please enter a valid target due date."); return; }
        // LMP that yields target due date (standard 28d cycle): LMP = target - 280
        const idealLMP = addDays(target, -280);
        // Show conception windows for 3 past/present/upcoming cycles
        const cycles = Array.from({ length: 3 }, (_, i) => {
          const lmp          = addDays(idealLMP, (i - 1) * cycleLen);
          const conception   = addDays(lmp, cycleLen - 14);
          const fertileStart = addDays(conception, -5);
          const fertileEnd   = addDays(conception, 1);
          const estimatedDD  = addDays(lmp, 280 + (cycleLen - 28));
          return { lmp, conception, fertileStart, fertileEnd, estimatedDD };
        });
        setResult({ mode:"plan", target, cycles });
      }
    } catch { setError("An error occurred. Please check your inputs."); }
  };

  const clear = () => {
    setResult(null); setError("");
    setDueDate(defaultPicker()); setLmpDate(defaultPicker()); setTargetDue(defaultPicker());
    setCycleLen(28);
  };

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Conception Calculator</h1>
        <p className="muted">
          Find out when conception likely occurred from a due date, plan your fertile window
          from your last period, or find the best time to conceive for a target due date.
        </p>
      </header>

      <div style={{ maxWidth:780, margin:"0 auto", display:"flex", flexDirection:"column", gap:20 }}>
        <section className="card">
          <div style={{ marginBottom:20 }}>
            <label style={LS.label}>What would you like to calculate?</label>
            <select style={{ ...LS.sel, width:"100%", flex:"none" }} value={mode}
              onChange={e => { setMode(e.target.value); setResult(null); setError(""); }}>
              <option value="byDueDate">Find conception date from a due date</option>
              <option value="byLMP">Find fertile window from last menstrual period</option>
              <option value="plan">Plan ahead — find best cycles for a target due date</option>
            </select>
          </div>
          <div style={LS.divider} />

          {mode !== "byDueDate" && (
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
          )}

          {mode === "byDueDate" && (
            <DatePicker label="Due Date:" value={dueDate} onChange={setDueDate} />
          )}
          {mode === "byLMP" && (
            <DatePicker label="First Day of Last Menstrual Period:" value={lmpDate} onChange={setLmpDate} />
          )}
          {mode === "plan" && (
            <DatePicker label="Target Due Date (when you'd like to deliver):" value={targetDue} onChange={setTargetDue} />
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

        {result && result.mode === "byDueDate" && (
          <section className="card">
            <div style={LS.resultHeader}>
              <div style={{ fontSize:12, fontWeight:700, color:"#4f46e5", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:6 }}>
                Estimated Conception Date
              </div>
              <div style={{ fontSize:26, fontWeight:900, color:"#312e81" }}>{fmtDate(result.conceptionDate)}</div>
              <div style={{ fontSize:13, color:"#6b7a9e", marginTop:6 }}>
                Conception window: <strong>{fmtShort(result.fertileStart)}</strong> – <strong>{fmtShort(result.fertileEnd)}</strong>
              </div>
            </div>
            <MRow label="Due Date"                     value={fmtShort(result.dd)} />
            <MRow label="Last Menstrual Period (LMP)"  value={fmtShort(result.lmp)} />
            <MRow label="Most Likely Conception Date"  value={fmtDate(result.conceptionDate)} highlight />
            <MRow label="Fertile Window Start"         value={fmtShort(result.fertileStart)} />
            <MRow label="Fertile Window End"           value={fmtShort(result.fertileEnd)} />
            <MRow label="End of 1st Trimester"         value={fmtShort(result.t1End)} />
            <MRow label="End of 2nd Trimester"         value={fmtShort(result.t2End)} />
          </section>
        )}

        {result && result.mode === "byLMP" && (
          <section className="card">
            <div style={LS.resultHeader}>
              <div style={{ fontSize:12, fontWeight:700, color:"#4f46e5", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:6 }}>
                Your Fertile Window
              </div>
              <div style={{ fontSize:26, fontWeight:900, color:"#312e81" }}>
                {fmtShort(result.fertileStart)} – {fmtShort(result.fertileEnd)}
              </div>
              <div style={{ fontSize:13, color:"#6b7a9e", marginTop:6 }}>
                Peak fertility (ovulation): <strong>{fmtDate(result.conceptionDate)}</strong>
              </div>
            </div>
            <MRow label="Last Menstrual Period (LMP)"  value={fmtShort(result.lmp)} />
            <MRow label="Fertile Window"               value={`${fmtShort(result.fertileStart)} – ${fmtShort(result.fertileEnd)}`} />
            <MRow label="Ovulation / Peak Fertility"   value={fmtDate(result.conceptionDate)} highlight />
            <MRow label="Estimated Due Date (if conceived)" value={fmtShort(result.dd)} />
          </section>
        )}

        {result && result.mode === "plan" && (
          <section className="card">
            <h2 className="card-title">Conception Windows for Target Due Date: {fmtShort(result.target)}</h2>
            <p className="small" style={{ marginBottom:14 }}>
              To deliver around <strong>{fmtShort(result.target)}</strong>, aim to conceive during one of these fertile windows:
            </p>
            {result.cycles.map((cyc, i) => (
              <div key={i} style={{
                marginBottom:12, borderRadius:12, overflow:"hidden",
                border:"1px solid rgba(99,102,241,0.18)",
              }}>
                <div style={{ background:"#f5f3ff", padding:"10px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontWeight:800, fontSize:14, color:"#312e81" }}>Option {i+1}</span>
                  <span style={{ fontSize:12, color:"#6b7a9e", fontWeight:600 }}>Est. due: {fmtShort(cyc.estimatedDD)}</span>
                </div>
                <div style={{ padding:"12px 16px", background:"#fff", display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  <div style={{ padding:"8px 12px", background:"#bfdbfe", borderRadius:8 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:"#1e40af", textTransform:"uppercase" }}>Fertile Window</div>
                    <div style={{ fontSize:13, fontWeight:700, color:"#1e40af" }}>{fmtShort(cyc.fertileStart)} – {fmtShort(cyc.fertileEnd)}</div>
                  </div>
                  <div style={{ padding:"8px 12px", background:"#e0e7ff", borderRadius:8 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:"#3730a3", textTransform:"uppercase" }}>Ovulation Day</div>
                    <div style={{ fontSize:13, fontWeight:800, color:"#4f46e5" }}>{fmtShort(cyc.conception)}</div>
                  </div>
                  <div style={{ padding:"8px 12px", background:"#f0fdf4", borderRadius:8, gridColumn:"1 / -1" }}>
                    <div style={{ fontSize:10, fontWeight:700, color:"#065f46", textTransform:"uppercase" }}>LMP (period should start)</div>
                    <div style={{ fontSize:13, fontWeight:700, color:"#065f46" }}>{fmtDate(cyc.lmp)}</div>
                  </div>
                </div>
              </div>
            ))}
            <p style={{ fontSize:12, color:"#9ca3af", lineHeight:1.65, marginTop:8 }}>
              These are estimates based on a {cycleLen}-day cycle. Actual due dates depend on when
              conception occurs and individual variation.
            </p>
          </section>
        )}

        <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
          <span style={{ fontSize:13, fontWeight:700, color:"#6b7a9e" }}>Related:</span>
          {[
            { label:"Ovulation Calculator",            to:"/ovulation" },
            { label:"Pregnancy Conception Calculator", to:"/pregnancy-conception" },
            { label:"Due Date Calculator",             to:"/due-date" },
          ].map(({ label, to }) => (
            <Link key={to} to={to}
              style={{ padding:"7px 16px", borderRadius:999, border:"1.5px solid rgba(99,102,241,0.28)", fontSize:13, fontWeight:600, color:"#4f46e5", textDecoration:"none", background:"#f5f3ff" }}>
              {label}
            </Link>
          ))}
        </div>

        <section className="card" style={{ lineHeight:1.75, color:"#374151", fontSize:14 }}>
          <h2 className="card-title">About the Conception Calculator</h2>
          <p>
            This calculator has three modes to help with conception planning:
          </p>
          <ul style={{ marginLeft:18, marginTop:8 }}>
            <li><strong>Find conception date from a due date</strong> — Works backwards from a known or estimated due date to determine when conception most likely occurred.</li>
            <li style={{ marginTop:8 }}><strong>Find fertile window from LMP</strong> — Given your last menstrual period, calculates your upcoming ovulation date and fertile window for this cycle.</li>
            <li style={{ marginTop:8 }}><strong>Plan ahead for a target due date</strong> — If you have a preferred delivery timeframe, shows which conception windows in upcoming cycles would result in that due date.</li>
          </ul>
          <p style={{ marginTop:14, padding:"12px 16px", background:"#f0eeff", borderRadius:10, fontSize:13, color:"#4b5280" }}>
            <strong>Note:</strong> These are statistical estimates. Fertility varies significantly
            between individuals. Consult a reproductive health specialist for personalized guidance.
          </p>
        </section>
      </div>
    </div>
  );
}
