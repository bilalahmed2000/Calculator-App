import React, { useRef, useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

/* ══════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════ */
const COMPOUND_FREQ = {
  annually:     1,
  semiannually: 2,
  quarterly:    4,
  monthly:      12,
  daily:        365,
};

/* ══════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════ */
const parseNum = (s) => {
  const v = parseFloat(String(s ?? "").replace(/,/g, ""));
  return isNaN(v) || v < 0 ? 0 : v;
};
const ccy = (n) => {
  if (!isFinite(n) || isNaN(n)) return "$0.00";
  return "$" + Math.max(n, 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/* ══════════════════════════════════════════════════════
   CORE CALCULATION
   Strategy: month-by-month simulation.

   Monthly effective rate conversion:
     monthlyRate = (1 + APR/n)^(n/12) − 1
   where n = compound periods per year (1 / 2 / 4 / 12 / 365).

   Tax: applied to gross interest each month.
     netInterest = grossInterest × (1 − taxRate)

   Buying power (inflation adjustment):
     buyingPower = endBalance / (1 + inflRate)^(totalYears)
   — real value in today's dollars.

   Contribution timing = "beginning": add before interest each period.
   Contribution timing = "end":       add after  interest each period.
   Annual contribution applied at first month of each year (beginning)
   or last month of each year / final month of term (end).
══════════════════════════════════════════════════════ */
function runSimulation({ P, AC, MC, timing, apr, n, totalMonths, taxRate }) {
  /* effective monthly rate for the chosen compound frequency */
  const monthlyRate = (apr === 0 || totalMonths === 0)
    ? 0
    : n === 365
      ? Math.pow(1 + apr / 365, 365 / 12) - 1
      : Math.pow(1 + apr / n, n / 12) - 1;

  let balance = P;
  let totalInterest = 0;
  let totalDeposits = 0;    // sum of MC + AC deposits (not initial P)
  const monthlyRows = [];

  for (let m = 1; m <= totalMonths; m++) {
    const isFirstOfYear = (m - 1) % 12 === 0;         // months 1, 13, 25 …
    const isLastOfYear  = m % 12 === 0;                // months 12, 24, 36 …
    const isFinalMonth  = m === totalMonths;
    let deposit = 0;

    /* ── contributions at beginning of period ── */
    if (timing === "beginning") {
      balance += MC;
      deposit += MC;
      if (isFirstOfYear) { balance += AC; deposit += AC; }
    }

    /* ── apply interest ── */
    const gross   = balance * monthlyRate;
    const netInt  = gross * (1 - taxRate);
    balance      += netInt;
    totalInterest += netInt;

    /* ── contributions at end of period ── */
    if (timing === "end") {
      balance += MC;
      deposit += MC;
      /* annual contrib at year-end, OR at the last month of a partial year */
      if (isLastOfYear || (isFinalMonth && !isLastOfYear)) {
        balance += AC;
        deposit += AC;
      }
    }

    totalDeposits += deposit;
    monthlyRows.push({ month: m, year: Math.ceil(m / 12), deposit, interest: netInt, endBalance: balance });
  }

  /* Annual aggregation with cumulative running totals for chart */
  let cumDeposits = 0, cumInterest = 0;
  const annualRows = [];
  for (let start = 0; start < monthlyRows.length; start += 12) {
    const slice = monthlyRows.slice(start, start + 12);
    const yrDep = slice.reduce((s, r) => s + r.deposit,   0);
    const yrInt = slice.reduce((s, r) => s + r.interest,  0);
    cumDeposits += yrDep;
    cumInterest += yrInt;
    annualRows.push({
      year:        Math.floor(start / 12) + 1,
      deposit:     yrDep,
      interest:    yrInt,
      endBalance:  slice[slice.length - 1].endBalance,
      cumDeposits,                          // cumulative contributions (excl. principal)
      cumInterest,                          // cumulative net interest
    });
  }

  return { balance, totalDeposits, totalInterest, monthlyRows, annualRows };
}

/* ══════════════════════════════════════════════════════
   SVG DONUT CHART  (3-slice: principal / contributions / interest)
══════════════════════════════════════════════════════ */
function DonutChart({ principal, contributions, interest }) {
  const rawSlices = [
    { val: principal,     color: "#4f46e5", label: "Initial Investment" },
    { val: contributions, color: "#10b981", label: "Contributions" },
    { val: interest,      color: "#f59e0b", label: "Interest" },
  ];
  const slices = rawSlices.filter((s) => s.val > 0.005);
  const total  = slices.reduce((s, sl) => s + sl.val, 0);
  if (!total) return null;

  const cx = 90, cy = 90, ro = 76, ri = 48;

  const makeArc = (startDeg, sweepDeg, color) => {
    const sweep = Math.min(sweepDeg, 359.999);
    if (sweep <= 0.01) return null;
    const toXY = (deg, r) => {
      const a = ((deg - 90) * Math.PI) / 180;
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    };
    const [ox1, oy1] = toXY(startDeg, ro);
    const [ox2, oy2] = toXY(startDeg + sweep, ro);
    const [ix1, iy1] = toXY(startDeg + sweep, ri);
    const [ix2, iy2] = toXY(startDeg, ri);
    const lg = sweep > 180 ? 1 : 0;
    const f = (v) => v.toFixed(3);
    const d = `M${f(ox1)} ${f(oy1)} A${ro} ${ro} 0 ${lg} 1 ${f(ox2)} ${f(oy2)} L${f(ix1)} ${f(iy1)} A${ri} ${ri} 0 ${lg} 0 ${f(ix2)} ${f(iy2)}Z`;
    return <path key={color} d={d} fill={color} stroke="#fff" strokeWidth={2} />;
  };

  if (slices.length === 1) {
    return (
      <svg viewBox="0 0 180 180" style={{ width: 160, height: 160 }}>
        <circle cx={cx} cy={cy} r={ro} fill={slices[0].color} />
        <circle cx={cx} cy={cy} r={ri} fill="#fff" />
        <text x={cx} y={cy - 4}  textAnchor="middle" fontSize={9.5} fill="#1e1b4b" fontWeight="800">{ccy(total)}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize={8.5} fill="#6b7a9e">ending balance</text>
      </svg>
    );
  }

  let deg = 0;
  const paths = slices.map((sl) => {
    const sweep = (sl.val / total) * 360;
    const p = makeArc(deg, sweep, sl.color);
    deg += sweep;
    return p;
  });

  return (
    <svg viewBox="0 0 180 180" style={{ width: 160, height: 160 }}>
      {paths}
      <circle cx={cx} cy={cy} r={ri} fill="#fff" />
      <text x={cx} y={cy - 4}  textAnchor="middle" fontSize={9.5} fill="#1e1b4b" fontWeight="800">{ccy(total)}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize={8.5} fill="#6b7a9e">ending balance</text>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   SVG STACKED BAR CHART (accumulation by year)
══════════════════════════════════════════════════════ */
function StackedBarChart({ annualRows, principal }) {
  if (!annualRows || annualRows.length < 1) return null;
  const W = 580, H = 210, PL = 68, PB = 32, PT = 18, PR = 14;
  const cW = W - PL - PR, cH = H - PB - PT;
  const n  = annualRows.length;

  const maxBal = Math.max(...annualRows.map((r) => r.endBalance)) * 1.1 || 1;
  const barW   = Math.min(Math.floor(cW / n * 0.65), 44);
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((p) => ({ v: maxBal * p, y: PT + cH - p * cH }));
  const fmt    = (v) => v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toFixed(0);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W, height: "auto", display: "block" }}>
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={PL} y1={t.y} x2={W - PR} y2={t.y} stroke="#f1f0fe" strokeWidth={1} />
          <text x={PL - 5} y={t.y + 3.5} textAnchor="end" fontSize={8.5} fill="#9ca3af">{fmt(t.v)}</text>
        </g>
      ))}
      <line x1={PL} y1={PT}     x2={PL}     y2={H - PB} stroke="#e5e7eb" strokeWidth={1} />
      <line x1={PL} y1={H - PB} x2={W - PR} y2={H - PB} stroke="#e5e7eb" strokeWidth={1} />

      {annualRows.map((r, i) => {
        const cx   = PL + (i + 0.5) * (cW / n);
        const x    = cx - barW / 2;
        const base = PT + cH;                           // baseline y

        /* heights for each stack segment */
        const totalH  = (r.endBalance   / maxBal) * cH;
        const prinH   = (principal      / maxBal) * cH;
        const contH   = (r.cumDeposits  / maxBal) * cH;
        const intH    = Math.max(totalH - prinH - contH, 0);
        const contHc  = Math.max(Math.min(contH, totalH - prinH), 0); // clamped

        return (
          <g key={i}>
            {/* Principal (bottom, indigo) */}
            <rect x={x} y={base - prinH} width={barW} height={prinH}    fill="#4f46e5" rx={i === 0 ? 2 : 2} />
            {/* Contributions (middle, emerald) */}
            {contHc > 0 && <rect x={x} y={base - prinH - contHc} width={barW} height={contHc} fill="#10b981" />}
            {/* Interest (top, amber) */}
            {intH > 0 && <rect x={x} y={base - totalH} width={barW} height={intH} fill="#f59e0b" rx={2} />}
            {/* X label */}
            <text x={cx} y={H - PB + 14} textAnchor="middle" fontSize={n <= 12 ? 9 : 7.5} fill="#9ca3af">
              {n <= 15 ? `Yr ${r.year}` : (r.year % 5 === 0 ? r.year : "")}
            </text>
          </g>
        );
      })}

      {/* Legend */}
      {[
        { color: "#4f46e5", label: "Principal" },
        { color: "#10b981", label: "Contributions" },
        { color: "#f59e0b", label: "Interest" },
      ].map((l, i) => (
        <g key={l.label}>
          <rect x={PL + 4 + i * 110} y={PT} width={11} height={11} rx={2} fill={l.color} />
          <text x={PL + 20 + i * 110} y={PT + 9} fontSize={9} fill="#4b5280">{l.label}</text>
        </g>
      ))}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
export default function InterestCalculator() {
  /* ── inputs ── */
  const [principalStr,     setPrincipalStr]     = useState("10,000");
  const [annualContribStr, setAnnualContribStr] = useState("0");
  const [monthlyContribStr,setMonthlyContribStr]= useState("100");
  const [timing,           setTiming]           = useState("end");
  const [rateStr,          setRateStr]          = useState("5");
  const [compoundFreq,     setCompoundFreq]     = useState("monthly");
  const [yearsStr,         setYearsStr]         = useState("10");
  const [extraMonthsStr,   setExtraMonthsStr]   = useState("0");
  const [taxRateStr,       setTaxRateStr]       = useState("0");
  const [inflRateStr,      setInflRateStr]      = useState("0");

  /* ── output ── */
  const [result,    setResult]    = useState(null);
  const [err,       setErr]       = useState("");
  const [schedTab,  setSchedTab]  = useState("annual");
  const schedRef = useRef(null);

  /* ══════════════════════════════════════════════
     CALCULATE
  ══════════════════════════════════════════════ */
  const calculate = () => {
    setErr("");
    const P       = parseNum(principalStr);
    const AC      = parseNum(annualContribStr);
    const MC      = parseNum(monthlyContribStr);
    const apr     = parseNum(rateStr) / 100;
    const n       = COMPOUND_FREQ[compoundFreq];
    const years   = Math.max(0, Math.round(parseNum(yearsStr)));
    const xMonths = Math.max(0, Math.min(11, Math.round(parseNum(extraMonthsStr))));
    const totalMonths = years * 12 + xMonths;
    const taxRate = parseNum(taxRateStr) / 100;
    const inflRate = parseNum(inflRateStr) / 100;

    if (totalMonths < 1) { setErr("Investment length must be at least 1 month."); return; }
    if (apr > 5) { setErr("Interest rate seems unusually high — please enter APR as a percentage (e.g. 5 for 5%)."); return; }

    /* ── Full simulation ── */
    const { balance, totalDeposits, totalInterest, monthlyRows, annualRows } =
      runSimulation({ P, AC, MC, timing, apr, n, totalMonths, taxRate });

    /* ── Interest attributable to initial principal only
         (re-run the same simulation with zero contributions)          */
    const { totalInterest: intOnInitial } =
      runSimulation({ P, AC: 0, MC: 0, timing, apr, n, totalMonths, taxRate });
    const intOnContribs = Math.max(0, totalInterest - intOnInitial);

    /* ── Buying power (real value in today's dollars)
         Formula: buyingPower = endBalance / (1 + inflRate)^(totalMonths/12)    */
    const t           = totalMonths / 12;
    const buyingPower = inflRate > 0 ? balance / Math.pow(1 + inflRate, t) : null;

    setResult({
      endBalance:    balance,
      totalPrincipal: P,
      totalContribs:  totalDeposits,
      totalInterest,
      intOnInitial,
      intOnContribs,
      buyingPower,
      monthlyRows,
      annualRows,
      totalMonths,
    });
  };

  const clear = () => {
    setPrincipalStr("10,000"); setAnnualContribStr("0"); setMonthlyContribStr("100");
    setTiming("end"); setRateStr("5"); setCompoundFreq("monthly");
    setYearsStr("10"); setExtraMonthsStr("0");
    setTaxRateStr("0"); setInflRateStr("0");
    setResult(null); setErr("");
  };

  const onKey = (e) => { if (e.key === "Enter") calculate(); };

  /* ── style atoms ── */
  const ist = { width: "100%", background: "#f8f9ff", color: "#1e1b4b", border: "1.5px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: "9px 12px", fontSize: 14, fontWeight: 600, outline: "none", boxSizing: "border-box" };
  const lst = { display: "block", fontSize: 11, fontWeight: 700, color: "#6b7a9e", marginBottom: 5, letterSpacing: "0.4px", textTransform: "uppercase" };
  const fst = { marginBottom: 13 };
  const sym = { color: "#6b7a9e", fontWeight: 700, flexShrink: 0, fontSize: 14 };
  const irow = (children) => <div style={{ display: "flex", alignItems: "center", gap: 6 }}>{children}</div>;
  const sectionLbl = { fontSize: 11, fontWeight: 800, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.5px", margin: "16px 0 10px" };

  /* ══════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════ */
  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Interest Calculator</h1>
        <p className="muted">
          Calculate compound interest with recurring contributions, tax, and inflation adjustments — plus a full accumulation schedule.
        </p>
      </header>

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* ══ TOP ROW: Form + Results ══ */}
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 20 }}>

          {/* ─── INPUT FORM ─── */}
          <section className="card" style={{ flex: "0 0 326px", minWidth: 270 }}>

            {/* Initial Investment */}
            <div style={fst}>
              <label style={lst}>Initial Investment</label>
              {irow(<><span style={sym}>$</span><input style={ist} value={principalStr} onChange={(e) => setPrincipalStr(e.target.value)} onKeyDown={onKey} /></>)}
            </div>

            {/* Annual Contribution */}
            <div style={fst}>
              <label style={lst}>Annual Contribution</label>
              {irow(<><span style={sym}>$</span><input style={ist} value={annualContribStr} onChange={(e) => setAnnualContribStr(e.target.value)} onKeyDown={onKey} /></>)}
            </div>

            {/* Monthly Contribution */}
            <div style={fst}>
              <label style={lst}>Monthly Contribution</label>
              {irow(<><span style={sym}>$</span><input style={ist} value={monthlyContribStr} onChange={(e) => setMonthlyContribStr(e.target.value)} onKeyDown={onKey} /></>)}
            </div>

            {/* Contribution Timing */}
            <div style={fst}>
              <label style={lst}>Contribute at the</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 2 }}>
                {[
                  { val: "beginning", label: "Beginning of each compounding period" },
                  { val: "end",       label: "End of each compounding period" },
                ].map(({ val, label }) => (
                  <label key={val} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: timing === val ? "#4f46e5" : "#374151" }}>
                    <input type="radio" name="timing" value={val} checked={timing === val} onChange={() => setTiming(val)} style={{ accentColor: "#6366f1", width: 14, height: 14 }} />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {/* Interest Rate */}
            <div style={fst}>
              <label style={lst}>Interest Rate (APR)</label>
              {irow(<><input style={{ ...ist, textAlign: "right" }} value={rateStr} onChange={(e) => setRateStr(e.target.value)} onKeyDown={onKey} /><span style={sym}>%</span></>)}
            </div>

            {/* Compound Frequency */}
            <div style={fst}>
              <label style={lst}>Compound Frequency</label>
              <select style={{ ...ist, cursor: "pointer" }} value={compoundFreq} onChange={(e) => setCompoundFreq(e.target.value)}>
                <option value="annually">Annually</option>
                <option value="semiannually">Semiannually</option>
                <option value="quarterly">Quarterly</option>
                <option value="monthly">Monthly</option>
                <option value="daily">Daily</option>
              </select>
            </div>

            {/* Investment Length */}
            <div style={fst}>
              <label style={lst}>Investment Length</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>
                  {irow(<><input style={{ ...ist, textAlign: "center" }} type="number" min="0" max="100" value={yearsStr} onChange={(e) => setYearsStr(e.target.value)} onKeyDown={onKey} /><span style={{ color: "#4b5280", fontWeight: 600, flexShrink: 0 }}>yr</span></>)}
                </div>
                <div>
                  {irow(<><input style={{ ...ist, textAlign: "center" }} type="number" min="0" max="11" value={extraMonthsStr} onChange={(e) => setExtraMonthsStr(e.target.value)} onKeyDown={onKey} /><span style={{ color: "#4b5280", fontWeight: 600, flexShrink: 0 }}>mo</span></>)}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ borderTop: "1px dashed rgba(99,102,241,0.18)", margin: "14px 0 14px" }} />

            {/* Tax Rate */}
            <div style={fst}>
              <label style={lst}>Tax Rate (on interest)</label>
              {irow(<><input style={{ ...ist, textAlign: "right" }} value={taxRateStr} onChange={(e) => setTaxRateStr(e.target.value)} onKeyDown={onKey} /><span style={sym}>%</span></>)}
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>Reduces each period's earned interest</div>
            </div>

            {/* Inflation Rate */}
            <div style={fst}>
              <label style={lst}>Inflation Rate</label>
              {irow(<><input style={{ ...ist, textAlign: "right" }} value={inflRateStr} onChange={(e) => setInflRateStr(e.target.value)} onKeyDown={onKey} /><span style={sym}>%</span></>)}
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>Used to calculate buying power</div>
            </div>

            {err && <div className="rng-error" style={{ marginBottom: 12 }}>{err}</div>}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button className="btn" style={{ width: "100%", padding: "11px" }} onClick={calculate}>Calculate</button>
              <button type="button" onClick={clear} style={{ width: "100%", padding: "11px", borderRadius: 12, border: "1.5px solid rgba(99,102,241,0.22)", background: "#fff", color: "#6b7a9e", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Clear</button>
            </div>
          </section>

          {/* ─── RESULTS ─── */}
          {result ? (
            <section className="card" style={{ flex: 1, minWidth: 290 }}>
              {/* Green header */}
              <div className="result-header" style={{ fontSize: 18, marginBottom: 20 }}>
                Ending Balance: <strong>{ccy(result.endBalance)}</strong>
              </div>

              <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
                {/* Breakdown table */}
                <div style={{ flex: 1, minWidth: 210 }}>
                  <table className="kv-table">
                    <tbody>
                      <tr><td>Total Principal</td>             <td>{ccy(result.totalPrincipal)}</td></tr>
                      <tr><td>Total Contributions</td>         <td>{ccy(result.totalContribs)}</td></tr>
                      <tr><td>Total Interest</td>              <td>{ccy(result.totalInterest)}</td></tr>
                      <tr><td>Interest on Initial Investment</td> <td>{ccy(result.intOnInitial)}</td></tr>
                      <tr><td>Interest on Contributions</td>   <td>{ccy(result.intOnContribs)}</td></tr>
                      {result.buyingPower !== null && (
                        <tr>
                          <td>Buying Power (inflation-adjusted)</td>
                          <td>{ccy(result.buyingPower)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  <button className="link-btn" style={{ marginTop: 16, display: "block" }}
                    onClick={() => schedRef.current?.scrollIntoView({ behavior: "smooth" })}>
                    View Accumulation Schedule ↓
                  </button>
                </div>

                {/* Donut + legend */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>
                    Balance Breakdown
                  </div>
                  <DonutChart
                    principal={result.totalPrincipal}
                    contributions={result.totalContribs}
                    interest={result.totalInterest}
                  />
                  <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 7 }}>
                    {[
                      { color: "#4f46e5", label: "Initial Investment", val: result.totalPrincipal },
                      { color: "#10b981", label: "Contributions",      val: result.totalContribs  },
                      { color: "#f59e0b", label: "Interest",           val: result.totalInterest  },
                    ].filter((s) => s.val > 0.005).map((s) => (
                      <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                        <span style={{ width: 11, height: 11, borderRadius: 3, background: s.color, flexShrink: 0 }} />
                        <span style={{ color: "#4b5280" }}>{s.label}: <strong>{ccy(s.val)}</strong></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <section className="card" style={{ flex: 1, minWidth: 260, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 220 }}>
              <div style={{ textAlign: "center" }}>
                <svg viewBox="0 0 24 24" style={{ width: 52, height: 52, marginBottom: 14 }} fill="none" stroke="#c4b5fd" strokeWidth={1.4}>
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="16 7 22 7 22 13" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#9ca3af" }}>Enter your details and press <strong>Calculate</strong></div>
              </div>
            </section>
          )}
        </div>

        {/* ══ ACCUMULATION SCHEDULE (lower half) ══ */}
        {result && (
          <section className="card" ref={schedRef} style={{ marginBottom: 28 }}>
            <h2 className="card-title" style={{ marginBottom: 6 }}>Accumulation Schedule</h2>
            <p style={{ fontSize: 13, color: "#6b7a9e", marginBottom: 20 }}>
              {ccy(result.totalPrincipal)} initial + {ccy(result.totalContribs)} contributions + {ccy(result.totalInterest)} interest
              = <strong>{ccy(result.endBalance)}</strong> ending balance.
            </p>

            {/* Stacked bar chart */}
            <div style={{ marginBottom: 20, overflowX: "auto" }}>
              <StackedBarChart annualRows={result.annualRows} principal={result.totalPrincipal} />
            </div>

            {/* Chart legend row */}
            <div style={{ display: "flex", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
              {[
                { color: "#4f46e5", label: "Principal" },
                { color: "#10b981", label: "Contributions" },
                { color: "#f59e0b", label: "Interest" },
              ].map((l) => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "#6b7a9e" }}>
                  <span style={{ width: 14, height: 14, borderRadius: 3, background: l.color, flexShrink: 0 }} />
                  {l.label}
                </div>
              ))}
            </div>

            {/* Schedule tabs */}
            <div className="tab-row">
              <button className={`tab-btn${schedTab === "annual"  ? " active" : ""}`} onClick={() => setSchedTab("annual")}>Annual Schedule</button>
              <button className={`tab-btn${schedTab === "monthly" ? " active" : ""}`} onClick={() => setSchedTab("monthly")}>Monthly Schedule</button>
            </div>

            {/* Table */}
            <div className="table-scroll">
              {schedTab === "annual" ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Year</th>
                      <th>Deposit</th>
                      <th>Interest</th>
                      <th>Ending Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.annualRows.map((r) => (
                      <tr key={r.year}>
                        <td>{r.year}</td>
                        <td>{ccy(r.deposit)}</td>
                        <td>{ccy(r.interest)}</td>
                        <td>{ccy(r.endBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ fontWeight: 700, background: "#f0eeff" }}>
                      <td>Total</td>
                      <td>{ccy(result.totalContribs)}</td>
                      <td>{ccy(result.totalInterest)}</td>
                      <td>{ccy(result.endBalance)}</td>
                    </tr>
                  </tfoot>
                </table>
              ) : (
                <>
                  {result.monthlyRows.length > 360 && (
                    <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8 }}>
                      Showing first 360 months of {result.monthlyRows.length} total.
                    </div>
                  )}
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Year</th>
                        <th>Deposit</th>
                        <th>Interest</th>
                        <th>Ending Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.monthlyRows.slice(0, 360).map((r) => (
                        <tr key={r.month}>
                          <td>{r.month}</td>
                          <td>{r.year}</td>
                          <td>{ccy(r.deposit)}</td>
                          <td>{ccy(r.interest)}</td>
                          <td>{ccy(r.endBalance)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ fontWeight: 700, background: "#f0eeff" }}>
                        <td colSpan={2}>Total</td>
                        <td>{ccy(result.totalContribs)}</td>
                        <td>{ccy(result.totalInterest)}</td>
                        <td>{ccy(result.endBalance)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
