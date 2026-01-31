import React, { useMemo, useState } from "react";
import "../css/CalcBase.css";

// ---- helpers ----
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

function formatCurrency(n) {
  if (!isFinite(n)) return "-";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function monthlyPayment(principal, annualRatePct, years) {
  const P = Number(principal || 0);
  const r = Number(annualRatePct || 0) / 100 / 12;
  const n = Math.round(Number(years || 0) * 12);

  if (!P || !n) return 0;
  if (r === 0) return P / n;

  return (P * r) / (1 - Math.pow(1 + r, -n));
}

function buildAmortizationFixedTerm(principal, annualRatePct, years) {
  const P = Number(principal || 0);
  const r = Number(annualRatePct || 0) / 100 / 12;
  const n = Math.round(Number(years || 0) * 12);
  const pay = monthlyPayment(P, annualRatePct, years);

  let balance = P;
  let totalInterest = 0;
  const rows = [];

  for (let i = 1; i <= n; i++) {
    const interest = r === 0 ? 0 : balance * r;
    let principalPaid = pay - interest;
    if (principalPaid > balance) principalPaid = balance;

    balance = balance - principalPaid;
    totalInterest += interest;

    rows.push({
      month: i,
      payment: pay,
      interest,
      principal: principalPaid,
      balance: Math.max(0, balance),
    });

    if (balance <= 0) break;
  }

  return {
    payment: pay,
    totalPayments: pay * rows.length,
    totalInterest,
    months: rows.length,
    rows,
  };
}

// ✅ ADDED: payoff calculation when payment is fixed (Fixed Payments tab)
function buildAmortizationFixedPayment(principal, annualRatePct, payment) {
  const P = Number(principal || 0);
  const r = Number(annualRatePct || 0) / 100 / 12;
  const pay = Number(payment || 0);

  if (!P || !pay) return null;

  // If payment doesn't even cover monthly interest => never pays off
  const firstInterest = r === 0 ? 0 : P * r;
  if (pay <= firstInterest && r !== 0) {
    return { error: "Payment is too low to cover the interest. Loan will never be paid off." };
  }

  let balance = P;
  let totalInterest = 0;
  const rows = [];

  // safety cap (100 years)
  const maxMonths = 1200;

  for (let i = 1; i <= maxMonths; i++) {
    const interest = r === 0 ? 0 : balance * r;
    let principalPaid = pay - interest;

    if (principalPaid > balance) principalPaid = balance;

    balance = balance - principalPaid;
    totalInterest += interest;

    rows.push({
      month: i,
      payment: pay,
      interest,
      principal: principalPaid,
      balance: Math.max(0, balance),
    });

    if (balance <= 0) break;
  }

  if (balance > 0) {
    return { error: "Payoff exceeded 100 years. Increase payment to pay off sooner." };
  }

  const months = rows.length;
  const totalPayments = pay * months;

  return {
    payment: pay,
    months,
    totalPayments,
    totalInterest,
    rows,
  };
}

// ---- donut (SVG) ----
function Donut({ principalPct, interestPct }) {
  const radius = 34;
  const stroke = 12;
  const c = 2 * Math.PI * radius;

  const pLen = (principalPct / 100) * c;
  const iLen = (interestPct / 100) * c;

  const p = Math.round(principalPct);
  const i = Math.round(interestPct);

  const principalColor = "rgba(100, 200, 255, 0.95)";
  const interestColor = "rgba(120, 255, 140, 0.90)";

  return (
    <div className="donut">
      <svg width="110" height="110" viewBox="0 0 110 110">
        <g transform="translate(55 55) rotate(-90)">
          {/* Track */}
          <circle
            r={radius}
            cx="0"
            cy="0"
            fill="transparent"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={stroke}
          />

          {/* Principal */}
          <circle
            r={radius}
            cx="0"
            cy="0"
            fill="transparent"
            stroke={principalColor}
            strokeWidth={stroke}
            strokeDasharray={`${pLen} ${c - pLen}`}
            strokeDashoffset="0"
            strokeLinecap="round"
          />

          {/* Interest */}
          <circle
            r={radius}
            cx="0"
            cy="0"
            fill="transparent"
            stroke={interestColor}
            strokeWidth={stroke}
            strokeDasharray={`${iLen} ${c - iLen}`}
            strokeDashoffset={-pLen}
            strokeLinecap="round"
          />
        </g>

        {/* ✅ Clear labels inside donut */}
        <text
          x="55"
          y="52"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="13"
          fontWeight="800"
          fill="rgba(255,255,255,0.92)"
        >
          <tspan fill={principalColor}>P</tspan>
          <tspan> {p}%</tspan>
        </text>

        <text
          x="55"
          y="70"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="13"
          fontWeight="800"
          fill="rgba(255,255,255,0.86)"
        >
          <tspan fill={interestColor}>I</tspan>
          <tspan> {i}%</tspan>
        </text>
      </svg>

      {/* Legend stays for extra clarity */}
      <div className="donut-legend">
        <div className="legend-item">
          <span className="dot dot-principal" />
          <span>Principal</span>
        </div>
        <div className="legend-item">
          <span className="dot dot-interest" />
          <span>Interest</span>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCalculator() {
  // ✅ ADDED: tab mode
  const [mode, setMode] = useState("fixedTerm"); // ✅ ADDED: 'fixedTerm' | 'fixedPayment'

  // shared inputs
  const [amount, setAmount] = useState(200000);
  const [rate, setRate] = useState(6);

  // Fixed Term inputs
  const [years, setYears] = useState(15);

  // ✅ ADDED: Fixed Payments input
  const [payment, setPayment] = useState(1687.71); // ✅ ADDED: example like screenshot

  // UX
  const [showSchedule, setShowSchedule] = useState(false);

  const calc = useMemo(() => {
    const P = clamp(Number(amount || 0), 0, 1e12);
    const R = clamp(Number(rate || 0), 0, 100);

    if (!P) return null;

    if (mode === "fixedTerm") {
      const Y = clamp(Number(years || 0), 0, 100);
      if (!Y) return null;

      const res = buildAmortizationFixedTerm(P, R, Y);
      const total = res.totalPayments;
      const interest = res.totalInterest;

      const principalPct = total ? (P / total) * 100 : 0;
      const interestPct = total ? (interest / total) * 100 : 0;

      return {
        mode,
        ...res,
        principal: P,
        principalPct,
        interest,
        interestPct,
        termLabel: `${res.months} months (${round2(res.months / 12)} years)`, // ✅ ADDED
      };
    }

    // ✅ ADDED: Fixed Payments calculation
    const pay = clamp(Number(payment || 0), 0, 1e12);
    if (!pay) return null;

    const res = buildAmortizationFixedPayment(P, R, pay);
    if (!res) return null;
    if (res.error) return { mode, error: res.error };

    const total = res.totalPayments;
    const interest = res.totalInterest;

    const principalPct = total ? (P / total) * 100 : 0;
    const interestPct = total ? (interest / total) * 100 : 0;

    const yearsFloat = res.months / 12;
    const yrs = Math.floor(yearsFloat);
    const mos = res.months % 12;

    return {
      mode,
      ...res,
      principal: P,
      principalPct,
      interest,
      interestPct,
      // ✅ ADDED: payoff term text
      termLabel: `${yrs} years ${mos} months (${res.months} months)`,
    };
  }, [amount, years, rate, payment, mode]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Payment Calculator</h1>
        <p className="muted">
          Calculate monthly payment (Fixed Term) or calculate payoff time (Fixed Payments).
        </p>
      </header>

      <div className="calc-grid">
        {/* INPUTS */}
        <section className="card">
          {/* ✅ ADDED: tab buttons like calculator.net */}
          <div className="tab-row"> {/* ✅ ADDED */}
            <button
              type="button"
              className={`tab-btn ${mode === "fixedTerm" ? "active" : ""}`} // ✅ ADDED
              onClick={() => setMode("fixedTerm")} // ✅ ADDED
            >
              Fixed Term
            </button>

            <button
              type="button"
              className={`tab-btn ${mode === "fixedPayment" ? "active" : ""}`} // ✅ ADDED
              onClick={() => setMode("fixedPayment")} // ✅ ADDED
            >
              Fixed Payments
            </button>
          </div>

          <h2 className="card-title" style={{ marginTop: 10 }}>
            {mode === "fixedTerm" ? "Fixed Term" : "Fixed Payments"} {/* ✅ ADDED */}
          </h2>

          <div className="row">
            <div className="field">
              <label>Loan Amount</label>
              <input
                type="number"
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </div>
          </div>

          {/* ✅ MODIFIED: conditional inputs based on tab */}
          {mode === "fixedTerm" ? (
            <div className="row two">
              <div className="field">
                <label>Loan Term (years)</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={years}
                  onChange={(e) => setYears(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </div>

              <div className="field">
                <label>Interest Rate (%)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={rate}
                  onChange={(e) => setRate(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </div>
            </div>
          ) : (
            <div className="row two">
              <div className="field">
                <label>Monthly Payment</label> {/* ✅ ADDED */}
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={payment}
                  onChange={(e) => setPayment(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </div>

              <div className="field">
                <label>Interest Rate (%)</label> {/* ✅ ADDED */}
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={rate}
                  onChange={(e) => setRate(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </div>
            </div>
          )}

          <div className="row">
            <button
              className="btn-primary"
              type="button"
              onClick={() => setShowSchedule((v) => !v)}
              disabled={!calc || !!calc?.error} // ✅ MODIFIED
            >
              {showSchedule ? "Hide" : "Show"} Amortization Schedule
            </button>
          </div>

          <p className="small" style={{ marginTop: 10 }}>
            Tip: Set interest rate to 0 to calculate a no-interest scenario.
          </p>
        </section>

        {/* RESULTS */}
        <section className="card">
          <h2 className="card-title">Results</h2>

          {!calc ? (
            <p className="muted">Enter required values to see results.</p>
          ) : calc.error ? ( // ✅ ADDED
            <p className="muted">{calc.error}</p> // ✅ ADDED
          ) : (
            <>
              <div className="kpi-grid">
                <div className="kpi">
                  <div className="kpi-label">
                    {mode === "fixedTerm" ? "Monthly Payment" : "Monthly Payment"} {/* same label */}
                  </div>
                  <div className="kpi-value">{formatCurrency(round2(calc.payment))}</div>
                  <div className="kpi-sub">
                    {mode === "fixedTerm" ? `${calc.months} total payments` : `Payoff: ${calc.termLabel}`} {/* ✅ MODIFIED */}
                  </div>
                </div>

                <div className="kpi">
                  <div className="kpi-label">{mode === "fixedTerm" ? "Total Interest" : "Total Interest"}</div>
                  <div className="kpi-value">{formatCurrency(round2(calc.totalInterest))}</div>
                  <div className="kpi-sub">
                    {mode === "fixedTerm" ? `over ${years} years` : `over ${calc.termLabel}`} {/* ✅ MODIFIED */}
                  </div>
                </div>
              </div>

              <table className="table" style={{ marginTop: 12 }}>
                <tbody>
                  <tr>
                    <td>Total of {calc.months} Payments</td>
                    <td style={{ textAlign: "right" }}>
                      <b>{formatCurrency(round2(calc.totalPayments))}</b>
                    </td>
                  </tr>
                  <tr>
                    <td>Principal</td>
                    <td style={{ textAlign: "right" }}>
                      <b>{formatCurrency(round2(calc.principal))}</b>
                    </td>
                  </tr>
                  <tr>
                    <td>Total Interest</td>
                    <td style={{ textAlign: "right" }}>
                      <b>{formatCurrency(round2(calc.totalInterest))}</b>
                    </td>
                  </tr>

                  {/* ✅ ADDED: show term row on Fixed Payments */}
                  {mode === "fixedPayment" && (
                    <tr>
                      <td>Time to Payoff</td>
                      <td style={{ textAlign: "right" }}>
                        <b>{calc.termLabel}</b>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div style={{ marginTop: 14 }}>
                <Donut
                  principalPct={round2(calc.principalPct)}
                  interestPct={round2(calc.interestPct)}
                />
              </div>

              {showSchedule && (
                <div style={{ marginTop: 14 }}>
                  <h3 className="card-title">Amortization Schedule</h3>
                  <div className="table-wrap">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Month</th>
                          <th>Payment</th>
                          <th>Interest</th>
                          <th>Principal</th>
                          <th>Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {calc.rows.slice(0, 360).map((r) => (
                          <tr key={r.month}>
                            <td>{r.month}</td>
                            <td>{formatCurrency(round2(r.payment))}</td>
                            <td>{formatCurrency(round2(r.interest))}</td>
                            <td>{formatCurrency(round2(r.principal))}</td>
                            <td>{formatCurrency(round2(r.balance))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {calc.rows.length > 360 && (
                    <p className="small" style={{ marginTop: 8 }}>
                      Showing first 360 months. (Large schedules are truncated for performance.)
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
