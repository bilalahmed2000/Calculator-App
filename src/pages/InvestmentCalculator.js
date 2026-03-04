// src/pages/InvestmentCalculator.js
import React, { useMemo, useState } from "react";
import "../css/CalcBase.css";

/**
 * Investment Calculator (calculator.net style) but uses your existing CalcBase.css theme.
 * Tabs:
 * 1) End Amount (FV)
 * 2) Additional Contribution (PMT)
 * 3) Return Rate (r)
 * 4) Starting Amount (PV)
 * 5) Investment Length (t)
 */

const TAB = {
  END_AMOUNT: "End Amount",
  ADD_CONTRIB: "Additional Contribution",
  RETURN_RATE: "Return Rate",
  START_AMOUNT: "Starting Amount",
  LENGTH: "Investment Length",
};

const COMPOUND_OPTIONS = [
  { value: "annually", label: "annually", n: 1 },
  { value: "semiannually", label: "semiannually", n: 2 },
  { value: "quarterly", label: "quarterly", n: 4 },
  { value: "monthly", label: "monthly", n: 12 },
  { value: "daily", label: "daily", n: 365 },
  { value: "continuous", label: "continuously", n: null },
];

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function fmtMoney(x) {
  if (!isFinite(x)) return "-";
  return x.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

function fmtNum(x, dp = 2) {
  if (!isFinite(x)) return "-";
  return Number(x).toFixed(dp);
}

// Convert nominal annual rate + compounding into an effective MONTHLY rate.
function monthlyRateFromNominal(nominalAnnualRate, compoundValue) {
  const r = (Number(nominalAnnualRate) || 0) / 100;
  if (compoundValue === "continuous") {
    // continuous comp -> effective monthly
    return Math.exp(r / 12) - 1;
  }
  const opt = COMPOUND_OPTIONS.find((o) => o.value === compoundValue);
  const n = opt?.n ?? 1;
  // effective monthly using nominal w/ n times/year:
  // (1 + r/n)^(n/12) - 1
  return Math.pow(1 + r / n, n / 12) - 1;
}

/**
 * Simulate month-by-month. Handles:
 * - contributions monthly or yearly
 * - contribution timing begin/end of period
 * Returns:
 * - endBalance
 * - totalContrib
 * - totalInterest
 * - yearlyRows: [{year, deposit, interest, endBalance}]
 */
function simulatePlan({
  startingAmount,
  years,
  nominalRatePct,
  compound,
  additionalContribution,
  contribEvery, // "month" | "year"
  contribTiming, // "beginning" | "end"
}) {
  const pv = Math.max(0, Number(startingAmount) || 0);
  const y = Math.max(0, Number(years) || 0);
  const contrib = Math.max(0, Number(additionalContribution) || 0);

  const months = Math.round(y * 12);
  const rm = monthlyRateFromNominal(nominalRatePct, compound);

  let bal = pv;
  let totalContrib = 0;
  let totalInterest = 0;

  let yearDeposit = 0;
  let yearInterest = 0;

  const yearlyRows = [];

  for (let m = 1; m <= months; m++) {
    const isYearContributionMonth = contribEvery === "year" && ((m - 1) % 12 === 0); // month 1, 13, 25...
    const isMonthContribution = contribEvery === "month";
    const doContribThisMonth = contrib > 0 && (isMonthContribution || isYearContributionMonth);

    // Beginning contribution
    if (doContribThisMonth && contribTiming === "beginning") {
      bal += contrib;
      totalContrib += contrib;
      yearDeposit += contrib;
    }

    // Interest
    const interest = bal * rm;
    bal += interest;
    totalInterest += interest;
    yearInterest += interest;

    // End contribution
    if (doContribThisMonth && contribTiming === "end") {
      bal += contrib;
      totalContrib += contrib;
      yearDeposit += contrib;
    }

    // End of year row
    if (m % 12 === 0) {
      const year = m / 12;
      yearlyRows.push({
        year,
        deposit: yearDeposit,
        interest: yearInterest,
        endBalance: bal,
      });
      yearDeposit = 0;
      yearInterest = 0;
    }
  }

  // If years is not a whole number, simulate extra months already rounded.
  // (This keeps UI simple. If you need exact partial months, we can refine.)
  return {
    endBalance: bal,
    totalContrib,
    totalInterest,
    yearlyRows,
  };
}

/** Generic binary search solver */
function solveByBinarySearch({ low, high, fn, target, iters = 60 }) {
  let lo = low;
  let hi = high;
  for (let i = 0; i < iters; i++) {
    const mid = (lo + hi) / 2;
    const val = fn(mid);
    if (!isFinite(val)) return mid;
    if (val < target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export default function InvestmentCalculator() {
  const [tab, setTab] = useState(TAB.END_AMOUNT);

  // Shared inputs (like calculator.net)
  const [target, setTarget] = useState(1_000_000);
  const [startingAmount, setStartingAmount] = useState(20_000);
  const [years, setYears] = useState(10);
  const [nominalRatePct, setNominalRatePct] = useState(6);
  const [compound, setCompound] = useState("annually");
  const [additionalContribution, setAdditionalContribution] = useState(1_000);

  const [contribTiming, setContribTiming] = useState("end"); // beginning | end
  const [contribEvery, setContribEvery] = useState("month"); // month | year

  // Compute "mode" based on tab:
  const computed = useMemo(() => {
    const base = {
      startingAmount,
      years,
      nominalRatePct,
      compound,
      additionalContribution,
      contribEvery,
      contribTiming,
    };

    // Helper: endBalance for a given set
    const endFor = (overrides = {}) =>
      simulatePlan({ ...base, ...overrides }).endBalance;

    // Default: End Amount tab uses given inputs directly
    if (tab === TAB.END_AMOUNT) {
      const sim = simulatePlan(base);
      return {
        mode: tab,
        ...sim,
        solvedValueLabel: "End Balance",
        solvedValue: sim.endBalance,
      };
    }

    if (tab === TAB.ADD_CONTRIB) {
      // Solve additionalContribution to reach target
      const fn = (pmt) => endFor({ additionalContribution: pmt });
      // pick a safe high bound
      const high = Math.max(10_000, target); // loose
      const pmt = solveByBinarySearch({ low: 0, high, fn, target });
      const sim = simulatePlan({ ...base, additionalContribution: pmt });
      return {
        mode: tab,
        ...sim,
        solvedValueLabel:
          contribEvery === "month"
            ? `Needed contribution (per month)`
            : `Needed contribution (per year)`,
        solvedValue: pmt,
      };
    }

    if (tab === TAB.RETURN_RATE) {
      // Solve nominalRatePct to reach target
      const fn = (ratePct) => endFor({ nominalRatePct: ratePct });
      const rate = solveByBinarySearch({ low: 0, high: 100, fn, target }); // 0%..100%
      const sim = simulatePlan({ ...base, nominalRatePct: rate });
      return {
        mode: tab,
        ...sim,
        solvedValueLabel: "Needed annual return rate",
        solvedValue: rate,
      };
    }

    if (tab === TAB.START_AMOUNT) {
      // Solve startingAmount (PV) to reach target
      const fn = (pv) => endFor({ startingAmount: pv });
      const pv = solveByBinarySearch({ low: 0, high: target, fn, target });
      const sim = simulatePlan({ ...base, startingAmount: pv });
      return {
        mode: tab,
        ...sim,
        solvedValueLabel: "Needed starting amount",
        solvedValue: pv,
      };
    }

    if (tab === TAB.LENGTH) {
      // Solve years to reach target
      const fn = (tYears) => endFor({ years: tYears });
      const t = solveByBinarySearch({ low: 0, high: 100, fn, target });
      const sim = simulatePlan({ ...base, years: t });
      return {
        mode: tab,
        ...sim,
        solvedValueLabel: "Needed investment length (years)",
        solvedValue: t,
      };
    }

    const sim = simulatePlan(base);
    return {
      mode: tab,
      ...sim,
      solvedValueLabel: "End Balance",
      solvedValue: sim.endBalance,
    };
  }, [
    tab,
    target,
    startingAmount,
    years,
    nominalRatePct,
    compound,
    additionalContribution,
    contribTiming,
    contribEvery,
  ]);

  const endBalance = computed.endBalance || 0;
  const totalContrib = computed.totalContrib || 0;
  const totalInterest = computed.totalInterest || 0;

  // Pie chart percentages
  const pie = useMemo(() => {
    const pv = tab === TAB.START_AMOUNT ? Number(computed.solvedValue || 0) : Number(startingAmount || 0);
    const start = Math.max(0, pv);
    const contrib = Math.max(0, totalContrib);
    const interest = Math.max(0, totalInterest);
    const sum = Math.max(1e-9, start + contrib + interest);
    return {
      startPct: (start / sum) * 100,
      contribPct: (contrib / sum) * 100,
      interestPct: (interest / sum) * 100,
    };
  }, [tab, computed.solvedValue, startingAmount, totalContrib, totalInterest]);

  // Simple bar chart data (yearly ending balance)
  const yearly = computed.yearlyRows || [];
  const maxEnd = Math.max(1, ...yearly.map((r) => r.endBalance || 0));

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Investment Calculator</h1>
        <p className="muted">
          Calculate ending balance, required contribution, return rate, starting amount, or investment length.
          (Same functionality style as calculator.net, with your theme.)
        </p>
      </header>

      {/* Tabs */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {Object.values(TAB).map((t) => (
            <button
              key={t}
              type="button"
              className={`btn ${tab === t ? "primary" : ""}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="small" style={{ marginTop: 10, opacity: 0.85 }}>
          Modify the values and see results instantly.
        </div>
      </div>

      <div className="calc-grid">
        {/* Form */}
        <section className="card">
          <h2 className="card-title">Inputs</h2>

          {(tab === TAB.ADD_CONTRIB || tab === TAB.RETURN_RATE || tab === TAB.START_AMOUNT || tab === TAB.LENGTH) && (
            <div className="row">
              <div className="field">
                <label>Your Target</label>
                <input
                  type="number"
                  min={0}
                  value={target}
                  onChange={(e) => setTarget(Number(e.target.value))}
                />
              </div>
            </div>
          )}

          {/* Starting Amount */}
          {tab !== TAB.START_AMOUNT ? (
            <div className="row">
              <div className="field">
                <label>Starting Amount</label>
                <input
                  type="number"
                  min={0}
                  value={startingAmount}
                  onChange={(e) => setStartingAmount(Number(e.target.value))}
                />
              </div>
            </div>
          ) : (
            <div className="small" style={{ marginBottom: 10 }}>
              Starting amount will be solved to hit the target.
            </div>
          )}

          {/* Years */}
          {tab !== TAB.LENGTH ? (
            <div className="row">
              <div className="field">
                <label>After (years)</label>
                <input
                  type="number"
                  min={0}
                  step="0.25"
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                />
              </div>
            </div>
          ) : (
            <div className="small" style={{ marginBottom: 10 }}>
              Investment length will be solved to hit the target.
            </div>
          )}

          {/* Return Rate */}
          {tab !== TAB.RETURN_RATE ? (
            <div className="row two">
              <div className="field">
                <label>Return Rate (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  value={nominalRatePct}
                  onChange={(e) => setNominalRatePct(Number(e.target.value))}
                />
              </div>
              <div className="field">
                <label>Compound</label>
                <select value={compound} onChange={(e) => setCompound(e.target.value)}>
                  {COMPOUND_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="small" style={{ marginBottom: 10 }}>
              Return rate will be solved to hit the target.
            </div>
          )}

          {/* Contribution */}
          {tab !== TAB.ADD_CONTRIB ? (
            <>
              <div className="row">
                <div className="field">
                  <label>Additional Contribution</label>
                  <input
                    type="number"
                    min={0}
                    value={additionalContribution}
                    onChange={(e) => setAdditionalContribution(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="row two">
                <div className="field">
                  <label>Contribute at</label>
                  <select value={contribTiming} onChange={(e) => setContribTiming(e.target.value)}>
                    <option value="beginning">beginning</option>
                    <option value="end">end</option>
                  </select>
                </div>
                <div className="field">
                  <label>of each</label>
                  <select value={contribEvery} onChange={(e) => setContribEvery(e.target.value)}>
                    <option value="month">month</option>
                    <option value="year">year</option>
                  </select>
                </div>
              </div>
            </>
          ) : (
            <div className="row two">
              <div className="field">
                <label>Contribute at</label>
                <select value={contribTiming} onChange={(e) => setContribTiming(e.target.value)}>
                  <option value="beginning">beginning</option>
                  <option value="end">end</option>
                </select>
              </div>
              <div className="field">
                <label>of each</label>
                <select value={contribEvery} onChange={(e) => setContribEvery(e.target.value)}>
                  <option value="month">month</option>
                  <option value="year">year</option>
                </select>
              </div>
              <div className="small" style={{ gridColumn: "1 / -1" }}>
                Additional contribution will be solved to hit the target.
              </div>
            </div>
          )}

          <div className="actions">
            <button
              type="button"
              className="btn"
              onClick={() => {
                setTab(TAB.END_AMOUNT);
                setTarget(1_000_000);
                setStartingAmount(20_000);
                setYears(10);
                setNominalRatePct(6);
                setCompound("annually");
                setAdditionalContribution(1_000);
                setContribTiming("end");
                setContribEvery("month");
              }}
            >
              Reset
            </button>
          </div>

          <p className="small" style={{ marginTop: 10, opacity: 0.85 }}>
            Tip: Use tabs to solve for a missing value (like required contribution or return rate).
          </p>
        </section>

        {/* Results */}
        <section className="card">
          <h2 className="card-title">Results</h2>

          {/* Solved line like calculator.net */}
          <div className="small" style={{ marginBottom: 10 }}>
            <b>{computed.solvedValueLabel}:</b>{" "}
            {tab === TAB.RETURN_RATE ? (
              <span>
                <b>{fmtNum(computed.solvedValue, 3)}%</b>
              </span>
            ) : tab === TAB.LENGTH ? (
              <span>
                <b>{fmtNum(computed.solvedValue, 3)} years</b>
              </span>
            ) : tab === TAB.ADD_CONTRIB ? (
              <span>
                <b>{fmtMoney(computed.solvedValue)}</b>
              </span>
            ) : tab === TAB.START_AMOUNT ? (
              <span>
                <b>{fmtMoney(computed.solvedValue)}</b>
              </span>
            ) : (
              <span>
                <b>{fmtMoney(endBalance)}</b>
              </span>
            )}
          </div>

          <div className="kpi-grid">
            <div className="kpi">
              <div className="kpi-label">End Balance</div>
              <div className="kpi-value">{fmtMoney(endBalance)}</div>
              <div className="kpi-sub">future value</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Starting Amount</div>
              <div className="kpi-value">
                {tab === TAB.START_AMOUNT ? fmtMoney(Number(computed.solvedValue || 0)) : fmtMoney(Number(startingAmount || 0))}
              </div>
              <div className="kpi-sub">principal</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Total Contributions</div>
              <div className="kpi-value">{fmtMoney(totalContrib)}</div>
              <div className="kpi-sub">added</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Total Interest</div>
              <div className="kpi-value">{fmtMoney(totalInterest)}</div>
              <div className="kpi-sub">earned</div>
            </div>
          </div>

          {/* Pie (CSS conic-gradient, no extra libs) */}
          <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 14, flexWrap: "wrap" }}>
            <div
              aria-label="Breakdown pie chart"
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: `conic-gradient(
                  rgba(120,180,255,0.95) 0% ${pie.startPct}%,
                  rgba(90,255,190,0.85) ${pie.startPct}% ${pie.startPct + pie.contribPct}%,
                  rgba(255,120,160,0.85) ${pie.startPct + pie.contribPct}% 100%
                )`,
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            />
            <div className="small" style={{ minWidth: 220 }}>
              <div><span style={{ opacity: 0.9 }}>■</span> Starting Amount</div>
              <div><span style={{ opacity: 0.9 }}>■</span> Total Contributions</div>
              <div><span style={{ opacity: 0.9 }}>■</span> Interest</div>
              <div style={{ marginTop: 8, opacity: 0.85 }}>
                Breakdown: {fmtNum(pie.startPct, 0)}% / {fmtNum(pie.contribPct, 0)}% / {fmtNum(pie.interestPct, 0)}%
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Accumulation Schedule */}
      <section className="card" style={{ marginTop: 16 }}>
        <h2 className="card-title">Accumulation Schedule</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16, alignItems: "start" }}>
          {/* Table */}
          <div style={{ minWidth: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Deposit</th>
                  <th>Interest</th>
                  <th>Ending balance</th>
                </tr>
              </thead>
              <tbody>
                {yearly.slice(0, 40).map((r) => (
                  <tr key={r.year}>
                    <td>{r.year}</td>
                    <td>{fmtMoney(r.deposit)}</td>
                    <td>{fmtMoney(r.interest)}</td>
                    <td>{fmtMoney(r.endBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {yearly.length > 40 ? (
              <div className="small" style={{ marginTop: 8, opacity: 0.8 }}>
                Showing first 40 years. (We can add pagination later if you want.)
              </div>
            ) : null}
          </div>

          {/* Simple bars chart */}
          <div style={{ minWidth: 0 }}>
            <div className="small" style={{ marginBottom: 8, opacity: 0.85 }}>
              Ending balance by year
            </div>

            <div
              style={{
                border: "1px solid rgba(99, 102, 241, 0.15)",
                borderRadius: 14,
                padding: 12,
                background: "#f8f9ff",
              }}
            >
              <div style={{ display: "grid", gap: 6 }}>
                {yearly.slice(0, 15).map((r) => {
                  const w = clamp(((r.endBalance || 0) / maxEnd) * 100, 0, 100);
                  return (
                    <div key={r.year} style={{ display: "grid", gridTemplateColumns: "40px 1fr 90px", gap: 10, alignItems: "center" }}>
                      <div className="small" style={{ opacity: 0.85 }}>{r.year}</div>
                      <div style={{ height: 10, borderRadius: 999, background: "#e0e7ff", overflow: "hidden" }}>
                        <div style={{ width: `${w}%`, height: "100%", background: "#6366f1" }} />
                      </div>
                      <div className="small" style={{ textAlign: "right", opacity: 0.85 }}>
                        {fmtMoney(r.endBalance)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="small" style={{ marginTop: 10, opacity: 0.8 }}>
                (Simple chart. If you want real charts like calculator.net, we can add Chart.js or Recharts.)
              </div>
            </div>
          </div>
        </div>

        <p className="small" style={{ marginTop: 12, opacity: 0.85 }}>
          Notes: This calculator assumes a constant nominal return rate and compounds based on your selected frequency.
          Contributions happen at the beginning or end of the selected period.
        </p>
      </section>
    </div>
  );
}