import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

/* ══════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════ */

/** Parse string → non-negative integer; blank / invalid → 0 */
const parseIntOrZero = (s) => {
  const n = parseInt(String(s).trim(), 10);
  return isNaN(n) || n < 0 ? 0 : n;
};

/** Convert d/h/m/s to total seconds */
const toSecs = (d, h, m, s) => d * 86400 + h * 3600 + m * 60 + s;

/** Normalize total seconds → { d, h, m, s } */
const normalizeTime = (totalSeconds) => {
  const t = Math.round(Math.abs(totalSeconds));
  return {
    d: Math.floor(t / 86400),
    h: Math.floor(t / 3600)  % 24,
    m: Math.floor(t / 60)    % 60,
    s: t % 60,
  };
};

/** Format normalized object as human-readable string */
const fmtDuration = ({ d, h, m, s }) => {
  const parts = [];
  if (d) parts.push(`${d} day${d !== 1 ? "s" : ""}`);
  if (h) parts.push(`${h} hour${h !== 1 ? "s" : ""}`);
  if (m) parts.push(`${m} minute${m !== 1 ? "s" : ""}`);
  parts.push(`${s} second${s !== 1 ? "s" : ""}`);
  return parts.join(", ");
};

/** Number of days in a given month (month = 1–12) */
const daysInMonth = (month, year) => new Date(year, month, 0).getDate();

/** Format a JS Date as "Mar 8, 2026 5:37:25 AM" */
const formatDateResult = (date) => {
  const MO = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const mon  = MO[date.getMonth()];
  const day  = date.getDate();
  const yr   = date.getFullYear();
  let   hr   = date.getHours();
  const mn   = String(date.getMinutes()).padStart(2, "0");
  const sc   = String(date.getSeconds()).padStart(2, "0");
  const ampm = hr >= 12 ? "PM" : "AM";
  hr = hr % 12 || 12;
  return `${mon} ${day}, ${yr} ${hr}:${mn}:${sc} ${ampm}`;
};

/**
 * Parse expression like "1d 2h 3m 4s + 4h 5s - 2030s + 28h".
 * Returns total seconds (may be negative).
 * Throws an Error with a helpful message on bad input.
 */
const parseExpression = (expr) => {
  const clean = expr.trim();
  if (!clean) throw new Error("Expression is empty.");

  /* Ensure operators are separated from adjacent unit letters, then
     split the expression into signed terms at each top-level + or -.
     Approach: iterate characters and push a new token whenever we hit
     + or - that follows a digit or unit letter (i.e., it's an operator,
     not a leading sign on the first term). */
  const spaced = clean.replace(/([dhmsDS\d])\s*([+\-])\s*/g, "$1 $2 ")
                       .replace(/\s+/g, " ").trim();

  const tokens = [];
  let cur = "";
  for (let i = 0; i < spaced.length; i++) {
    const c = spaced[i];
    if ((c === "+" || c === "-") && /[dhmsDS\d]/.test(cur.trim().slice(-1))) {
      tokens.push(cur.trim());
      cur = c;
    } else {
      cur += c;
    }
  }
  if (cur.trim()) tokens.push(cur.trim());
  if (!tokens.length) throw new Error("No valid time terms found. Use d, h, m, s.");

  let totalSecs = 0;

  for (const token of tokens) {
    if (!token) continue;
    const sign = token.startsWith("-") ? -1 : 1;
    const body = token.replace(/^[+\-]/, "").trim();
    if (!body) continue;

    const unitRe = /(\d+(?:\.\d+)?)\s*([dhms])/gi;
    let match, termSecs = 0, found = false;
    while ((match = unitRe.exec(body)) !== null) {
      found = true;
      const val = parseFloat(match[1]);
      switch (match[2].toLowerCase()) {
        case "d": termSecs += val * 86400; break;
        case "h": termSecs += val * 3600;  break;
        case "m": termSecs += val * 60;    break;
        case "s": termSecs += val;         break;
      }
    }
    if (!found) throw new Error(`No time units in "${token}". Use d, h, m, s (e.g. 2h 30m).`);
    totalSecs += sign * termSecs;
  }

  return totalSecs;
};

/* ══════════════════════════════════════════════════════
   SHARED STYLE ATOMS (inline — no extra CSS file needed)
══════════════════════════════════════════════════════ */
const S = {
  card: {
    background: "#fff",
    border: "1px solid rgba(99,102,241,0.12)",
    boxShadow: "0 2px 12px rgba(79,70,229,0.07)",
    borderRadius: 18,
    padding: 24,
    marginBottom: 20,
  },
  h2: { fontSize: 17, fontWeight: 700, color: "#312e81", margin: "0 0 8px" },
  desc: { color: "#6b7a9e", fontSize: 13.5, lineHeight: 1.65, margin: "0 0 18px" },
  lbl: {
    display: "block", fontSize: 11, fontWeight: 700, color: "#6b7a9e",
    textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6,
  },
  input: {
    width: "100%", boxSizing: "border-box",
    background: "#f8f9ff", border: "1.5px solid rgba(99,102,241,0.2)",
    borderRadius: 10, padding: "9px 10px", fontSize: 14, fontWeight: 600,
    color: "#1e1b4b", outline: "none", textAlign: "center",
  },
  select: {
    width: "100%", boxSizing: "border-box",
    background: "#f8f9ff", border: "1.5px solid rgba(99,102,241,0.2)",
    borderRadius: 10, padding: "9px 10px", fontSize: 14, fontWeight: 600,
    color: "#1e1b4b", outline: "none", cursor: "pointer",
  },
  radioRow: { display: "flex", gap: 28, margin: "12px 0" },
  radioLbl: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#4b5280" },
  radio: { accentColor: "#6366f1", width: 15, height: 15, cursor: "pointer" },
  grid4: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 },
  colHdr: { fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", textAlign: "center" },
  sectionLbl: { fontSize: 11, fontWeight: 800, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.5px", margin: "16px 0 10px" },
  btnRow: { display: "flex", gap: 10, marginTop: 4 },
  btnPrimary: {
    padding: "10px 26px", borderRadius: 12, border: "none",
    background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
    color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
  },
  btnSecondary: {
    padding: "10px 22px", borderRadius: 12,
    border: "1.5px solid rgba(99,102,241,0.22)",
    background: "#fff", color: "#6b7a9e", fontWeight: 700, fontSize: 14, cursor: "pointer",
  },
};

/* ── Result / Error boxes ── */
const ResultBox = ({ children }) => (
  <div style={{
    background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)",
    borderRadius: 12, padding: "14px 18px", marginBottom: 20,
    display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12,
  }}>
    <div style={{ color: "#065f46", fontWeight: 700, lineHeight: 1.55 }}>{children}</div>
    <button onClick={() => window.print()}
      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#059669", fontWeight: 700, flexShrink: 0 }}>
      Print
    </button>
  </div>
);

const ErrBox = ({ msg }) => msg
  ? <div className="rng-error" style={{ marginBottom: 16 }}>{msg}</div>
  : null;

/* ── 4-column D/H/M/S header row ── */
const DhmsHeaders = () => (
  <div style={{ ...S.grid4, marginBottom: 6 }}>
    {["Day", "Hour", "Minute", "Second"].map((l) => (
      <div key={l} style={S.colHdr}>{l}</div>
    ))}
  </div>
);

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const SIDEBAR_LINKS = [
  { label: "Time Calculator",  to: "/time-calculator" },
  { label: "Date Calculator",  to: "/date-calculator" },
  { label: "Age Calculator",   to: "/age-calculator" },
  { label: "Hours Calculator", to: "/hours-calculator" },
];

export default function TimeCalculator() {
  /* ──────────────────────────────────────────────────
     SECTION A — Add / Subtract Two Times
  ────────────────────────────────────────────────── */
  const [aD1, setAD1] = useState(""); const [aH1, setAH1] = useState("");
  const [aM1, setAM1] = useState(""); const [aS1, setAS1] = useState("");
  const [aD2, setAD2] = useState(""); const [aH2, setAH2] = useState("");
  const [aM2, setAM2] = useState(""); const [aS2, setAS2] = useState("");
  const [aOp,  setAOp]  = useState("add");
  const [aRes, setARes] = useState(null);
  const [aErr, setAErr] = useState("");

  const calcA = () => {
    setAErr(""); setARes(null);
    const t1 = toSecs(parseIntOrZero(aD1), parseIntOrZero(aH1), parseIntOrZero(aM1), parseIntOrZero(aS1));
    const t2 = toSecs(parseIntOrZero(aD2), parseIntOrZero(aH2), parseIntOrZero(aM2), parseIntOrZero(aS2));
    const total = aOp === "add" ? t1 + t2 : t1 - t2;
    if (total < 0) { setAErr("Result is negative. The second time exceeds the first when subtracting."); return; }
    setARes(normalizeTime(total));
  };
  const clearA = () => {
    setAD1(""); setAH1(""); setAM1(""); setAS1("");
    setAD2(""); setAH2(""); setAM2(""); setAS2("");
    setAOp("add"); setARes(null); setAErr("");
  };

  /* ──────────────────────────────────────────────────
     SECTION B — Add / Subtract Duration from a Date
  ────────────────────────────────────────────────── */
  const _now = new Date();
  const _hr0 = _now.getHours();
  const [bMon,  setBMon]  = useState(String(_now.getMonth() + 1));
  const [bDay,  setBDay]  = useState(String(_now.getDate()));
  const [bYear, setBYear] = useState(String(_now.getFullYear()));
  const [bH,    setBH]    = useState(String(_hr0 % 12 || 12));
  const [bMin,  setBMin]  = useState(String(_now.getMinutes()).padStart(2, "0"));
  const [bSec,  setBSec]  = useState(String(_now.getSeconds()).padStart(2, "0"));
  const [bAmpm, setBAmpm] = useState(_hr0 >= 12 ? "PM" : "AM");
  const [bOp,   setBOp]   = useState("add");
  const [bDD,   setBDD]   = useState(""); const [bDH, setBDH] = useState("");
  const [bDM,   setBDM]   = useState(""); const [bDS, setBDS] = useState("");
  const [bRes,  setBRes]  = useState(null);
  const [bErr,  setBErr]  = useState("");

  /* Derived: number of days in the currently selected month */
  const bYearInt = parseInt(bYear, 10);
  const bMonInt  = parseInt(bMon,  10);
  const bMaxDays = daysInMonth(bMonInt, isNaN(bYearInt) ? 2024 : bYearInt);

  const handleBMon = (v) => {
    setBMon(v);
    const maxD = daysInMonth(parseInt(v, 10), isNaN(bYearInt) ? 2024 : bYearInt);
    if (parseInt(bDay, 10) > maxD) setBDay(String(maxD));
  };
  const handleBYear = (v) => {
    setBYear(v);
    const yr = parseInt(v, 10);
    if (!isNaN(yr)) {
      const maxD = daysInMonth(bMonInt, yr);
      if (parseInt(bDay, 10) > maxD) setBDay(String(maxD));
    }
  };

  const fillNow = () => {
    const n = new Date();
    const h = n.getHours();
    setBMon(String(n.getMonth() + 1)); setBDay(String(n.getDate())); setBYear(String(n.getFullYear()));
    setBH(String(h % 12 || 12)); setBMin(String(n.getMinutes()).padStart(2, "0")); setBSec(String(n.getSeconds()).padStart(2, "0"));
    setBAmpm(h >= 12 ? "PM" : "AM");
  };

  const calcB = () => {
    setBErr(""); setBRes(null);
    const month = parseInt(bMon, 10);
    const day   = parseInt(bDay, 10);
    const year  = parseInt(bYear, 10);
    if (isNaN(year) || year < 100 || year > 9999) { setBErr("Please enter a valid 4-digit year."); return; }
    const maxD = daysInMonth(month, year);
    if (day < 1 || day > maxD) { setBErr(`Day must be 1–${maxD} for the selected month.`); return; }
    let hr24 = parseInt(bH, 10) % 12;
    if (bAmpm === "PM") hr24 += 12;
    const startDate = new Date(year, month - 1, day, hr24, parseInt(bMin, 10) || 0, parseInt(bSec, 10) || 0);
    const durMs = toSecs(parseIntOrZero(bDD), parseIntOrZero(bDH), parseIntOrZero(bDM), parseIntOrZero(bDS)) * 1000;
    const result = new Date(bOp === "add" ? startDate.getTime() + durMs : startDate.getTime() - durMs);
    setBRes(formatDateResult(result));
  };
  const clearB = () => {
    const n = new Date(); const h = n.getHours();
    setBMon(String(n.getMonth()+1)); setBDay(String(n.getDate())); setBYear(String(n.getFullYear()));
    setBH(String(h%12||12)); setBMin(String(n.getMinutes()).padStart(2,"0")); setBSec(String(n.getSeconds()).padStart(2,"0"));
    setBAmpm(h>=12?"PM":"AM"); setBOp("add");
    setBDD(""); setBDH(""); setBDM(""); setBDS(""); setBRes(null); setBErr("");
  };

  /* ──────────────────────────────────────────────────
     SECTION C — Expression Calculator
  ────────────────────────────────────────────────── */
  const [cExpr, setCExpr] = useState("");
  const [cRes,  setCRes]  = useState(null);
  const [cErr,  setCErr]  = useState("");

  const calcC = () => {
    setCErr(""); setCRes(null);
    try {
      const total = parseExpression(cExpr);
      if (total < 0) { setCErr("The expression evaluates to a negative duration."); return; }
      setCRes(normalizeTime(total));
    } catch (e) {
      setCErr(e.message || "Invalid expression.");
    }
  };
  const clearC = () => { setCExpr(""); setCRes(null); setCErr(""); };

  /* ──────────────────────────────────────────────────
     RENDER
  ────────────────────────────────────────────────── */
  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Time Calculator</h1>
        <p className="muted">
          Add or subtract times, compute a date after a duration, and evaluate time expressions.
        </p>
      </header>

      <div className="rng-layout">
        {/* ════════════ MAIN CONTENT ════════════ */}
        <main className="rng-main">

          {/* ╔══════════════════════════════════════╗
              ║  SECTION A: Time Calculator          ║
              ╚══════════════════════════════════════╝ */}
          <section style={S.card}>
            <h2 style={S.h2}>Time Calculator</h2>
            <p style={S.desc}>
              Add or subtract two time values. Enter days, hours, minutes, and/or seconds.
              Blank fields default to 0.
            </p>

            {/* Result */}
            {aRes && (
              <ResultBox>
                <div style={{ fontSize: 12, color: "#047857", marginBottom: 4 }}>Result</div>
                <div style={{ fontSize: 18, letterSpacing: "0.02em" }}>
                  {aRes.d}d&nbsp;:&nbsp;{String(aRes.h).padStart(2,"0")}h&nbsp;:&nbsp;{String(aRes.m).padStart(2,"0")}m&nbsp;:&nbsp;{String(aRes.s).padStart(2,"0")}s
                </div>
                <div style={{ fontSize: 13, color: "#059669", marginTop: 5 }}>{fmtDuration(aRes)}</div>
              </ResultBox>
            )}
            <ErrBox msg={aErr} />

            {/* Column headers */}
            <DhmsHeaders />

            {/* Time row 1 */}
            <div style={{ ...S.grid4, marginBottom: 10 }}>
              {[[aD1,setAD1],[aH1,setAH1],[aM1,setAM1],[aS1,setAS1]].map(([v,set], i) => (
                <input key={i} style={S.input} type="text" inputMode="numeric"
                  value={v} placeholder="0" onChange={(e) => set(e.target.value)} />
              ))}
            </div>

            {/* Operator radios */}
            <div style={S.radioRow}>
              <label style={S.radioLbl}>
                <input type="radio" style={S.radio} name="aOp" value="add"
                  checked={aOp === "add"} onChange={() => setAOp("add")} />
                + Add
              </label>
              <label style={S.radioLbl}>
                <input type="radio" style={S.radio} name="aOp" value="subtract"
                  checked={aOp === "subtract"} onChange={() => setAOp("subtract")} />
                − Subtract
              </label>
            </div>

            {/* Time row 2 */}
            <div style={{ ...S.grid4, marginBottom: 20 }}>
              {[[aD2,setAD2],[aH2,setAH2],[aM2,setAM2],[aS2,setAS2]].map(([v,set], i) => (
                <input key={i} style={S.input} type="text" inputMode="numeric"
                  value={v} placeholder="0" onChange={(e) => set(e.target.value)} />
              ))}
            </div>

            <div style={S.btnRow}>
              <button style={S.btnPrimary} onClick={calcA}>Calculate</button>
              <button style={S.btnSecondary} onClick={clearA}>Clear</button>
            </div>
          </section>

          {/* ╔══════════════════════════════════════╗
              ║  SECTION B: Add/Subtract from Date   ║
              ╚══════════════════════════════════════╝ */}
          <section style={S.card}>
            <h2 style={S.h2}>Add or Subtract Time from a Date</h2>
            <p style={S.desc}>
              Select a start date and time, then add or subtract a duration to find the result.
            </p>

            {/* Result */}
            {bRes && (
              <ResultBox>
                <div style={{ fontSize: 12, color: "#047857", marginBottom: 4 }}>Result</div>
                <div style={{ fontSize: 18 }}>{bRes}</div>
              </ResultBox>
            )}
            <ErrBox msg={bErr} />

            {/* ── Start Date ── */}
            <div style={S.sectionLbl}>Start Date &amp; Time</div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.2fr", gap: 10, marginBottom: 12 }}>
              <div>
                <label style={S.lbl}>Month</label>
                <select style={S.select} value={bMon} onChange={(e) => handleBMon(e.target.value)}>
                  {MONTH_NAMES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={S.lbl}>Day</label>
                <select style={S.select} value={bDay} onChange={(e) => setBDay(e.target.value)}>
                  {Array.from({ length: bMaxDays }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={S.lbl}>Year</label>
                <input style={S.input} type="text" inputMode="numeric"
                  value={bYear} onChange={(e) => handleBYear(e.target.value)} placeholder="2026" />
              </div>
            </div>

            {/* ── Start Time ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 80px", gap: 10, marginBottom: 6 }}>
              <div>
                <label style={S.lbl}>Hour</label>
                <input style={S.input} type="text" inputMode="numeric"
                  value={bH} onChange={(e) => setBH(e.target.value)} placeholder="12" />
              </div>
              <div>
                <label style={S.lbl}>Minute</label>
                <input style={S.input} type="text" inputMode="numeric"
                  value={bMin} onChange={(e) => setBMin(e.target.value)} placeholder="00" />
              </div>
              <div>
                <label style={S.lbl}>Second</label>
                <input style={S.input} type="text" inputMode="numeric"
                  value={bSec} onChange={(e) => setBSec(e.target.value)} placeholder="00" />
              </div>
              <div>
                <label style={S.lbl}>AM/PM</label>
                <select style={S.select} value={bAmpm} onChange={(e) => setBAmpm(e.target.value)}>
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            <button className="link-btn" style={{ marginBottom: 4 }} onClick={fillNow}>
              ⏱ Use current date &amp; time
            </button>

            {/* ── Operation ── */}
            <div style={S.radioRow}>
              <label style={S.radioLbl}>
                <input type="radio" style={S.radio} name="bOp" value="add"
                  checked={bOp === "add"} onChange={() => setBOp("add")} />
                + Add
              </label>
              <label style={S.radioLbl}>
                <input type="radio" style={S.radio} name="bOp" value="subtract"
                  checked={bOp === "subtract"} onChange={() => setBOp("subtract")} />
                − Subtract
              </label>
            </div>

            {/* ── Duration ── */}
            <div style={S.sectionLbl}>Duration to Add / Subtract</div>
            <DhmsHeaders />
            <div style={{ ...S.grid4, marginBottom: 20 }}>
              {[[bDD,setBDD],[bDH,setBDH],[bDM,setBDM],[bDS,setBDS]].map(([v,set], i) => (
                <input key={i} style={S.input} type="text" inputMode="numeric"
                  value={v} placeholder="0" onChange={(e) => set(e.target.value)} />
              ))}
            </div>

            <div style={S.btnRow}>
              <button style={S.btnPrimary} onClick={calcB}>Calculate</button>
              <button style={S.btnSecondary} onClick={clearB}>Clear</button>
            </div>
          </section>

          {/* ╔══════════════════════════════════════╗
              ║  SECTION C: Expression Calculator    ║
              ╚══════════════════════════════════════╝ */}
          <section style={S.card}>
            <h2 style={S.h2}>Time Calculator in Expression</h2>
            <p style={S.desc}>
              Type a time expression using <strong>d</strong> (days), <strong>h</strong> (hours),{" "}
              <strong>m</strong> (minutes), <strong>s</strong> (seconds) with <strong>+</strong> or{" "}
              <strong>−</strong> operators. Spaces are optional.
            </p>
            <div style={{ marginBottom: 14, background: "#f5f3ff", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#4b5280" }}>
              <strong>Examples:</strong><br />
              <code style={{ fontSize: 12 }}>1d 2h 3m 4s + 4h 5s - 2030s + 28h</code><br />
              <code style={{ fontSize: 12 }}>3h 45m - 1h 20m 30s</code><br />
              <code style={{ fontSize: 12 }}>7d + 12h - 4h 30m</code>
            </div>

            {/* Result */}
            {cRes && (
              <ResultBox>
                <div style={{ fontSize: 12, color: "#047857", marginBottom: 4 }}>Result</div>
                <div style={{ fontSize: 18 }}>
                  {cRes.d}d&nbsp;:&nbsp;{String(cRes.h).padStart(2,"0")}h&nbsp;:&nbsp;{String(cRes.m).padStart(2,"0")}m&nbsp;:&nbsp;{String(cRes.s).padStart(2,"0")}s
                </div>
                <div style={{ fontSize: 13, color: "#059669", marginTop: 5 }}>{fmtDuration(cRes)}</div>
              </ResultBox>
            )}
            <ErrBox msg={cErr} />

            <textarea
              value={cExpr}
              onChange={(e) => setCExpr(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) calcC(); }}
              placeholder="e.g. 1d 2h 3m 4s + 4h 5s - 2030s + 28h"
              rows={4}
              style={{
                width: "100%", boxSizing: "border-box",
                background: "#f8f9ff", border: "1.5px solid rgba(99,102,241,0.2)",
                borderRadius: 12, padding: "12px 14px", fontSize: 14,
                fontFamily: "'Courier New', Courier, monospace",
                color: "#1e1b4b", outline: "none", resize: "vertical", marginBottom: 16,
              }}
            />

            <div style={S.btnRow}>
              <button style={S.btnPrimary} onClick={calcC}>Calculate</button>
              <button style={S.btnSecondary} onClick={clearC}>Clear</button>
            </div>

            {/* Related calculators */}
            <div style={{ borderTop: "1px solid rgba(99,102,241,0.1)", marginTop: 24, paddingTop: 18 }}>
              <div style={S.sectionLbl}>Related Calculators</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {[
                  { label: "Date Calculator",  to: "/date-calculator"  },
                  { label: "Age Calculator",   to: "/age-calculator"   },
                  { label: "Hours Calculator", to: "/hours-calculator" },
                ].map(({ label, to }) => (
                  <Link key={to} to={to} style={{
                    padding: "7px 16px", borderRadius: 999,
                    border: "1.5px solid rgba(99,102,241,0.28)",
                    fontSize: 13, fontWeight: 600, color: "#4f46e5",
                    textDecoration: "none", background: "#f5f3ff",
                  }}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* ════════════ SIDEBAR ════════════ */}
        <aside className="rng-sidebar">
          <div className="card rng-sidebar-card">
            <div className="rng-sidebar-title">Date &amp; Time</div>
            <ul className="rng-sidebar-list">
              {SIDEBAR_LINKS.map(({ label, to }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className={`rng-sidebar-link${label === "Time Calculator" ? " rng-sidebar-link--active" : ""}`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
