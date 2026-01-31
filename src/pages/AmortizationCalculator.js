// src/pages/AmortizationCalculator.js
import React, { useMemo, useState } from "react";
import "../css/CalcBase.css";

/** ---------- Helpers ---------- */
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

function formatMoney(n, currency = "USD") {
  if (!isFinite(n)) return "-";
  return n.toLocaleString(undefined, { style: "currency", currency });
}

function toMonths(years, months) {
  return Math.max(0, Math.round(Number(years || 0) * 12 + Number(months || 0)));
}

function pmt(principal, rateMonthly, nper) {
  const P = Number(principal || 0);
  const r = Number(rateMonthly || 0);
  const N = Math.max(0, Math.round(Number(nper || 0)));
  if (!P || !N) return 0;
  if (r === 0) return P / N;
  return (P * r) / (1 - Math.pow(1 + r, -N));
}

function pct(num, den) {
  return den > 0 ? (num / den) * 100 : 0;
}

function buildAmortizationSchedule({ principal, annualRatePct, termMonths, extraMonthly }) {
  const P0 = clamp(principal, 0, 1e15);
  const apr = clamp(annualRatePct, -50, 100) / 100;
  const N = clamp(termMonths, 0, 2000);

  const r = apr / 12;

  const basePayment = pmt(P0, r, N);
  const extra = clamp(extraMonthly, 0, 1e15);
  const paymentWanted = basePayment + extra;

  let balance = P0;
  let totalInterest = 0;
  let totalPrincipal = 0;

  const schedule = [];
  let month = 0;

  // If payment <= interest, the loan will never amortize. Force a minimal payment to reduce balance.
  const minPaymentToReduce = r > 0 ? balance * r + 0.01 : 0;
  const payment = r > 0 && paymentWanted <= minPaymentToReduce ? minPaymentToReduce : paymentWanted;

  while (balance > 0 && month < 5000) {
    month += 1;

    const interest = r === 0 ? 0 : balance * r;
    let principalPaid = payment - interest;
    if (principalPaid < 0) principalPaid = 0;

    // last payment adjustment
    if (principalPaid > balance) principalPaid = balance;

    const actualPayment = principalPaid + interest;
    balance = balance - principalPaid;

    totalInterest += interest;
    totalPrincipal += principalPaid;

    schedule.push({
      month,
      payment: actualPayment,
      interest,
      principal: principalPaid,
      balance,
    });

    // safety
    if (month > N * 3) break;
  }

  return {
    basePayment,
    payment,
    months: schedule.length,
    totalInterest,
    totalPrincipal,
    totalPaid: totalInterest + totalPrincipal,
    schedule,
  };
}

function groupByYear(schedule) {
  const years = [];
  for (const row of schedule) {
    const y = Math.ceil(row.month / 12);
    const idx = y - 1;
    if (!years[idx]) {
      years[idx] = {
        year: y,
        interest: 0,
        principal: 0,
        endingBalance: row.balance,
      };
    }
    years[idx].interest += row.interest;
    years[idx].principal += row.principal;
    years[idx].endingBalance = row.balance;
  }
  return years.map((y) => ({
    ...y,
    interest: round2(y.interest),
    principal: round2(y.principal),
    endingBalance: round2(y.endingBalance),
  }));
}

/** ---------- UI Bits ---------- */
function ResultBar({ title, right }) {
  return (
    <div
      style={{
        background: "rgba(120,255,140,0.18)",
        border: "1px solid rgba(120,255,140,0.25)",
        borderRadius: 12,
        padding: "10px 12px",
        fontWeight: 900,
        margin: "10px 0 12px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "rgba(255,255,255,0.92)",
      }}
    >
      <span>{title}</span>
      <span style={{ fontSize: 12, opacity: 0.85 }}>{right}</span>
    </div>
  );
}

function Donut({ principalPct, interestPct }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  const p = clamp(principalPct, 0, 100);
  const i = clamp(interestPct, 0, 100);

  const pLen = (p / 100) * c;
  const iLen = (i / 100) * c;

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
      <svg width="120" height="120" viewBox="0 0 120 120" aria-label="Principal vs Interest">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="16" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="rgba(120,255,140,0.85)"
          strokeWidth="16"
          strokeDasharray={`${pLen} ${c - pLen}`}
          strokeDashoffset="0"
          transform="rotate(-90 60 60)"
        />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="rgba(92,184,255,0.85)"
          strokeWidth="16"
          strokeDasharray={`${iLen} ${c - iLen}`}
          strokeDashoffset={-pLen}
          transform="rotate(-90 60 60)"
        />
        <text x="60" y="54" textAnchor="middle" fontSize="12" fill="rgba(255,255,255,0.9)" fontWeight="800">
          Principal
        </text>
        <text x="60" y="74" textAnchor="middle" fontSize="16" fill="rgba(255,255,255,0.95)" fontWeight="900">
          {Math.round(p)}%
        </text>
      </svg>

      {/* ✅ FIX: Proper labels + spacing (prevents the long-number “wrap into one line” bug) */}
      <div style={{ display: "grid", gap: 10, minWidth: 180 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: "rgba(120,255,140,0.85)" }} />
          <div>
            <div style={{ fontWeight: 900, lineHeight: 1.1 }}>Principal</div>
            <div className="small" style={{ marginTop: 2 }}>{Math.round(p)}%</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: "rgba(92,184,255,0.85)" }} />
          <div>
            <div style={{ fontWeight: 900, lineHeight: 1.1 }}>Interest</div>
            <div className="small" style={{ marginTop: 2 }}>{Math.round(i)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** ---------- Component ---------- */
export default function AmortizationCalculator() {
  const currency = "USD";

  const DEFAULTS = useMemo(
    () => ({
      loanAmount: 200000,
      termYears: 15,
      termMonths: 0,
      rate: 6,
      extraOn: false,
      extraMonthly: 0,
      view: "annual", // annual | monthly
    }),
    []
  );

  const [loanAmount, setLoanAmount] = useState(DEFAULTS.loanAmount);
  const [termYears, setTermYears] = useState(DEFAULTS.termYears);
  const [termMonths, setTermMonths] = useState(DEFAULTS.termMonths);
  const [rate, setRate] = useState(DEFAULTS.rate);

  const [extraOn, setExtraOn] = useState(DEFAULTS.extraOn);
  const [extraMonthly, setExtraMonthly] = useState(DEFAULTS.extraMonthly);

  const [view, setView] = useState(DEFAULTS.view);

  const termTotalMonths = useMemo(() => toMonths(termYears, termMonths), [termYears, termMonths]);

  // ✅ Auto-calculated results (as you requested)
  const computed = useMemo(() => {
    const res = buildAmortizationSchedule({
      principal: loanAmount,
      annualRatePct: rate,
      termMonths: termTotalMonths,
      extraMonthly: extraOn ? extraMonthly : 0,
    });

    const principalPct = pct(res.totalPrincipal, res.totalPaid);
    const interestPct = pct(res.totalInterest, res.totalPaid);

    const annual = groupByYear(res.schedule);

    return { ...res, principalPct, interestPct, annual };
  }, [loanAmount, rate, termTotalMonths, extraOn, extraMonthly]);

  const onCalculate = () => {
    // Results already auto-update; keep button for UX parity + scroll
    const el = document.getElementById("amort-results");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onClear = () => {
    setLoanAmount(DEFAULTS.loanAmount);
    setTermYears(DEFAULTS.termYears);
    setTermMonths(DEFAULTS.termMonths);
    setRate(DEFAULTS.rate);
    setExtraOn(DEFAULTS.extraOn);
    setExtraMonthly(DEFAULTS.extraMonthly);
    setView(DEFAULTS.view);
  };

  const printPage = () => window.print();

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ textAlign: "left" }}>
            <h1 style={{ marginBottom: 6 }}>Amortization Calculator</h1>
            <p className="muted" style={{ margin: 0 }}>
              Calculate monthly payment, totals, and amortization schedule (annual/monthly). Optional extra payments supported.
            </p>
          </div>

          <button className="btn-secondary" type="button" onClick={printPage} style={{ maxWidth: 160 }}>
            Print
          </button>
        </div>
      </header>

      {/* Form left, results right */}
      <section className="card" style={{ marginBottom: 18 }}>
        <div className="calc-grid" style={{ marginTop: 0 }}>
          {/* Inputs */}
          <div className="card" style={{ background: "rgba(255,255,255,0.04)" }}>
            <ResultBar title="Modify the values and click the Calculate button to use" right="" />

            <div className="row">
              <div className="field">
                <label>Loan amount</label>
                <div className="input-group">
                  <span className="addon">$</span>
                  <input type="number" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} />
                </div>
              </div>
            </div>

            <div className="row two">
              <div className="field">
                <label>Loan term (years)</label>
                <div className="input-group">
                  <input type="number" value={termYears} onChange={(e) => setTermYears(Number(e.target.value))} />
                  <span className="addon">years</span>
                </div>
              </div>

              <div className="field">
                <label>Loan term (months)</label>
                <div className="input-group">
                  <input type="number" value={termMonths} onChange={(e) => setTermMonths(Number(e.target.value))} />
                  <span className="addon">months</span>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="field">
                <label>Interest rate</label>
                <div className="input-group">
                  <input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} />
                  <span className="addon">%</span>
                </div>
              </div>
            </div>

            <div className="row" style={{ marginBottom: 10 }}>
              <div className="field" style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  id="extraOn"
                  type="checkbox"
                  checked={extraOn}
                  onChange={(e) => setExtraOn(e.target.checked)}
                  style={{ width: 18, height: 18 }}
                />
                <label
                  htmlFor="extraOn"
                  style={{
                    margin: 0,
                    cursor: "pointer",
                    fontWeight: 900,
                    color: "rgba(255,255,255,0.9)",
                  }}
                >
                  Optional: make extra payments
                </label>
              </div>

              {extraOn && (
                <div className="field" style={{ marginTop: 10 }}>
                  <label>Extra payment (monthly)</label>
                  <div className="input-group">
                    <span className="addon">$</span>
                    <input type="number" value={extraMonthly} onChange={(e) => setExtraMonthly(Number(e.target.value))} />
                    <span className="addon">/month</span>
                  </div>
                </div>
              )}
            </div>

            <div className="row two" style={{ alignItems: "center" }}>
              <button className="btn-primary" type="button" onClick={onCalculate}>
                Calculate
              </button>
              <button className="btn-secondary" type="button" onClick={onClear}>
                Clear
              </button>
            </div>

            <div className="small" style={{ marginTop: 8 }}>
              Term: <b>{termTotalMonths}</b> months {extraOn ? "• Extra payments enabled" : ""}
            </div>
          </div>

          {/* Results */}
          <div className="card" id="amort-results">
            <ResultBar title={`Monthly Pay: ${formatMoney(round2(computed.payment), currency)}`} right="save" />

            {/* ✅ FIX: keep results in a constrained width so text doesn’t spill */}
            <div style={{ display: "grid", gap: 14, maxWidth: 520 }}>
              <Donut principalPct={computed.principalPct} interestPct={computed.interestPct} />

              {/* ✅ FIX: Proper aligned rows; prevents the “123456…” line overflow */}
              <table className="table" style={{ marginTop: 0, tableLayout: "fixed" }}>
                <colgroup>
                  <col style={{ width: "65%" }} />
                  <col style={{ width: "35%" }} />
                </colgroup>
                <tbody>
                  <tr>
                    <td style={{ whiteSpace: "normal" }}>
                      Total of {computed.months} monthly payments
                    </td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <b>{formatMoney(round2(computed.totalPaid), currency)}</b>
                    </td>
                  </tr>
                  <tr>
                    <td>Total interest</td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <b>{formatMoney(round2(computed.totalInterest), currency)}</b>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="small">
                Principal: <b>{formatMoney(round2(computed.totalPrincipal), currency)}</b>{" "}
                • Interest: <b>{formatMoney(round2(computed.totalInterest), currency)}</b>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section className="card">
        <h2 className="card-title">Amortization schedule</h2>

        <div className="tab-row">
          <button
            type="button"
            className={`tab-btn ${view === "annual" ? "active" : ""}`}
            onClick={() => setView("annual")}
          >
            Annual Schedule
          </button>
          <button
            type="button"
            className={`tab-btn ${view === "monthly" ? "active" : ""}`}
            onClick={() => setView("monthly")}
          >
            Monthly Schedule
          </button>
        </div>

        {view === "annual" ? (
          <table className="table">
            <thead>
              <tr>
                <th>Year</th>
                <th style={{ textAlign: "right" }}>Interest</th>
                <th style={{ textAlign: "right" }}>Principal</th>
                <th style={{ textAlign: "right" }}>Ending Balance</th>
              </tr>
            </thead>
            <tbody>
              {computed.annual.map((r) => (
                <tr key={r.year}>
                  <td>{r.year}</td>
                  <td style={{ textAlign: "right" }}>{formatMoney(r.interest, currency)}</td>
                  <td style={{ textAlign: "right" }}>{formatMoney(r.principal, currency)}</td>
                  <td style={{ textAlign: "right" }}>{formatMoney(r.endingBalance, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Month</th>
                <th style={{ textAlign: "right" }}>Payment</th>
                <th style={{ textAlign: "right" }}>Interest</th>
                <th style={{ textAlign: "right" }}>Principal</th>
                <th style={{ textAlign: "right" }}>Balance</th>
              </tr>
            </thead>
            <tbody>
              {computed.schedule.map((r) => (
                <tr key={r.month}>
                  <td>{r.month}</td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    {formatMoney(round2(r.payment), currency)}
                  </td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    {formatMoney(round2(r.interest), currency)}
                  </td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    {formatMoney(round2(r.principal), currency)}
                  </td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    {formatMoney(round2(r.balance), currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <p className="small" style={{ marginTop: 10 }}>
          Extra payments reduce total interest and may shorten payoff time.
        </p>
      </section>
    </div>
  );
}
