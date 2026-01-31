import React, { useMemo, useState } from "react";
import "../css/CalcBase.css";

export default function LoanCalculator() {
  const [loanAmount, setLoanAmount] = useState(10000);
  const [interestRate, setInterestRate] = useState(5.0);
  const [termYears, setTermYears] = useState(5);
  const [termMonths, setTermMonths] = useState(0);

  const totalMonths = useMemo(() => termYears * 12 + termMonths, [
    termYears,
    termMonths,
  ]);

  const result = useMemo(() => {
    const r = interestRate / 100 / 12;
    const P = loanAmount;
    const n = totalMonths;

    let monthlyPayment = 0;
    if (r === 0) {
      monthlyPayment = P / n;
    } else {
      monthlyPayment =
        (P * r * Math.pow(1 + r, n)) /
        (Math.pow(1 + r, n) - 1);
    }

    const totalPayment = monthlyPayment * n;
    const totalInterest = totalPayment - P;

    return {
      monthlyPayment,
      totalPayment,
      totalInterest,
      r,
      n,
      P,
    };
  }, [loanAmount, interestRate, totalMonths]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Loan Calculator</h1>
        <p className="muted">
          Calculate loan payments, interest, and totals.
        </p>
      </header>

      <div className="calc-grid">
        {/* INPUT CARD */}
        <section className="card">
          <h2 className="card-title">Loan Details</h2>

          <div className="row two">
            <div className="field">
              <label>Loan Amount ($)</label>
              <input
                type="number"
                value={loanAmount}
                onChange={(e) =>
                  setLoanAmount(Number(e.target.value))
                }
              />
            </div>

            <div className="field">
              <label>Interest Rate (%)</label>
              <input
                type="number"
                step="0.01"
                value={interestRate}
                onChange={(e) =>
                  setInterestRate(Number(e.target.value))
                }
              />
            </div>
          </div>

          <div className="row two">
            <div className="field">
              <label>Term (Years)</label>
              <input
                type="number"
                value={termYears}
                onChange={(e) =>
                  setTermYears(Number(e.target.value))
                }
              />
            </div>

            <div className="field">
              <label>Term (Months)</label>
              <input
                type="number"
                value={termMonths}
                onChange={(e) =>
                  setTermMonths(Number(e.target.value))
                }
              />
            </div>
          </div>
        </section>

        {/* RESULTS CARD */}
        <section className="card">
          <h2 className="card-title">Results</h2>

          <div className="kpi-grid">
            <div className="kpi">
              <div className="kpi-label">Monthly Payment</div>
              <div className="kpi-value">
                {result.monthlyPayment.toFixed(2)}
              </div>
              <div className="kpi-sub">$ per month</div>
            </div>

            <div className="kpi">
              <div className="kpi-label">Total Payment</div>
              <div className="kpi-value">
                {result.totalPayment.toFixed(2)}
              </div>
              <div className="kpi-sub">$ total</div>
            </div>

            <div className="kpi">
              <div className="kpi-label">Total Interest</div>
              <div className="kpi-value">
                {result.totalInterest.toFixed(2)}
              </div>
              <div className="kpi-sub">$ total</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
