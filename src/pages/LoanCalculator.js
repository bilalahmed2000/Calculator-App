import React, { useRef, useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

/* ══════════════════════════════════════════════════════
   FORMATTERS & PARSERS
══════════════════════════════════════════════════════ */
const ccy = (n) => {
  if (!isFinite(n) || isNaN(n)) return "—";
  const s = n < 0 ? "-" : "";
  return s + "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const parseN = (s) => { const v = parseFloat(String(s ?? "").replace(/,/g, "")); return isNaN(v) ? 0 : v; };

/* ══════════════════════════════════════════════════════
   DROPDOWN OPTION TABLES
══════════════════════════════════════════════════════ */
const COMPOUND_OPTS = [
  { v: "monthly",      l: "Monthly (APR)",      f: 12       },
  { v: "semi-monthly", l: "Semi-monthly (APR)",  f: 24       },
  { v: "bi-weekly",    l: "Bi-weekly (APR)",     f: 26       },
  { v: "weekly",       l: "Weekly (APR)",        f: 52       },
  { v: "daily",        l: "Daily (APR)",         f: 365      },
  { v: "continuous",   l: "Continuously",        f: Infinity },
];
const PAYBACK_OPTS = [
  { v: "monthly",      l: "Every Month",         lbl: "Payment Every Month",         f: 12  },
  { v: "semi-monthly", l: "Every Semi-month",    lbl: "Payment Every Semi-month",    f: 24  },
  { v: "bi-weekly",    l: "Every 2 Weeks",       lbl: "Payment Every 2 Weeks",       f: 26  },
  { v: "weekly",       l: "Every Week",          lbl: "Payment Every Week",          f: 52  },
  { v: "daily",        l: "Every Day",           lbl: "Payment Every Day",           f: 365 },
];
const getCF = (v) => COMPOUND_OPTS.find((o) => o.v === v)?.f ?? 12;
const getPF = (v) => PAYBACK_OPTS.find((o) => o.v === v)?.f ?? 12;
const getPL = (v) => PAYBACK_OPTS.find((o) => o.v === v)?.lbl ?? "Payment Every Month";

/* ══════════════════════════════════════════════════════
   MATH HELPERS
══════════════════════════════════════════════════════ */
/** Effective Annual Rate from nominal APR and compound frequency. */
function effAR(apr, cf) {
  if (!isFinite(cf)) return Math.exp(apr / 100) - 1;      // continuous
  return Math.pow(1 + apr / 100 / cf, cf) - 1;
}
/** Payment-period rate given APR, compound freq, and payback freq. */
function periodR(apr, cf, pf) {
  return Math.pow(1 + effAR(apr, cf), 1 / pf) - 1;
}
/** Total number of payment periods for a term. */
function totalN(yrs, mos, pf) {
  return Math.max(1, Math.round((parseN(yrs) * 12 + parseN(mos)) / 12 * pf));
}
/** Compound balance: P grown by APR for `t` years at compound freq `cf`. */
function cmpBal(P, apr, cf, t) {
  if (!isFinite(cf)) return P * Math.exp((apr / 100) * t);
  return P * Math.pow(1 + apr / 100 / cf, cf * t);
}

/* ══════════════════════════════════════════════════════
   SVG DONUT CHART  (two-slice: principal vs interest)
══════════════════════════════════════════════════════ */
function dXY(cx, cy, r, deg) {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}
const dp = (n) => n.toFixed(2);

function DonutChart({ principal, interest, pColor = "#4f46e5", iColor = "#f59e0b" }) {
  const total = (principal || 0) + (interest || 0);
  if (!(total > 0)) return null;
  const cx = 80, cy = 80, ro = 68, ri = 42;

  if (interest <= 0) {
    return (
      <svg viewBox="0 0 160 160" style={{ width: 130, height: 130 }}>
        <circle cx={cx} cy={cy} r={ro} fill={pColor} />
        <circle cx={cx} cy={cy} r={ri} fill="#fff" />
      </svg>
    );
  }

  const pSweep = Math.min((principal / total) * 360, 359.999);
  const iSweep = 360 - pSweep;

  function arc(startDeg, sweep, outerR, innerR, color) {
    const end = startDeg + sweep;
    const [ox1, oy1] = dXY(cx, cy, outerR, startDeg);
    const [ox2, oy2] = dXY(cx, cy, outerR, end);
    const [ix1, iy1] = dXY(cx, cy, innerR, end);
    const [ix2, iy2] = dXY(cx, cy, innerR, startDeg);
    const lg = sweep > 180 ? 1 : 0;
    const d = `M${dp(ox1)} ${dp(oy1)} A${outerR} ${outerR} 0 ${lg} 1 ${dp(ox2)} ${dp(oy2)} L${dp(ix1)} ${dp(iy1)} A${innerR} ${innerR} 0 ${lg} 0 ${dp(ix2)} ${dp(iy2)}Z`;
    return <path d={d} fill={color} stroke="#fff" strokeWidth={1.5} />;
  }

  return (
    <svg viewBox="0 0 160 160" style={{ width: 130, height: 130 }}>
      {arc(0, pSweep, ro, ri, pColor)}
      {arc(pSweep, iSweep - 0.001, ro, ri, iColor)}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   SHARED UI PIECES
══════════════════════════════════════════════════════ */
/** Reusable input row with optional prefix/suffix symbol. */
function Field({ label, pre, suf, children }) {
  return (
    <div style={{ marginBottom: 11 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6b7a9e", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.4px" }}>
        {label}
      </label>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {pre && <span style={{ color: "#6b7a9e", fontWeight: 700, flexShrink: 0 }}>{pre}</span>}
        {children}
        {suf && <span style={{ color: "#6b7a9e", fontWeight: 700, flexShrink: 0 }}>{suf}</span>}
      </div>
    </div>
  );
}

/** Inline error box. */
const ErrBox = ({ msg }) =>
  msg ? <div className="rng-error" style={{ marginBottom: 10 }}>{msg}</div> : null;

/** Green result header bar. */
const ResHeader = ({ label, value }) => (
  <div className="result-header" style={{ fontSize: 15, marginBottom: 14 }}>
    <span>{label}: <strong style={{ fontSize: 18 }}>{value}</strong></span>
  </div>
);

/** Pie chart + legend side by side. */
function ChartBlock({ principal, interest, principalLabel = "Principal", interestLabel = "Interest" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginTop: 14 }}>
      <DonutChart principal={principal} interest={interest} />
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {[
          { color: "#4f46e5", label: principalLabel, value: principal },
          { color: "#f59e0b", label: interestLabel,  value: interest  },
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0 }} />
            <span style={{ color: "#4b5280" }}>{s.label}: <strong style={{ color: "#1e1b4b" }}>{ccy(s.value)}</strong></span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Placeholder shown when no result yet. */
const NoResult = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 130, color: "#9ca3af" }}>
    <div style={{ textAlign: "center", fontSize: 13, fontWeight: 600 }}>
      Enter values and click <strong>Calculate</strong>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════
   SECTION WRAPPER  (shared card shell for A / B / C)
══════════════════════════════════════════════════════ */
function SectionCard({ title, subtitle, children }) {
  return (
    <section className="card" style={{ marginBottom: 22 }}>
      <h2 className="card-title" style={{ marginBottom: 2 }}>{title}</h2>
      <p className="rng-desc" style={{ marginBottom: 18 }}>{subtitle}</p>
      {children}
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   SHARED INPUT STYLE
══════════════════════════════════════════════════════ */
const IST = {
  width: "100%", background: "#f8f9ff", color: "#1e1b4b",
  border: "1.5px solid rgba(99,102,241,0.2)", borderRadius: 12,
  padding: "9px 12px", fontSize: 14, fontWeight: 600, outline: "none",
  boxSizing: "border-box",
};

/* ══════════════════════════════════════════════════════
   AMORTIZATION TABLE (Section A)
══════════════════════════════════════════════════════ */
function AmorTable({ rows, payFreq, tab, setTab }) {
  /* Annual aggregation: group rows into chunks of payFreq */
  const annual = [];
  const chunkSize = payFreq;
  for (let yr = 0; yr * chunkSize < rows.length; yr++) {
    const slice = rows.slice(yr * chunkSize, (yr + 1) * chunkSize);
    annual.push({
      year: yr + 1,
      interest:   slice.reduce((s, r) => s + r.interest, 0),
      principal:  slice.reduce((s, r) => s + r.principal, 0),
      endBalance: slice[slice.length - 1].balance,
    });
  }

  const MAX_ROWS  = 600;
  const perPeriod = rows.slice(0, MAX_ROWS);
  const capped    = rows.length > MAX_ROWS;

  const periodLabel = payFreq === 12 ? "Month" : payFreq === 26 ? "Period (Bi-wk)" : payFreq === 52 ? "Week" : payFreq === 365 ? "Day" : "Period";

  return (
    <div style={{ marginTop: 20, borderTop: "1px solid rgba(99,102,241,0.1)", paddingTop: 16 }}>
      <div className="tab-row" style={{ marginBottom: 0 }}>
        <button className={`tab-btn${tab === "annual"  ? " active" : ""}`} onClick={() => setTab("annual")}>Annual Schedule</button>
        <button className={`tab-btn${tab === "period"  ? " active" : ""}`} onClick={() => setTab("period")}>Per-Payment Schedule</button>
      </div>

      <div className="table-scroll" style={{ marginTop: 10 }}>
        <table className="table">
          <thead>
            <tr>
              <th>{tab === "annual" ? "Year" : periodLabel}</th>
              <th>Beginning Balance</th>
              <th>Interest</th>
              <th>Principal</th>
              <th>Ending Balance</th>
            </tr>
          </thead>
          <tbody>
            {tab === "annual"
              ? annual.map((r, i) => {
                  const beg = i === 0 ? rows[0]?.balance + rows[0]?.principal : annual[i - 1].endBalance;
                  return (
                    <tr key={i}>
                      <td>{r.year}</td>
                      <td>{ccy(beg)}</td>
                      <td>{ccy(r.interest)}</td>
                      <td>{ccy(r.principal)}</td>
                      <td>{ccy(r.endBalance)}</td>
                    </tr>
                  );
                })
              : perPeriod.map((r, i) => (
                  <tr key={i}>
                    <td>{r.n}</td>
                    <td>{ccy(r.begBalance)}</td>
                    <td>{ccy(r.interest)}</td>
                    <td>{ccy(r.principal)}</td>
                    <td>{ccy(r.balance)}</td>
                  </tr>
                ))
            }
          </tbody>
        </table>
        {tab === "period" && capped && (
          <div style={{ padding: "10px 14px", fontSize: 12.5, color: "#6b7a9e", background: "#f5f3ff", borderRadius: "0 0 12px 12px" }}>
            Showing first {MAX_ROWS} of {rows.length} payment periods.
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   COMPOUND GROWTH SCHEDULE TABLE (Sections B & C)
══════════════════════════════════════════════════════ */
function GrowthTable({ schedule, principalLabel }) {
  return (
    <div style={{ marginTop: 20, borderTop: "1px solid rgba(99,102,241,0.1)", paddingTop: 16 }}>
      <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              <th>Year</th>
              <th>{principalLabel}</th>
              <th>Interest Accumulated</th>
              <th>Balance / Value</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((r, i) => (
              <tr key={i}>
                <td>{r.year === 0 ? "Start" : r.year}</td>
                <td>{ccy(r.principal)}</td>
                <td>{ccy(r.interest)}</td>
                <td>{ccy(r.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   COMMON TERM INPUTS (years + months side by side)
══════════════════════════════════════════════════════ */
function TermFields({ years, months, onYears, onMonths }) {
  return (
    <div style={{ marginBottom: 11 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6b7a9e", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.4px" }}>
        Loan Term
      </label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <input style={{ ...IST, textAlign: "center" }} type="number" min="0" value={years} onChange={(e) => onYears(e.target.value)} />
          <span style={{ color: "#6b7a9e", fontWeight: 600, fontSize: 12, whiteSpace: "nowrap" }}>Yrs</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <input style={{ ...IST, textAlign: "center" }} type="number" min="0" max="11" value={months} onChange={(e) => onMonths(e.target.value)} />
          <span style={{ color: "#6b7a9e", fontWeight: 600, fontSize: 12, whiteSpace: "nowrap" }}>Mo</span>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   CALCULATE / CLEAR BUTTON ROW
══════════════════════════════════════════════════════ */
function CalcBtns({ onCalc, onClear }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
      <button className="btn" style={{ width: "100%" }} onClick={onCalc}>Calculate</button>
      <button
        type="button"
        onClick={onClear}
        style={{ width: "100%", padding: "9px", borderRadius: 12, border: "1.5px solid rgba(99,102,241,0.22)", background: "#fff", color: "#6b7a9e", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
      >
        Clear
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
export default function LoanCalculator() {
  /* ── Section A: Amortized Loan ── */
  const [aAmt,      setAAmt]      = useState("10,000");
  const [aYears,    setAYears]    = useState("5");
  const [aMonths,   setAMonths]   = useState("0");
  const [aRate,     setARate]     = useState("6");
  const [aCompound, setACompound] = useState("monthly");
  const [aPayback,  setAPayback]  = useState("monthly");
  const [aResult,   setAResult]   = useState(null);
  const [aErr,      setAErr]      = useState("");
  const [aTable,    setATable]    = useState(false);
  const [aTab,      setATab]      = useState("annual");
  const aTableRef = useRef(null);

  /* ── Section B: Deferred Payment Loan ── */
  const [bAmt,      setBBmt]      = useState("10,000");
  const [bYears,    setBYears]    = useState("5");
  const [bMonths,   setBMonths]   = useState("0");
  const [bRate,     setBRate]     = useState("6");
  const [bCompound, setBCompound] = useState("monthly");
  const [bResult,   setBResult]   = useState(null);
  const [bErr,      setBErr]      = useState("");
  const [bTable,    setBTable]    = useState(false);
  const bTableRef = useRef(null);

  /* ── Section C: Bond (Present Value) ── */
  const [cDue,      setCDue]      = useState("20,000");
  const [cYears,    setCYears]    = useState("5");
  const [cMonths,   setCMonths]   = useState("0");
  const [cRate,     setCRate]     = useState("6");
  const [cCompound, setCCompound] = useState("monthly");
  const [cResult,   setCResult]   = useState(null);
  const [cErr,      setCErr]      = useState("");
  const [cTable,    setCTable]    = useState(false);
  const cTableRef = useRef(null);

  /* ════════════════════════════════════════════
     SECTION A — AMORTIZED LOAN
  ════════════════════════════════════════════ */
  const calcA = () => {
    setAErr("");
    const P    = parseN(aAmt);
    const apr  = parseN(aRate);
    const cf   = getCF(aCompound);
    const pf   = getPF(aPayback);
    const n    = totalN(aYears, aMonths, pf);

    if (!(P > 0))   { setAErr("Loan amount must be greater than 0."); return; }
    if (apr < 0)    { setAErr("Interest rate cannot be negative."); return; }
    if (n <= 0)     { setAErr("Loan term must be at least 1 month."); return; }

    const r = periodR(apr, cf, pf);
    const payment = r === 0 ? P / n : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment  = payment * n;
    const totalInterest = totalPayment - P;

    /* Build per-payment amortization rows */
    let balance = P, cumInt = 0;
    const rows = [];
    for (let i = 0; i < n && balance > 0.005; i++) {
      const beg     = balance;
      const intPay  = balance * r;
      let   prinPay = payment - intPay;
      if (prinPay > balance) prinPay = balance;
      balance = Math.max(balance - prinPay, 0);
      cumInt += intPay;
      rows.push({ n: i + 1, begBalance: beg, interest: intPay, principal: prinPay, balance, cumInt });
    }

    setAResult({ P, payment, totalPayment, totalInterest, n, pf, rows });
    setATable(false);
    setATab("annual");
  };

  const clearA = () => { setAAmt("10,000"); setAYears("5"); setAMonths("0"); setARate("6"); setACompound("monthly"); setAPayback("monthly"); setAResult(null); setAErr(""); setATable(false); };

  /* ════════════════════════════════════════════
     SECTION B — DEFERRED PAYMENT LOAN
  ════════════════════════════════════════════ */
  const calcB = () => {
    setBErr("");
    const P   = parseN(bAmt);
    const apr = parseN(bRate);
    const cf  = getCF(bCompound);
    const totalYears = parseN(bYears) + parseN(bMonths) / 12;

    if (!(P > 0))          { setBErr("Loan amount must be greater than 0."); return; }
    if (apr < 0)           { setBErr("Interest rate cannot be negative."); return; }
    if (!(totalYears > 0)) { setBErr("Loan term must be at least 1 month."); return; }

    const amountDue     = cmpBal(P, apr, cf, totalYears);
    const totalInterest = amountDue - P;

    /* Annual growth schedule */
    const numYears = Math.ceil(totalYears);
    const schedule = Array.from({ length: numYears + 1 }, (_, t) => {
      const yr  = Math.min(t, totalYears);
      const bal = cmpBal(P, apr, cf, yr);
      return { year: t, principal: P, interest: bal - P, balance: bal };
    });
    // Ensure the last row is exact maturity
    schedule[schedule.length - 1] = { year: numYears, principal: P, interest: totalInterest, balance: amountDue };

    setBResult({ P, amountDue, totalInterest, schedule });
    setBTable(false);
  };

  const clearB = () => { setBBmt("10,000"); setBYears("5"); setBMonths("0"); setBRate("6"); setBCompound("monthly"); setBResult(null); setBErr(""); setBTable(false); };

  /* ════════════════════════════════════════════
     SECTION C — BOND (Present Value)
  ════════════════════════════════════════════ */
  const calcC = () => {
    setCErr("");
    const FV  = parseN(cDue);
    const apr = parseN(cRate);
    const cf  = getCF(cCompound);
    const totalYears = parseN(cYears) + parseN(cMonths) / 12;

    if (!(FV > 0))         { setCErr("Due amount must be greater than 0."); return; }
    if (apr < 0)           { setCErr("Interest rate cannot be negative."); return; }
    if (!(totalYears > 0)) { setCErr("Loan term must be at least 1 month."); return; }

    /* PV = FV / (1 + r/cf)^(cf×t)   or   FV × e^(-r×t) for continuous */
    const pv = !isFinite(cf)
      ? FV * Math.exp(-(apr / 100) * totalYears)
      : FV / Math.pow(1 + apr / 100 / cf, cf * totalYears);
    const totalInterest = FV - pv;

    /* Annual schedule: PV grows to FV */
    const numYears = Math.ceil(totalYears);
    const schedule = Array.from({ length: numYears + 1 }, (_, t) => {
      const yr  = Math.min(t, totalYears);
      const val = cmpBal(pv, apr, cf, yr);
      return { year: t, principal: pv, interest: val - pv, balance: val };
    });
    schedule[schedule.length - 1] = { year: numYears, principal: pv, interest: totalInterest, balance: FV };

    setCResult({ FV, pv, totalInterest, schedule });
    setCTable(false);
  };

  const clearC = () => { setCDue("20,000"); setCYears("5"); setCMonths("0"); setCRate("6"); setCCompound("monthly"); setCResult(null); setCErr(""); setCTable(false); };

  /* ════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════ */
  const scrollTo = (ref) => setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Loan Calculator</h1>
        <p className="muted">
          Three loan types: a standard amortized loan, a deferred-payment (lump-sum) loan, and a bond
          (present-value) calculation — each with full amortization/schedule tables.
        </p>
      </header>

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* ══════════════════════════════════════════
            SECTION A — AMORTIZED LOAN
        ══════════════════════════════════════════ */}
        <SectionCard
          title="Amortized Loan: Fixed Periodic Payments"
          subtitle="Classic installment loan — equal payments of principal + interest until fully paid off."
        >
          <div style={{ display: "flex", gap: 28, alignItems: "flex-start", flexWrap: "wrap" }}>
            {/* ─── A INPUTS ─── */}
            <div style={{ flex: "0 0 280px", minWidth: 240 }}>
              <Field label="Loan Amount" pre="$">
                <input style={IST} value={aAmt} onChange={(e) => setAAmt(e.target.value)}
                  onBlur={(e) => { const v = parseN(e.target.value); if (v) setAAmt(v.toLocaleString("en-US", { maximumFractionDigits: 0 })); }} />
              </Field>

              <TermFields years={aYears} months={aMonths} onYears={setAYears} onMonths={setAMonths} />

              <Field label="Interest Rate" suf="%">
                <input style={{ ...IST, textAlign: "right" }} value={aRate} onChange={(e) => setARate(e.target.value)} />
              </Field>

              <Field label="Compound">
                <select style={{ ...IST, cursor: "pointer" }} value={aCompound} onChange={(e) => setACompound(e.target.value)}>
                  {COMPOUND_OPTS.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
              </Field>

              <Field label="Pay Back">
                <select style={{ ...IST, cursor: "pointer" }} value={aPayback} onChange={(e) => setAPayback(e.target.value)}>
                  {PAYBACK_OPTS.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
              </Field>

              <ErrBox msg={aErr} />
              <CalcBtns onCalc={calcA} onClear={clearA} />
            </div>

            {/* ─── A RESULTS ─── */}
            {aResult ? (
              <div style={{ flex: 1, minWidth: 260 }}>
                <ResHeader label={getPL(aPayback)} value={ccy(aResult.payment)} />

                <table className="kv-table">
                  <tbody>
                    <tr>
                      <td>Total of {aResult.n} Payments</td>
                      <td>{ccy(aResult.totalPayment)}</td>
                    </tr>
                    <tr>
                      <td>Total Interest</td>
                      <td>{ccy(aResult.totalInterest)}</td>
                    </tr>
                    <tr>
                      <td>Loan Amount</td>
                      <td>{ccy(aResult.P)}</td>
                    </tr>
                  </tbody>
                </table>

                <ChartBlock
                  principal={aResult.P}
                  interest={aResult.totalInterest}
                  principalLabel="Principal"
                  interestLabel="Total Interest"
                />

                <button
                  className="link-btn"
                  style={{ marginTop: 14 }}
                  onClick={() => { setATable((v) => { const next = !v; if (!v) scrollTo(aTableRef); return next; }); }}
                >
                  {aTable ? "Hide Amortization Table ↑" : "View Amortization Table ↓"}
                </button>
              </div>
            ) : <NoResult />}
          </div>

          {/* ─── A AMORTIZATION TABLE ─── */}
          {aResult && aTable && (
            <div ref={aTableRef}>
              <AmorTable rows={aResult.rows} payFreq={aResult.pf} tab={aTab} setTab={setATab} />
            </div>
          )}
        </SectionCard>

        {/* ══════════════════════════════════════════
            SECTION B — DEFERRED PAYMENT LOAN
        ══════════════════════════════════════════ */}
        <SectionCard
          title="Deferred Payment Loan: Lump Sum Due at Maturity"
          subtitle="No periodic payments — the principal plus all accumulated interest is due in full at the end of the term."
        >
          <div style={{ display: "flex", gap: 28, alignItems: "flex-start", flexWrap: "wrap" }}>
            {/* ─── B INPUTS ─── */}
            <div style={{ flex: "0 0 280px", minWidth: 240 }}>
              <Field label="Loan Amount" pre="$">
                <input style={IST} value={bAmt} onChange={(e) => setBBmt(e.target.value)}
                  onBlur={(e) => { const v = parseN(e.target.value); if (v) setBBmt(v.toLocaleString("en-US", { maximumFractionDigits: 0 })); }} />
              </Field>

              <TermFields years={bYears} months={bMonths} onYears={setBYears} onMonths={setBMonths} />

              <Field label="Interest Rate" suf="%">
                <input style={{ ...IST, textAlign: "right" }} value={bRate} onChange={(e) => setBRate(e.target.value)} />
              </Field>

              <Field label="Compound">
                <select style={{ ...IST, cursor: "pointer" }} value={bCompound} onChange={(e) => setBCompound(e.target.value)}>
                  {COMPOUND_OPTS.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
              </Field>

              <ErrBox msg={bErr} />
              <CalcBtns onCalc={calcB} onClear={clearB} />
            </div>

            {/* ─── B RESULTS ─── */}
            {bResult ? (
              <div style={{ flex: 1, minWidth: 260 }}>
                <ResHeader label="Amount Due at Loan Maturity" value={ccy(bResult.amountDue)} />

                <table className="kv-table">
                  <tbody>
                    <tr>
                      <td>Loan Amount (Principal)</td>
                      <td>{ccy(bResult.P)}</td>
                    </tr>
                    <tr>
                      <td>Total Interest</td>
                      <td>{ccy(bResult.totalInterest)}</td>
                    </tr>
                    <tr>
                      <td>Amount Due at Maturity</td>
                      <td><strong>{ccy(bResult.amountDue)}</strong></td>
                    </tr>
                  </tbody>
                </table>

                <ChartBlock
                  principal={bResult.P}
                  interest={bResult.totalInterest}
                  principalLabel="Principal"
                  interestLabel="Interest at Maturity"
                />

                <button
                  className="link-btn"
                  style={{ marginTop: 14 }}
                  onClick={() => { setBTable((v) => { const next = !v; if (!v) scrollTo(bTableRef); return next; }); }}
                >
                  {bTable ? "Hide Schedule Table ↑" : "View Schedule Table ↓"}
                </button>
              </div>
            ) : <NoResult />}
          </div>

          {/* ─── B SCHEDULE TABLE ─── */}
          {bResult && bTable && (
            <div ref={bTableRef}>
              <GrowthTable schedule={bResult.schedule} principalLabel="Principal Borrowed" />
            </div>
          )}
        </SectionCard>

        {/* ══════════════════════════════════════════
            SECTION C — BOND (PRESENT VALUE)
        ══════════════════════════════════════════ */}
        <SectionCard
          title="Bond: Predetermined Amount Due at Maturity"
          subtitle="Given a target amount due at maturity, calculate how much a lender provides today (present value)."
        >
          <div style={{ display: "flex", gap: 28, alignItems: "flex-start", flexWrap: "wrap" }}>
            {/* ─── C INPUTS ─── */}
            <div style={{ flex: "0 0 280px", minWidth: 240 }}>
              <Field label="Predetermined Due Amount" pre="$">
                <input style={IST} value={cDue} onChange={(e) => setCDue(e.target.value)}
                  onBlur={(e) => { const v = parseN(e.target.value); if (v) setCDue(v.toLocaleString("en-US", { maximumFractionDigits: 0 })); }} />
              </Field>

              <TermFields years={cYears} months={cMonths} onYears={setCYears} onMonths={setCMonths} />

              <Field label="Interest Rate" suf="%">
                <input style={{ ...IST, textAlign: "right" }} value={cRate} onChange={(e) => setCRate(e.target.value)} />
              </Field>

              <Field label="Compound">
                <select style={{ ...IST, cursor: "pointer" }} value={cCompound} onChange={(e) => setCCompound(e.target.value)}>
                  {COMPOUND_OPTS.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
              </Field>

              <ErrBox msg={cErr} />
              <CalcBtns onCalc={calcC} onClear={clearC} />
            </div>

            {/* ─── C RESULTS ─── */}
            {cResult ? (
              <div style={{ flex: 1, minWidth: 260 }}>
                <ResHeader label="Amount Received When Loan Starts" value={ccy(cResult.pv)} />

                <table className="kv-table">
                  <tbody>
                    <tr>
                      <td>Amount Received (Present Value)</td>
                      <td><strong>{ccy(cResult.pv)}</strong></td>
                    </tr>
                    <tr>
                      <td>Total Interest Earned</td>
                      <td>{ccy(cResult.totalInterest)}</td>
                    </tr>
                    <tr>
                      <td>Due at Maturity</td>
                      <td>{ccy(cResult.FV)}</td>
                    </tr>
                  </tbody>
                </table>

                <ChartBlock
                  principal={cResult.pv}
                  interest={cResult.totalInterest}
                  principalLabel="Amount Received"
                  interestLabel="Interest Earned"
                />

                <button
                  className="link-btn"
                  style={{ marginTop: 14 }}
                  onClick={() => { setCTable((v) => { const next = !v; if (!v) scrollTo(cTableRef); return next; }); }}
                >
                  {cTable ? "Hide Schedule Table ↑" : "View Schedule Table ↓"}
                </button>
              </div>
            ) : <NoResult />}
          </div>

          {/* ─── C SCHEDULE TABLE ─── */}
          {cResult && cTable && (
            <div ref={cTableRef}>
              <GrowthTable schedule={cResult.schedule} principalLabel="Amount Received" />
            </div>
          )}
        </SectionCard>

      </div>
    </div>
  );
}
