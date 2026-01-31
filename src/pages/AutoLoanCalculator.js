import React, { useMemo, useState } from "react";
import "../css/CalcBase.css";

export default function AutoLoanCalculator() {
  const [vehiclePrice, setVehiclePrice] = useState(30000);
  const [downPayment, setDownPayment] = useState(5000);
  const [tradeIn, setTradeIn] = useState(0);
  const [salesTax, setSalesTax] = useState(8.0);
  const [interestRate, setInterestRate] = useState(5.0);
  const [termYears, setTermYears] = useState(5);
  const [termMonths, setTermMonths] = useState(0);

  const totalMonths = useMemo(() => termYears * 12 + termMonths, [
    termYears,
    termMonths,
  ]);

  const results = useMemo(() => {
    // Initial loan amount
    const price = Number(vehiclePrice);
    const down = Number(downPayment);
    const trade = Number(tradeIn);
    const taxRate = Number(salesTax) / 100;

    // Tax amount
    const taxablePrice = Math.max(price - down - trade, 0);
    const taxAmount = taxablePrice * taxRate;

    const loanAmount = taxablePrice + taxAmount;

    // Monthly interest rate
    const monthlyRate = Number(interestRate) / 100 / 12;

    const P = loanAmount;
    const n = totalMonths;

    let monthlyPI = 0;
    if (monthlyRate === 0) {
      monthlyPI = loanAmount / n;
    } else {
      monthlyPI =
        (P * monthlyRate * Math.pow(1 + monthlyRate, n)) /
        (Math.pow(1 + monthlyRate, n) - 1);
    }

    const totalPayment = monthlyPI * n;
    const totalInterest = totalPayment - P;

    return {
      loanAmount,
      taxAmount,
      monthlyPI,
      totalPayment,
      totalInterest,
    };
  }, [
    vehiclePrice,
    downPayment,
    tradeIn,
    salesTax,
    interestRate,
    totalMonths,
  ]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Auto Loan Calculator</h1>
        <p className="muted">
          Estimate your monthly auto loan payment, total cost, and interest.
        </p>
      </header>

      <div className="calc-grid">
        {/* INPUT CARD */}
        <section className="card">
          <h2 className="card-title">Loan Inputs</h2>

          {/* Vehicle Price */}
          <div className="row two">
            <div className="field">
              <label>Vehicle Price ($)</label>
              <input
                type="number"
                value={vehiclePrice}
                onChange={(e) => setVehiclePrice(Number(e.target.value))}
              />
            </div>

            <div className="field">
              <label>Down Payment ($)</label>
              <input
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Trade-in & Sales Tax */}
          <div className="row two">
            <div className="field">
              <label>Trade-in Value ($)</label>
              <input
                type="number"
                value={tradeIn}
                onChange={(e) => setTradeIn(Number(e.target.value))}
              />
            </div>

            <div className="field">
              <label>Sales Tax (%)</label>
              <input
                type="number"
                step="0.01"
                value={salesTax}
                onChange={(e) => setSalesTax(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Interest & Term */}
          <div className="row two">
            <div className="field">
              <label>Interest Rate (%)</label>
              <input
                type="number"
                step="0.01"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
              />
            </div>

            <div className="field">
              <label>Term (Years)</label>
              <input
                type="number"
                value={termYears}
                onChange={(e) => setTermYears(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="row two">
            <div className="field">
              <label>Term (Months)</label>
              <input
                type="number"
                value={termMonths}
                onChange={(e) => setTermMonths(Number(e.target.value))}
              />
            </div>
          </div>
        </section>

        {/* RESULTS CARD */}
        <section className="card">
          <h2 className="card-title">Results</h2>

          <div className="kpi-grid">
            <div className="kpi">
              <div className="kpi-label">Loan Amount</div>
              <div className="kpi-value">
                {results.loanAmount.toFixed(2)}
              </div>
              <div className="kpi-sub">$ after tax</div>
            </div>

            <div className="kpi">
              <div className="kpi-label">Monthly Payment</div>
              <div className="kpi-value">
                {results.monthlyPI.toFixed(2)}
              </div>
              <div className="kpi-sub">$ per month</div>
            </div>

            <div className="kpi">
              <div className="kpi-label">Total Interest</div>
              <div className="kpi-value">
                {results.totalInterest.toFixed(2)}
              </div>
              <div className="kpi-sub">$ total</div>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <b>Total Paid:</b> {results.totalPayment.toFixed(2)} $
          </div>
        </section>
      </div>
    </div>
  );
}
