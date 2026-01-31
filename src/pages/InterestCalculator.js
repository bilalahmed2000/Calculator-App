import React, { useMemo, useState } from "react";
import "../css/CalcBase.css";

export default function InterestCalculator() {
  const [principal, setPrincipal] = useState(10000);
  const [rate, setRate] = useState(5);
  const [years, setYears] = useState(5);
  const [months, setMonths] = useState(0);
  const [days, setDays] = useState(0);
  const [compound, setCompound] = useState("monthly");

  const totalYears = useMemo(() => {
    return (
      Number(years) +
      Number(months) / 12 +
      Number(days) / 365
    );
  }, [years, months, days]);

  const compoundingMap = {
    annually: 1,
    semiannually: 2,
    quarterly: 4,
    monthly: 12,
    weekly: 52,
    daily: 365,
  };

  const results = useMemo(() => {
    const P = principal;
    const r = rate / 100;
    const t = totalYears;

    // Simple Interest
    const simpleInterest = P * r * t;
    const simpleTotal = P + simpleInterest;

    // Compound Interest
    const n = compoundingMap[compound];
    const compoundTotal = P * Math.pow(1 + r / n, n * t);
    const compoundInterest = compoundTotal - P;

    return {
      simpleInterest,
      simpleTotal,
      compoundInterest,
      compoundTotal,
    };
  }, [principal, rate, totalYears, compound]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Interest Calculator</h1>
        <p className="muted">
          Calculate simple and compound interest over time.
        </p>
      </header>

      <div className="calc-grid">
        {/* INPUT CARD */}
        <section className="card">
          <h2 className="card-title">Investment Details</h2>

          <div className="row two">
            <div className="field">
              <label>Principal ($)</label>
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(+e.target.value)}
              />
            </div>

            <div className="field">
              <label>Interest Rate (%)</label>
              <input
                type="number"
                step="0.01"
                value={rate}
                onChange={(e) => setRate(+e.target.value)}
              />
            </div>
          </div>

          <div className="row three">
            <div className="field">
              <label>Years</label>
              <input
                type="number"
                value={years}
                onChange={(e) => setYears(+e.target.value)}
              />
            </div>

            <div className="field">
              <label>Months</label>
              <input
                type="number"
                value={months}
                onChange={(e) => setMonths(+e.target.value)}
              />
            </div>

            <div className="field">
              <label>Days</label>
              <input
                type="number"
                value={days}
                onChange={(e) => setDays(+e.target.value)}
              />
            </div>
          </div>

          <div className="row">
            <div className="field">
              <label>Compounding</label>
              <select
                value={compound}
                onChange={(e) => setCompound(e.target.value)}
              >
                <option value="annually">Annually</option>
                <option value="semiannually">Semiannually</option>
                <option value="quarterly">Quarterly</option>
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="daily">Daily</option>
              </select>
            </div>
          </div>
        </section>

        {/* RESULTS CARD */}
        <section className="card">
          <h2 className="card-title">Results</h2>

          <table className="table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Interest Earned</th>
                <th>Total Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Simple Interest</td>
                <td>${results.simpleInterest.toFixed(2)}</td>
                <td>${results.simpleTotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Compound Interest</td>
                <td>${results.compoundInterest.toFixed(2)}</td>
                <td>${results.compoundTotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <p className="small" style={{ marginTop: 10 }}>
            Compound interest assumes reinvestment at each compounding period.
          </p>
        </section>
      </div>
    </div>
  );
}
