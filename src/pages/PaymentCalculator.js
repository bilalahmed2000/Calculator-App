import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

/* ══════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════ */
const parseNum = (s) => {
  const v = parseFloat(String(s ?? "").replace(/,/g, ""));
  return isNaN(v) ? 0 : v;
};
const ccy = (n) => {
  if (!isFinite(n) || isNaN(n)) return "$0.00";
  return "$" + Math.max(n, 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const fmtTerm = (months) => {
  const totalMonths = Math.round(months);
  const y = Math.floor(totalMonths / 12);
  const m = totalMonths % 12;
  if (!y) return `${m} month${m !== 1 ? "s" : ""}`;
  if (!m) return `${y} year${y !== 1 ? "s" : ""}`;
  return `${y} year${y !== 1 ? "s" : ""} ${m} month${m !== 1 ? "s" : ""}`;
};

/* ══════════════════════════════════════════════════════
   CORE CALCULATIONS
══════════════════════════════════════════════════════ */
/** Standard fixed-rate monthly payment — no rounding */
const calcPayment = (P, apr, n) => {
  if (P <= 0 || n <= 0) return 0;
  const r = apr / 100 / 12;
  if (r === 0) return P / n;
  return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
};

/**
 * Build full amortization schedule from principal + exact monthly payment.
 * Totals are derived from schedule rows (not formula) so they match calculator.net.
 */
const buildSchedule = (P, payment, apr) => {
  const r = apr / 100 / 12;
  const rows = [];
  let bal = P;
  let cumInt = 0;
  const cap = 1200; // 100 years safety

  for (let m = 1; m <= cap && bal > 0.005; m++) {
    const intP  = bal * r;
    // Last payment: principal is exactly remaining balance
    const prinP = Math.min(Math.max(payment - intP, 0), bal);
    bal        = Math.max(bal - prinP, 0);
    cumInt    += intP;
    rows.push({
      month:      m,
      year:       Math.ceil(m / 12),
      interest:   intP,
      principal:  prinP,
      endBalance: bal,
      cumInterest: cumInt,
    });
    if (bal <= 0) break;
  }

  /* Annual aggregation */
  let runCumInt = 0;
  const annualRows = [];
  for (let start = 0; start < rows.length; start += 12) {
    const slice  = rows.slice(start, start + 12);
    const yrInt  = slice.reduce((s, row) => s + row.interest,  0);
    const yrPrin = slice.reduce((s, row) => s + row.principal, 0);
    runCumInt += yrInt;
    annualRows.push({
      year:        Math.floor(start / 12) + 1,
      interest:    yrInt,
      principal:   yrPrin,
      endBalance:  slice[slice.length - 1].endBalance,
      cumInterest: runCumInt,
    });
  }

  return { rows, annualRows };
};

/* ══════════════════════════════════════════════════════
   SVG DONUT CHART  (principal vs interest)
══════════════════════════════════════════════════════ */
function DonutChart({ principal, interest }) {
  const total = principal + interest;
  if (!total) return null;
  const cx = 80, cy = 80, ro = 66, ri = 42;
  const f  = (v) => v.toFixed(3);

  const arc = (startDeg, sweepDeg, color) => {
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
    const d  = `M${f(ox1)} ${f(oy1)} A${ro} ${ro} 0 ${lg} 1 ${f(ox2)} ${f(oy2)} L${f(ix1)} ${f(iy1)} A${ri} ${ri} 0 ${lg} 0 ${f(ix2)} ${f(iy2)}Z`;
    return <path key={color} d={d} fill={color} stroke="#fff" strokeWidth={2} />;
  };

  const pAngle = (principal / total) * 360;

  if (interest <= 0.01) {
    return (
      <svg viewBox="0 0 160 160" style={{ width: 144, height: 144 }}>
        <circle cx={cx} cy={cy} r={ro} fill="#4f46e5" />
        <circle cx={cx} cy={cy} r={ri} fill="#fff" />
        <text x={cx} y={cy - 3} textAnchor="middle" fontSize={9} fill="#1e1b4b" fontWeight="800">{ccy(total)}</text>
        <text x={cx} y={cy + 11} textAnchor="middle" fontSize={8} fill="#6b7a9e">total</text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 160 160" style={{ width: 144, height: 144 }}>
      {arc(0, pAngle, "#4f46e5")}
      {arc(pAngle, 360 - pAngle, "#f59e0b")}
      <circle cx={cx} cy={cy} r={ri} fill="#fff" />
      <text x={cx} y={cy - 3} textAnchor="middle" fontSize={9} fill="#1e1b4b" fontWeight="800">{ccy(total)}</text>
      <text x={cx} y={cy + 11} textAnchor="middle" fontSize={8} fill="#6b7a9e">total</text>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   SVG LINE CHART  (balance + cumulative interest by year)
══════════════════════════════════════════════════════ */
function AmorLineChart({ annualRows, loanAmount }) {
  if (!annualRows || annualRows.length < 2) return null;
  const W = 560, H = 200, PL = 68, PB = 30, PT = 22, PR = 14;
  const cW = W - PL - PR, cH = H - PB - PT;
  const n   = annualRows.length;
  const maxV = loanAmount * 1.1 || 1;

  const toX = (i) => PL + (i / Math.max(n - 1, 1)) * cW;
  const toY = (v) => PT + cH - (Math.max(v, 0) / maxV) * cH;

  const balPts = annualRows.map((r, i) => `${toX(i).toFixed(1)},${toY(r.endBalance).toFixed(1)}`).join(" ");
  const intPts = annualRows.map((r, i) => `${toX(i).toFixed(1)},${toY(r.cumInterest).toFixed(1)}`).join(" ");

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((p) => ({ v: maxV * p, y: toY(maxV * p) }));
  const step   = Math.max(1, Math.floor(n / 7));
  const xLbls  = annualRows
    .filter((_, i) => i === 0 || i % step === 0 || i === n - 1)
    .map((r) => ({ label: String(r.year), x: toX(annualRows.indexOf(r)) }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W, height: "auto", display: "block" }}>
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={PL} y1={t.y} x2={W - PR} y2={t.y} stroke="#f1f0fe" strokeWidth={1} />
          <text x={PL - 5} y={t.y + 3.5} textAnchor="end" fontSize={8.5} fill="#9ca3af">
            {t.v >= 1e6 ? `${(t.v / 1e6).toFixed(1)}M` : t.v >= 1000 ? `${(t.v / 1000).toFixed(0)}k` : t.v.toFixed(0)}
          </text>
        </g>
      ))}
      <line x1={PL} y1={PT}     x2={PL}     y2={H - PB} stroke="#e5e7eb" strokeWidth={1} />
      <line x1={PL} y1={H - PB} x2={W - PR} y2={H - PB} stroke="#e5e7eb" strokeWidth={1} />
      <polyline points={balPts} fill="none" stroke="#4f46e5" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      <polyline points={intPts} fill="none" stroke="#f59e0b" strokeWidth={2}   strokeLinejoin="round" strokeLinecap="round" />
      {xLbls.map((xl, i) => (
        <text key={i} x={xl.x} y={H - PB + 14} textAnchor="middle" fontSize={8.5} fill="#9ca3af">{xl.label}</text>
      ))}
      <rect x={PL + 4}   y={PT} width={12} height={4} rx={2} fill="#4f46e5" />
      <text x={PL + 20}  y={PT + 4} fontSize={9} fill="#4b5280">Balance</text>
      <rect x={PL + 82}  y={PT} width={12} height={4} rx={2} fill="#f59e0b" />
      <text x={PL + 98}  y={PT + 4} fontSize={9} fill="#4b5280">Cumulative Interest</text>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
export default function PaymentCalculator() {
  /* ── tab ── */
  const [tab, setTab] = useState("fixed-term");

  /* ── Fixed Term inputs: Loan Amount + Term + Rate → Monthly Payment ── */
  const [ftAmount, setFtAmount] = useState("200,000");
  const [ftTerm,   setFtTerm]   = useState("15");
  const [ftRate,   setFtRate]   = useState("6");

  /* ── Fixed Payments inputs: Loan Amount + Monthly Pay + Rate → Payoff Time ── */
  const [fpAmount, setFpAmount] = useState("200,000");
  const [fpPay,    setFpPay]    = useState("1,687.71");
  const [fpRate,   setFpRate]   = useState("6");

  /* ── output ── */
  const [result,   setResult]   = useState(null);
  const [err,      setErr]      = useState("");
  const [schedTab, setSchedTab] = useState("annual");
  const schedRef = useRef(null);

  /* ══════════════════════════════════════════════
     CALCULATE
  ══════════════════════════════════════════════ */
  const calculate = () => {
    setErr("");

    if (tab === "fixed-term") {
      const P   = parseNum(ftAmount);
      const yrs = parseNum(ftTerm);
      const apr = parseNum(ftRate);
      const n   = Math.round(yrs * 12);

      if (!(P > 0))   { setErr("Loan amount must be greater than 0."); return; }
      if (!(yrs > 0)) { setErr("Loan term must be at least 1 month."); return; }
      if (apr < 0)    { setErr("Interest rate cannot be negative."); return; }

      const payment = calcPayment(P, apr, n);
      const { rows, annualRows } = buildSchedule(P, payment, apr);
      // Totals derived from schedule for accuracy (matches calculator.net)
      const totalInterest = rows.reduce((s, r) => s + r.interest, 0);
      const totalPayments = P + totalInterest;

      setResult({ tab, loanAmount: P, payment, n, totalPayments, totalInterest, rows, annualRows, apr, yrs });

    } else {
      /* Fixed Payments: Loan Amount + Monthly Pay + Rate → payoff time */
      const P   = parseNum(fpAmount);
      const M   = parseNum(fpPay);
      const apr = parseNum(fpRate);
      const r   = apr / 100 / 12;

      if (!(P > 0)) { setErr("Loan amount must be greater than 0."); return; }
      if (!(M > 0)) { setErr("Monthly payment must be greater than 0."); return; }
      if (apr < 0)  { setErr("Interest rate cannot be negative."); return; }
      if (r > 0 && M <= P * r) {
        setErr(`Monthly payment must exceed the monthly interest of ${ccy(P * r)}.`);
        return;
      }

      // Logarithmic formula for number of months
      let n;
      if (r === 0) {
        n = P / M;
      } else {
        n = Math.log(M / (M - P * r)) / Math.log(1 + r);
      }
      n = Math.ceil(n); // round up to whole months

      const { rows, annualRows } = buildSchedule(P, M, apr);
      const totalInterest = rows.reduce((s, row) => s + row.interest, 0);
      const totalPayments = P + totalInterest;
      const yrs = n / 12;

      setResult({ tab, loanAmount: P, payment: M, n, totalPayments, totalInterest, rows, annualRows, apr, yrs });
    }
  };

  const clear = () => {
    if (tab === "fixed-term") {
      setFtAmount("200,000"); setFtTerm("15"); setFtRate("6");
    } else {
      setFpAmount("200,000"); setFpPay("1,687.71"); setFpRate("6");
    }
    setResult(null); setErr("");
  };

  const onKey = (e) => { if (e.key === "Enter") calculate(); };

  /* ── style atoms ── */
  const ist  = { width: "100%", background: "#f8f9ff", color: "#1e1b4b", border: "1.5px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: "9px 12px", fontSize: 14, fontWeight: 600, outline: "none", boxSizing: "border-box" };
  const lst  = { display: "block", fontSize: 11, fontWeight: 700, color: "#6b7a9e", marginBottom: 5, letterSpacing: "0.4px", textTransform: "uppercase" };
  const fst  = { marginBottom: 14 };
  const sym  = { color: "#6b7a9e", fontWeight: 700, flexShrink: 0, fontSize: 14 };
  const irow = (ch) => <div style={{ display: "flex", alignItems: "center", gap: 6 }}>{ch}</div>;

  /* tab button */
  const tabSt = (active) => ({
    flex: 1, padding: "11px 8px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13.5,
    minHeight: 44,
    background: active ? "#4f46e5" : "#ede9fe",
    color:      active ? "#fff"    : "#4b5280",
    transition: "background 0.2s, color 0.2s",
  });

  /* ══════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════ */
  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Payment Calculator</h1>
        <p className="muted">
          The Payment Calculator can determine the monthly payment amount or loan term for a fixed-rate loan.
          Use the <em>Fixed Term</em> tab to calculate monthly payment, or the <em>Fixed Payments</em> tab
          to calculate how long it takes to pay off a loan with a set monthly payment.
        </p>
      </header>

      {/* Blue instruction bar */}
      <div style={{ maxWidth: 1100, margin: "-8px auto 20px", background: "linear-gradient(135deg,#3b82f6,#6366f1)", borderRadius: 12, padding: "11px 20px", display: "flex", alignItems: "center", gap: 10, color: "#fff", fontSize: 13.5, fontWeight: 600 }}>
        <span style={{ fontSize: 18, lineHeight: 1 }}>↓</span>
        Modify the values and click the <strong style={{ margin: "0 4px" }}>Calculate</strong> button to use
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* ══ TOP ROW: Form + Results ══ */}
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 20 }}>

          {/* ─── INPUT FORM ─── */}
          <section className="card" style={{ flex: "0 0 296px", minWidth: 260, paddingTop: 0 }}>

            {/* Tab bar */}
            <div role="tablist" style={{ display: "flex", margin: "-22px -22px 20px", borderBottom: "2px solid rgba(99,102,241,0.15)", borderRadius: "16px 16px 0 0", overflow: "hidden" }}>
              <button role="tab" aria-selected={tab === "fixed-term"}     style={tabSt(tab === "fixed-term")}     onClick={() => { setTab("fixed-term");     setResult(null); setErr(""); }}>Fixed Term</button>
              <button role="tab" aria-selected={tab === "fixed-payments"} style={tabSt(tab === "fixed-payments")} onClick={() => { setTab("fixed-payments"); setResult(null); setErr(""); }}>Fixed Payments</button>
            </div>

            {tab === "fixed-term" ? (
              <>
                <div style={fst}>
                  <label style={lst}>Loan Amount</label>
                  {irow(<><span style={sym}>$</span><input style={ist} value={ftAmount} onChange={(e) => setFtAmount(e.target.value)} onKeyDown={onKey} /></>)}
                </div>
                <div style={fst}>
                  <label style={lst}>Loan Term</label>
                  {irow(<><input style={{ ...ist, textAlign: "center" }} type="number" min="1" max="100" value={ftTerm} onChange={(e) => setFtTerm(e.target.value)} onKeyDown={onKey} /><span style={{ color: "#4b5280", fontWeight: 600, flexShrink: 0 }}>years</span></>)}
                </div>
                <div style={fst}>
                  <label style={lst}>Interest Rate (APR)</label>
                  {irow(<><input style={{ ...ist, textAlign: "right" }} value={ftRate} onChange={(e) => setFtRate(e.target.value)} onKeyDown={onKey} /><span style={sym}>%</span></>)}
                </div>
              </>
            ) : (
              <>
                <div style={fst}>
                  <label style={lst}>Loan Amount</label>
                  {irow(<><span style={sym}>$</span><input style={ist} value={fpAmount} onChange={(e) => setFpAmount(e.target.value)} onKeyDown={onKey} /></>)}
                </div>
                <div style={fst}>
                  <label style={lst}>Monthly Payment</label>
                  {irow(<><span style={sym}>$</span><input style={ist} value={fpPay} onChange={(e) => setFpPay(e.target.value)} onKeyDown={onKey} /></>)}
                </div>
                <div style={fst}>
                  <label style={lst}>Interest Rate (APR)</label>
                  {irow(<><input style={{ ...ist, textAlign: "right" }} value={fpRate} onChange={(e) => setFpRate(e.target.value)} onKeyDown={onKey} /><span style={sym}>%</span></>)}
                </div>
              </>
            )}

            {err && <div className="rng-error" style={{ marginBottom: 12 }}>{err}</div>}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 4 }}>
              <button
                className="btn"
                style={{ width: "100%", padding: "11px", background: "linear-gradient(135deg,#22c55e,#16a34a)", boxShadow: "0 4px 12px rgba(34,197,94,0.3)" }}
                onClick={calculate}
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={clear}
                style={{ width: "100%", padding: "11px", borderRadius: 12, border: "1.5px solid rgba(99,102,241,0.22)", background: "#fff", color: "#6b7a9e", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
              >
                Clear
              </button>
            </div>
          </section>

          {/* ─── RESULTS ─── */}
          {result ? (
            <section className="card" style={{ flex: 1, minWidth: 280 }}>
              {/* Green header */}
              <div className="result-header" style={{ fontSize: 19, marginBottom: 16 }}>
                {result.tab === "fixed-term"
                  ? <>Monthly Payment: <strong>{ccy(result.payment)}</strong></>
                  : <>Payoff Time: <strong>{fmtTerm(result.n)}</strong></>
                }
              </div>

              {/* Description sentence */}
              <p style={{ fontSize: 13.5, color: "#374151", marginBottom: 18, lineHeight: 1.6 }}>
                {result.tab === "fixed-term"
                  ? <>You will need to pay <strong>{ccy(result.payment)}</strong> every month for <strong>{fmtTerm(result.n)}</strong> to pay off the debt.</>
                  : <>With a monthly payment of <strong>{ccy(result.payment)}</strong>, you will pay off the <strong>{ccy(result.loanAmount)}</strong> loan in <strong>{fmtTerm(result.n)}</strong>.</>
                }
              </p>

              {/* Breakdown table + donut side-by-side */}
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <table className="kv-table">
                    <tbody>
                      <tr>
                        <td>Total of {result.n} Payments</td>
                        <td>{ccy(result.totalPayments)}</td>
                      </tr>
                      <tr>
                        <td>Total Interest</td>
                        <td>{ccy(result.totalInterest)}</td>
                      </tr>
                      <tr>
                        <td>Total Principal</td>
                        <td>{ccy(result.loanAmount)}</td>
                      </tr>
                    </tbody>
                  </table>

                  <button
                    className="link-btn"
                    style={{ marginTop: 16, display: "block" }}
                    onClick={() => schedRef.current?.scrollIntoView({ behavior: "smooth" })}
                  >
                    View Amortization Schedule ↓
                  </button>
                </div>

                {/* Donut + legend */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
                    Loan Breakdown
                  </div>
                  <DonutChart principal={result.loanAmount} interest={result.totalInterest} />
                  <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                    {[
                      { color: "#4f46e5", label: "Principal", val: result.loanAmount    },
                      { color: "#f59e0b", label: "Interest",  val: result.totalInterest },
                    ].map((s) => (
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
            <section className="card" style={{ flex: 1, minWidth: 260, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200 }}>
              <div style={{ textAlign: "center" }}>
                <svg viewBox="0 0 24 24" style={{ width: 50, height: 50, marginBottom: 14 }} fill="none" stroke="#c4b5fd" strokeWidth={1.4}>
                  <rect x="2" y="5" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="2" y1="10" x2="22" y2="10" strokeLinecap="round" />
                </svg>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#9ca3af" }}>Enter values and press <strong>Calculate</strong></div>
              </div>
            </section>
          )}
        </div>

        {/* ══ AMORTIZATION SCHEDULE (lower half) ══ */}
        {result && (
          <section className="card" ref={schedRef} style={{ marginBottom: 24 }}>
            <h2 className="card-title" style={{ marginBottom: 6 }}>Amortization Schedule</h2>
            <p style={{ fontSize: 13, color: "#6b7a9e", marginBottom: 20 }}>
              {ccy(result.loanAmount)} loan at {result.apr}% APR — {ccy(result.payment)}/mo for {fmtTerm(result.n)}.
            </p>

            {/* Line chart */}
            <div style={{ marginBottom: 20, overflowX: "auto" }}>
              <AmorLineChart annualRows={result.annualRows} loanAmount={result.loanAmount} />
            </div>

            {/* Chart legend */}
            <div style={{ display: "flex", gap: 22, marginBottom: 20, flexWrap: "wrap" }}>
              {[{ color: "#4f46e5", label: "Remaining Balance" }, { color: "#f59e0b", label: "Cumulative Interest" }].map((l) => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "#6b7a9e" }}>
                  <span style={{ width: 20, height: 4, borderRadius: 2, background: l.color, flexShrink: 0 }} />
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
                      <th>Interest</th>
                      <th>Principal</th>
                      <th>Ending Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.annualRows.map((r) => (
                      <tr key={r.year}>
                        <td>{r.year}</td>
                        <td>{ccy(r.interest)}</td>
                        <td>{ccy(r.principal)}</td>
                        <td>{ccy(r.endBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ fontWeight: 700, background: "#f0eeff" }}>
                      <td>Total</td>
                      <td>{ccy(result.totalInterest)}</td>
                      <td>{ccy(result.loanAmount)}</td>
                      <td>{ccy(0)}</td>
                    </tr>
                  </tfoot>
                </table>
              ) : (
                <>
                  {result.rows.length > 360 && (
                    <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8 }}>Showing first 360 of {result.rows.length} months.</div>
                  )}
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Year</th>
                        <th>Interest</th>
                        <th>Principal</th>
                        <th>Ending Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.rows.slice(0, 360).map((r) => (
                        <tr key={r.month}>
                          <td>{r.month}</td>
                          <td>{r.year}</td>
                          <td>{ccy(r.interest)}</td>
                          <td>{ccy(r.principal)}</td>
                          <td>{ccy(r.endBalance)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ fontWeight: 700, background: "#f0eeff" }}>
                        <td colSpan={2}>Total</td>
                        <td>{ccy(result.totalInterest)}</td>
                        <td>{ccy(result.loanAmount)}</td>
                        <td>{ccy(0)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </>
              )}
            </div>
          </section>
        )}

        {/* ══ RELATED CALCULATORS ══ */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 32 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#6b7a9e", alignSelf: "center" }}>Related:</span>
          {[
            { label: "Loan Calculator",      to: "/loan-calculator" },
            { label: "Auto Loan Calculator", to: "/auto-loan-calculator" },
            { label: "Mortgage Calculator",  to: "/mortgage" },
          ].map(({ label, to }) => (
            <Link key={to} to={to} style={{
              padding: "7px 18px", borderRadius: 999, border: "1.5px solid rgba(99,102,241,0.28)",
              fontSize: 13, fontWeight: 600, color: "#4f46e5", textDecoration: "none", background: "#f5f3ff",
              transition: "background 0.15s",
            }}>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
