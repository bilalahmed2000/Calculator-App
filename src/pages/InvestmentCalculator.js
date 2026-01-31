// src/pages/InvestmentCalculator.js
import React, { useMemo, useState } from "react";
import "../css/CalcBase.css";

/** ---------------- Helpers ---------------- */
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

function formatMoney(n, currency = "USD") {
  if (!isFinite(n)) return "-";
  return n.toLocaleString(undefined, { style: "currency", currency });
}

function formatPct(n) {
  if (!isFinite(n)) return "-";
  return `${round2(n)}%`;
}

function safeNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Convert nominal annual rate with compounding m/year into an effective rate per p/year
 * i = (1 + r/m)^(m/p) - 1
 */
function effectiveRatePerPeriod(nominalAnnualRate, mPerYear, pPerYear) {
  const r = nominalAnnualRate;
  const m = Math.max(1, Math.round(mPerYear));
  const p = Math.max(1, Math.round(pPerYear));
  if (r === 0) return 0;
  return Math.pow(1 + r / m, m / p) - 1;
}

/** FV of PV + contributions each period (ordinary / annuity due) */
function futureValue({ pv, pmt, i, n, contributeAt = "end" }) {
  const PV = pv;
  const PMT = pmt;
  const N = Math.max(0, Math.round(n));
  const rate = i;

  if (N === 0) return PV;
  if (rate === 0) return PV + PMT * N;

  const growth = Math.pow(1 + rate, N);
  const annuityFactor = (growth - 1) / rate;
  const dueFactor = contributeAt === "begin" ? 1 + rate : 1;

  return PV * growth + PMT * annuityFactor * dueFactor;
}

function solvePMT({ fvTarget, pv, i, n, contributeAt }) {
  const N = Math.max(0, Math.round(n));
  const rate = i;
  if (N === 0) return 0;

  const dueFactor = contributeAt === "begin" ? 1 + rate : 1;

  if (rate === 0) return (fvTarget - pv) / N;

  const growth = Math.pow(1 + rate, N);
  const annuityFactor = (growth - 1) / rate;

  return (fvTarget - pv * growth) / (annuityFactor * dueFactor);
}

function solvePV({ fvTarget, pmt, i, n, contributeAt }) {
  const N = Math.max(0, Math.round(n));
  const rate = i;
  if (N === 0) return fvTarget;

  const dueFactor = contributeAt === "begin" ? 1 + rate : 1;

  if (rate === 0) return fvTarget - pmt * N;

  const growth = Math.pow(1 + rate, N);
  const annuityFactor = (growth - 1) / rate;

  return (fvTarget - pmt * annuityFactor * dueFactor) / growth;
}

/** Solve N (number of periods) for FV with fixed PV, PMT, i */
function solveN({ fvTarget, pv, pmt, i, contributeAt }) {
  const rate = i;

  if (rate === 0) {
    if (pmt === 0) return pv >= fvTarget ? 0 : Infinity;
    return Math.max(0, Math.ceil((fvTarget - pv) / pmt));
  }

  let lo = 0;
  let hi = 1200;

  const f = (N) => futureValue({ pv, pmt, i: rate, n: N, contributeAt }) - fvTarget;

  while (hi < 100000 && f(hi) < 0) hi *= 2;

  if (f(0) >= 0) return 0;

  for (let iter = 0; iter < 80; iter++) {
    const mid = Math.floor((lo + hi) / 2);
    const val = f(mid);
    if (val >= 0) hi = mid;
    else lo = mid + 1;
  }
  return hi;
}

/** Solve nominal annual rate r (as decimal) using bisection on FV */
function solveAnnualRate({
  fvTarget,
  pv,
  pmt,
  years,
  compoundPerYear,
  contribPerYear,
  contributeAt,
}) {
  const Y = Math.max(0, years);
  const N = Math.max(0, Math.round(Y * contribPerYear));
  if (N === 0) return 0;

  const fvGivenR = (r) => {
    const i = effectiveRatePerPeriod(r, compoundPerYear, contribPerYear);
    return futureValue({ pv, pmt, i, n: N, contributeAt });
  };

  let lo = -0.99;
  let hi = 2.0;

  let flo = fvGivenR(lo) - fvTarget;
  let fhi = fvGivenR(hi) - fvTarget;

  let guard = 0;
  while (fhi < 0 && hi < 20 && guard < 30) {
    hi *= 1.5;
    fhi = fvGivenR(hi) - fvTarget;
    guard++;
  }

  if (flo > 0) return lo;
  if (fhi < 0) return hi;

  for (let iter = 0; iter < 90; iter++) {
    const mid = (lo + hi) / 2;
    const fmid = fvGivenR(mid) - fvTarget;
    if (fmid === 0) return mid;
    if (fmid > 0) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}

function buildSchedule({
  pv,
  pmt,
  years,
  nominalRate,
  compoundPerYear,
  contribPerYear,
  contributeAt,
}) {
  const N = Math.max(0, Math.round(years * contribPerYear));
  const i = effectiveRatePerPeriod(nominalRate, compoundPerYear, contribPerYear);

  let bal = pv;
  const rows = [];

  for (let k = 1; k <= N; k++) {
    const deposit = pmt;

    if (contributeAt === "begin") bal += deposit;

    const interest = bal * i;
    bal += interest;

    if (contributeAt === "end") bal += deposit;

    rows.push({
      period: k,
      deposit,
      interest,
      endBalance: bal,
    });
  }

  return { rows, i, N, endBalance: bal };
}

function groupAnnual(periodRows, contribPerYear) {
  const perYear = contribPerYear;
  const years = [];
  for (let idx = 0; idx < periodRows.length; idx++) {
    const year = Math.floor(idx / perYear) + 1;
    if (!years[year - 1]) {
      years[year - 1] = { year, deposit: 0, interest: 0, endBalance: 0 };
    }
    years[year - 1].deposit += periodRows[idx].deposit;
    years[year - 1].interest += periodRows[idx].interest;
    years[year - 1].endBalance = periodRows[idx].endBalance;
  }
  return years.map((y) => ({
    ...y,
    deposit: round2(y.deposit),
    interest: round2(y.interest),
    endBalance: round2(y.endBalance),
  }));
}

/** ---------------- UI Bits ---------------- */
function ResultBar({ title = "Results", right = "save" }) {
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

function Donut3({ startAmt, contribTotal, interestTotal }) {
  const total = Math.max(1e-9, startAmt + contribTotal + interestTotal);
  const pStart = (startAmt / total) * 100;
  const pContrib = (contribTotal / total) * 100;
  const pInt = (interestTotal / total) * 100;

  const r = 44;
  const c = 2 * Math.PI * r;

  const lenStart = (pStart / 100) * c;
  const lenContrib = (pContrib / 100) * c;
  const lenInt = (pInt / 100) * c;

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
      <svg width="120" height="120" viewBox="0 0 120 120" aria-label="Breakdown donut">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="16" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="rgba(92,184,255,0.90)"
          strokeWidth="16"
          strokeDasharray={`${lenStart} ${c - lenStart}`}
          strokeDashoffset="0"
          transform="rotate(-90 60 60)"
        />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="rgba(120,255,140,0.85)"
          strokeWidth="16"
          strokeDasharray={`${lenContrib} ${c - lenContrib}`}
          strokeDashoffset={-lenStart}
          transform="rotate(-90 60 60)"
        />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="rgba(255,196,77,0.85)"
          strokeWidth="16"
          strokeDasharray={`${lenInt} ${c - lenInt}`}
          strokeDashoffset={-(lenStart + lenContrib)}
          transform="rotate(-90 60 60)"
        />
        <text x="60" y="62" textAnchor="middle" fontSize="12" fill="rgba(255,255,255,0.9)" fontWeight="900">
          Mix
        </text>
      </svg>

      <div style={{ display: "grid", gap: 10, minWidth: 240 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: "rgba(92,184,255,0.90)" }} />
          <div>
            <div style={{ fontWeight: 900, lineHeight: 1.1 }}>Starting Amount</div>
            <div className="small" style={{ marginTop: 2 }}>{Math.round(pStart)}%</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: "rgba(120,255,140,0.85)" }} />
          <div>
            <div style={{ fontWeight: 900, lineHeight: 1.1 }}>Total Contributions</div>
            <div className="small" style={{ marginTop: 2 }}>{Math.round(pContrib)}%</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: "rgba(255,196,77,0.85)" }} />
          <div>
            <div style={{ fontWeight: 900, lineHeight: 1.1 }}>Interest</div>
            <div className="small" style={{ marginTop: 2 }}>{Math.round(pInt)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** ---------------- Component ---------------- */
export default function InvestmentCalculator() {
  const currency = "USD";

  const DEFAULTS = useMemo(
    () => ({
      tab: "end", // end | contrib | rate | start | length
      startingAmount: 20000,
      years: 10,
      returnRatePct: 6,
      compound: "annually",
      additionalContribution: 1000,
      contributeAt: "end", // begin|end
      contribFrequency: "month", // month|year
      targetEndAmount: 198290.4,
    }),
    []
  );

  const [tab, setTab] = useState(DEFAULTS.tab);
  const [startingAmount, setStartingAmount] = useState(DEFAULTS.startingAmount);
  const [years, setYears] = useState(DEFAULTS.years);
  const [returnRatePct, setReturnRatePct] = useState(DEFAULTS.returnRatePct);
  const [compound, setCompound] = useState(DEFAULTS.compound);
  const [additionalContribution, setAdditionalContribution] = useState(DEFAULTS.additionalContribution);
  const [contributeAt, setContributeAt] = useState(DEFAULTS.contributeAt);
  const [contribFrequency, setContribFrequency] = useState(DEFAULTS.contribFrequency);
  const [targetEndAmount, setTargetEndAmount] = useState(DEFAULTS.targetEndAmount);

  const [scheduleTab, setScheduleTab] = useState("annual"); // annual|monthly

  const compoundPerYear = useMemo(() => {
    switch (compound) {
      case "semiannually": return 2;
      case "quarterly": return 4;
      case "monthly": return 12;
      case "daily": return 365;
      case "annually":
      default: return 1;
    }
  }, [compound]);

  const contribPerYear = useMemo(() => (contribFrequency === "year" ? 1 : 12), [contribFrequency]);

  // ✅ AUTO-CALC LIVE (main change)
  const computed = useMemo(() => {
    const PV = clamp(safeNum(startingAmount), 0, 1e15);
    const Y = clamp(safeNum(years), 0, 200);
    const rNom = clamp(safeNum(returnRatePct), -99, 1000) / 100;

    const pPerYear = contribPerYear;
    const mPerYear = compoundPerYear;
    const N = Math.max(0, Math.round(Y * pPerYear));

    const PMT = clamp(safeNum(additionalContribution), 0, 1e15);
    const i = effectiveRatePerPeriod(rNom, mPerYear, pPerYear);

    const targetFV = clamp(safeNum(targetEndAmount), 0, 1e15);

    let scheduleYears = Y;
    let schedulePV = PV;
    let schedulePMT = PMT;
    let scheduleRate = rNom;

    let solvedStartingAmount = null;
    let solvedContribution = null;
    let solvedRatePct = null;
    let solvedYears = null;

    if (tab === "end") {
      // just use inputs as-is
    } else if (tab === "contrib") {
      const pmtSolved = solvePMT({ fvTarget: targetFV, pv: PV, i, n: N, contributeAt });
      solvedContribution = pmtSolved;
      schedulePMT = pmtSolved;
    } else if (tab === "start") {
      const pvSolved = solvePV({ fvTarget: targetFV, pmt: PMT, i, n: N, contributeAt });
      solvedStartingAmount = pvSolved;
      schedulePV = pvSolved;
    } else if (tab === "rate") {
      const rSolved = solveAnnualRate({
        fvTarget: targetFV,
        pv: PV,
        pmt: PMT,
        years: Y,
        compoundPerYear: mPerYear,
        contribPerYear: pPerYear,
        contributeAt,
      });
      solvedRatePct = rSolved * 100;
      scheduleRate = rSolved;
    } else if (tab === "length") {
      const Nsolved = solveN({ fvTarget: targetFV, pv: PV, pmt: PMT, i, contributeAt });
      const ySolved = Nsolved / pPerYear;
      solvedYears = ySolved;
      scheduleYears = ySolved;
    }

    const { rows, endBalance, i: iUsed, N: nUsed } = buildSchedule({
      pv: schedulePV,
      pmt: schedulePMT,
      years: scheduleYears,
      nominalRate: scheduleRate,
      compoundPerYear: mPerYear,
      contribPerYear: pPerYear,
      contributeAt,
    });

    const totalContrib = rows.reduce((s, r) => s + r.deposit, 0);
    const totalInterest = rows.reduce((s, r) => s + r.interest, 0);

    const startUsed = tab === "start" && solvedStartingAmount != null ? solvedStartingAmount : PV;

    const annualRows =
      pPerYear === 12
        ? groupAnnual(rows, 12)
        : rows.map((r, idx) => ({
            year: idx + 1,
            deposit: round2(r.deposit),
            interest: round2(r.interest),
            endBalance: round2(r.endBalance),
          }));

    const monthlyRows = pPerYear === 12 ? rows : [];

    return {
      endBalance,
      solvedStartingAmount,
      solvedContribution,
      solvedRatePct,
      solvedYears,
      meta: { iPerPeriod: iUsed, periods: nUsed, contribPerYear: pPerYear },
      totals: { start: startUsed, contrib: totalContrib, interest: totalInterest, end: endBalance },
      annualRows,
      monthlyRows,
    };
  }, [
    tab,
    startingAmount,
    years,
    returnRatePct,
    compoundPerYear,
    contribPerYear,
    additionalContribution,
    contributeAt,
    targetEndAmount,
  ]);

  const handleCalculate = () => {
    // Since auto-calc is ON, Calculate just scrolls to results like calculator.net UX
    const el = document.getElementById("inv-results");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleClear = () => {
    setTab(DEFAULTS.tab);
    setStartingAmount(DEFAULTS.startingAmount);
    setYears(DEFAULTS.years);
    setReturnRatePct(DEFAULTS.returnRatePct);
    setCompound(DEFAULTS.compound);
    setAdditionalContribution(DEFAULTS.additionalContribution);
    setContributeAt(DEFAULTS.contributeAt);
    setContribFrequency(DEFAULTS.contribFrequency);
    setTargetEndAmount(DEFAULTS.targetEndAmount);
    setScheduleTab("annual");
  };

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Investment Calculator</h1>
        <p className="muted">
          Auto-calculates like calculator.net — solve for end amount, contribution, return rate, starting amount, or investment length.
        </p>
      </header>

      <section className="card" style={{ marginBottom: 18 }}>
        <div className="tab-row">
          <button className={`tab-btn ${tab === "end" ? "active" : ""}`} type="button" onClick={() => setTab("end")}>
            End Amount
          </button>
          <button className={`tab-btn ${tab === "contrib" ? "active" : ""}`} type="button" onClick={() => setTab("contrib")}>
            Additional Contribution
          </button>
          <button className={`tab-btn ${tab === "rate" ? "active" : ""}`} type="button" onClick={() => setTab("rate")}>
            Return Rate
          </button>
          <button className={`tab-btn ${tab === "start" ? "active" : ""}`} type="button" onClick={() => setTab("start")}>
            Starting Amount
          </button>
          <button className={`tab-btn ${tab === "length" ? "active" : ""}`} type="button" onClick={() => setTab("length")}>
            Investment Length
          </button>
        </div>

        <div className="calc-grid" style={{ marginTop: 12 }}>
          {/* Inputs */}
          <div className="card" style={{ background: "rgba(255,255,255,0.04)" }}>
            <ResultBar title="Modify the values and click the Calculate button to use" right="" />

            <div className="row two">
              <div className="field">
                <label>Starting Amount</label>
                <div className="input-group">
                  <span className="addon">$</span>
                  <input
                    type="number"
                    value={startingAmount}
                    onChange={(e) => setStartingAmount(Number(e.target.value))}
                    disabled={tab === "start"}
                  />
                </div>
              </div>

              <div className="field">
                <label>After</label>
                <div className="input-group">
                  <input
                    type="number"
                    value={years}
                    onChange={(e) => setYears(Number(e.target.value))}
                    disabled={tab === "length"}
                  />
                  <span className="addon">years</span>
                </div>
              </div>
            </div>

            <div className="row two">
              <div className="field">
                <label>Return Rate</label>
                <div className="input-group">
                  <input
                    type="number"
                    value={returnRatePct}
                    onChange={(e) => setReturnRatePct(Number(e.target.value))}
                    disabled={tab === "rate"}
                  />
                  <span className="addon">%</span>
                </div>
              </div>

              <div className="field">
                <label>Compound</label>
                <select value={compound} onChange={(e) => setCompound(e.target.value)}>
                  <option value="annually">annually</option>
                  <option value="semiannually">semiannually</option>
                  <option value="quarterly">quarterly</option>
                  <option value="monthly">monthly</option>
                  <option value="daily">daily</option>
                </select>
              </div>
            </div>

            <div className="row">
              <div className="field">
                <label>Additional Contribution</label>
                <div className="input-group">
                  <span className="addon">$</span>
                  <input
                    type="number"
                    value={additionalContribution}
                    onChange={(e) => setAdditionalContribution(Number(e.target.value))}
                    disabled={tab === "contrib"}
                  />
                  <span className="addon">/</span>
                  <select value={contribFrequency} onChange={(e) => setContribFrequency(e.target.value)}>
                    <option value="month">month</option>
                    <option value="year">year</option>
                  </select>
                </div>

                <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 10, flexWrap: "wrap" }}>
                  <span className="small" style={{ fontWeight: 800 }}>Contribute at the</span>

                  <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="radio"
                      name="contribAt"
                      value="begin"
                      checked={contributeAt === "begin"}
                      onChange={() => setContributeAt("begin")}
                    />
                    <span className="small">beginning</span>
                  </label>

                  <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="radio"
                      name="contribAt"
                      value="end"
                      checked={contributeAt === "end"}
                      onChange={() => setContributeAt("end")}
                    />
                    <span className="small">end</span>
                  </label>
                </div>
              </div>
            </div>

            {(tab === "contrib" || tab === "rate" || tab === "start" || tab === "length") && (
              <div className="row">
                <div className="field">
                  <label>End Amount (target)</label>
                  <div className="input-group">
                    <span className="addon">$</span>
                    <input
                      type="number"
                      value={targetEndAmount}
                      onChange={(e) => setTargetEndAmount(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="row two" style={{ alignItems: "center" }}>
              <button className="btn-primary" type="button" onClick={handleCalculate}>
                Calculate
              </button>
              <button className="btn-secondary" type="button" onClick={handleClear}>
                Clear
              </button>
            </div>

            <p className="small" style={{ marginTop: 8 }}>
              Auto-calculation is enabled — results update instantly.
            </p>
          </div>

          {/* Results */}
          <div className="card" id="inv-results">
            <ResultBar title="Results" right="save" />

            <table className="table" style={{ marginTop: 0 }}>
              <tbody>
                <tr>
                  <td><b>End Balance</b></td>
                  <td style={{ textAlign: "right" }}><b>{formatMoney(round2(computed.totals.end), currency)}</b></td>
                </tr>
                <tr>
                  <td>Starting Amount</td>
                  <td style={{ textAlign: "right" }}>{formatMoney(round2(computed.totals.start), currency)}</td>
                </tr>
                <tr>
                  <td>Total Contributions</td>
                  <td style={{ textAlign: "right" }}>{formatMoney(round2(computed.totals.contrib), currency)}</td>
                </tr>
                <tr>
                  <td>Total Interest</td>
                  <td style={{ textAlign: "right" }}>{formatMoney(round2(computed.totals.interest), currency)}</td>
                </tr>
              </tbody>
            </table>

            <div className="kpi-grid" style={{ marginTop: 12 }}>
              {tab === "contrib" && (
                <div className="kpi">
                  <div className="kpi-label">Required Contribution</div>
                  <div className="kpi-value">{formatMoney(round2(computed.solvedContribution ?? 0), currency)}</div>
                  <div className="kpi-sub">per {contribFrequency}</div>
                </div>
              )}

              {tab === "rate" && (
                <div className="kpi">
                  <div className="kpi-label">Required Return Rate</div>
                  <div className="kpi-value">{formatPct(computed.solvedRatePct ?? 0)}</div>
                  <div className="kpi-sub">annual (nominal)</div>
                </div>
              )}

              {tab === "start" && (
                <div className="kpi">
                  <div className="kpi-label">Required Starting Amount</div>
                  <div className="kpi-value">{formatMoney(round2(computed.solvedStartingAmount ?? 0), currency)}</div>
                  <div className="kpi-sub">today</div>
                </div>
              )}

              {tab === "length" && (
                <div className="kpi">
                  <div className="kpi-label">Required Investment Length</div>
                  <div className="kpi-value">{round2(computed.solvedYears ?? 0)}</div>
                  <div className="kpi-sub">years</div>
                </div>
              )}

              <div className="kpi">
                <div className="kpi-label">Effective rate / period</div>
                <div className="kpi-value">{formatPct((computed.meta.iPerPeriod ?? 0) * 100)}</div>
                <div className="kpi-sub">per {contribFrequency}</div>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <Donut3
                startAmt={computed.totals.start}
                contribTotal={computed.totals.contrib}
                interestTotal={computed.totals.interest}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Accumulation Schedule */}
      <section className="card">
        <h2 className="card-title">Accumulation Schedule</h2>

        <div className="tab-row">
          <button
            type="button"
            className={`tab-btn ${scheduleTab === "annual" ? "active" : ""}`}
            onClick={() => setScheduleTab("annual")}
          >
            Annual Schedule
          </button>
          <button
            type="button"
            className={`tab-btn ${scheduleTab === "monthly" ? "active" : ""}`}
            onClick={() => setScheduleTab("monthly")}
            disabled={contribFrequency === "year"}
            title={contribFrequency === "year" ? "Monthly schedule is only available for monthly contributions." : ""}
            style={contribFrequency === "year" ? { opacity: 0.6, cursor: "not-allowed" } : undefined}
          >
            Monthly Schedule
          </button>
        </div>

        {scheduleTab === "annual" ? (
          <table className="table">
            <thead>
              <tr>
                <th>Year</th>
                <th style={{ textAlign: "right" }}>Deposit</th>
                <th style={{ textAlign: "right" }}>Interest</th>
                <th style={{ textAlign: "right" }}>Ending balance</th>
              </tr>
            </thead>
            <tbody>
              {computed.annualRows.map((r) => (
                <tr key={r.year}>
                  <td>{r.year}</td>
                  <td style={{ textAlign: "right" }}>{formatMoney(r.deposit, currency)}</td>
                  <td style={{ textAlign: "right" }}>{formatMoney(r.interest, currency)}</td>
                  <td style={{ textAlign: "right" }}>{formatMoney(r.endBalance, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <>
            <p className="small" style={{ marginTop: 0 }}>
              Showing first 120 months for performance.
            </p>

            <table className="table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th style={{ textAlign: "right" }}>Deposit</th>
                  <th style={{ textAlign: "right" }}>Interest</th>
                  <th style={{ textAlign: "right" }}>Ending balance</th>
                </tr>
              </thead>
              <tbody>
                {computed.monthlyRows.slice(0, 120).map((r) => (
                  <tr key={r.period}>
                    <td>{r.period}</td>
                    <td style={{ textAlign: "right" }}>{formatMoney(round2(r.deposit), currency)}</td>
                    <td style={{ textAlign: "right" }}>{formatMoney(round2(r.interest), currency)}</td>
                    <td style={{ textAlign: "right" }}>{formatMoney(round2(r.endBalance), currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        <p className="small" style={{ marginTop: 10 }}>
          “Return Rate” is treated as nominal annual, compounded by your selection. Contributions apply at the beginning/end of each contribution period.
        </p>
      </section>
    </div>
  );
}
