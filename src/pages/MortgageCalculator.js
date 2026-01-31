import React, { useMemo, useState } from "react";
import "../css/CalcBase.css";

export default function MortgageCalculator() {
  const [housePrice, setHousePrice] = useState(300000);
  const [downPayment, setDownPayment] = useState(60000);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTerm, setLoanTerm] = useState(30);
  const [propertyTax, setPropertyTax] = useState(3600);
  const [homeInsurance, setHomeInsurance] = useState(1200);
  const [pmi, setPmi] = useState(0);

  // Compute monthly payment amounts
  const result = useMemo(() => {
    const principal = Math.max(housePrice - downPayment, 0);

    const monthlyTax = propertyTax / 12;
    const monthlyInsurance = homeInsurance / 12;
    const monthlyPmi = pmi / 12;

    // Monthly interest rate
    const r = interestRate / 100 / 12;

    // Total number of payments
    const n = loanTerm * 12;

    let monthlyPrincipalInterest = 0;
    if (r === 0) {
      // no interest -> simple
      monthlyPrincipalInterest = principal / n;
    } else {
      // fixed mortgage formula
      monthlyPrincipalInterest =
        (principal * r * Math.pow(1 + r, n)) /
        (Math.pow(1 + r, n) - 1);
    }

    const monthlyPayment =
      monthlyPrincipalInterest + monthlyTax + monthlyInsurance + monthlyPmi;

    const totalPayments = monthlyPayment * n;
    const totalInterest = monthlyPrincipalInterest * n - principal;

    return {
      principal,
      monthlyPrincipalInterest,
      monthlyTax,
      monthlyInsurance,
      monthlyPmi,
      monthlyPayment,
      totalPayments,
      totalInterest,
    };
  }, [
    housePrice,
    downPayment,
    interestRate,
    loanTerm,
    propertyTax,
    homeInsurance,
    pmi,
  ]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Mortgage Calculator</h1>
        <p className="muted">
          Estimate your monthly mortgage payment including taxes, insurance,
          and PMI.
        </p>
      </header>

      <div className="calc-grid">
        {/* INPUT CARD */}
        <section className="card">
          <h2 className="card-title">Mortgage Details</h2>

          <div className="row two">
            <div className="field">
              <label>House Price ($)</label>
              <input
                type="number"
                value={housePrice}
                onChange={(e) => setHousePrice(Number(e.target.value))}
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
              <label>Loan Term (Years)</label>
              <input
                type="number"
                value={loanTerm}
                onChange={(e) => setLoanTerm(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="row two">
            <div className="field">
              <label>Property Tax (Annual $)</label>
              <input
                type="number"
                value={propertyTax}
                onChange={(e) => setPropertyTax(Number(e.target.value))}
              />
            </div>

            <div className="field">
              <label>Home Insurance (Annual $)</label>
              <input
                type="number"
                value={homeInsurance}
                onChange={(e) => setHomeInsurance(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="row">
            <div className="field">
              <label>PMI (Annual $)</label>
              <input
                type="number"
                value={pmi}
                onChange={(e) => setPmi(Number(e.target.value))}
              />
            </div>
          </div>
        </section>

        {/* RESULT CARD */}
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
              <div className="kpi-label">Principal + Interest</div>
              <div className="kpi-value">
                {result.monthlyPrincipalInterest.toFixed(2)}
              </div>
              <div className="kpi-sub">$ per month</div>
            </div>

            <div className="kpi">
              <div className="kpi-label">Total Interest</div>
              <div className="kpi-value">
                {result.totalInterest.toFixed(2)}
              </div>
              <div className="kpi-sub">$ over loan</div>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <b>Total Paid (All Costs):</b>{" "}
            {result.totalPayments.toFixed(2)} $
          </div>
        </section>
      </div>
    </div>
  );
}
