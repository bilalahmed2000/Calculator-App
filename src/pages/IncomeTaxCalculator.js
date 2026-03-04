import React, { useMemo, useState } from "react";
import "../css/CalcBase.css";

/** ---------- helpers ---------- */
const toNum = (v) => {
  if (v === "" || v === null || v === undefined) return 0;
  const s = String(v).replace(/[$,%\s,]/g, "");
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
};

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const money0 = (n) =>
  (Number.isFinite(n) ? n : 0).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const money2 = (n) =>
  (Number.isFinite(n) ? n : 0).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });

/** ---------- tax tables (simple replica) ---------- */
const BRACKETS_2025 = {
  single: [
    [11925, 0.1],
    [48475, 0.12],
    [103350, 0.22],
    [197300, 0.24],
    [250525, 0.32],
    [626350, 0.35],
    [Infinity, 0.37],
  ],
  married_joint: [
    [23850, 0.1],
    [96950, 0.12],
    [206700, 0.22],
    [394600, 0.24],
    [501050, 0.32],
    [751600, 0.35],
    [Infinity, 0.37],
  ],
  married_separate: [
    [11925, 0.1],
    [48475, 0.12],
    [103350, 0.22],
    [197300, 0.24],
    [250525, 0.32],
    [375800, 0.35],
    [Infinity, 0.37],
  ],
  head: [
    [17000, 0.1],
    [64850, 0.12],
    [103350, 0.22],
    [197300, 0.24],
    [250500, 0.32],
    [626350, 0.35],
    [Infinity, 0.37],
  ],
};

const BRACKETS_2026 = {
  single: [
    [12400, 0.1],
    [50400, 0.12],
    [105700, 0.22],
    [201775, 0.24],
    [256225, 0.32],
    [640600, 0.35],
    [Infinity, 0.37],
  ],
  married_joint: [
    [24800, 0.1],
    [100800, 0.12],
    [211400, 0.22],
    [403550, 0.24],
    [512450, 0.32],
    [768700, 0.35],
    [Infinity, 0.37],
  ],
  married_separate: [
    [12400, 0.1],
    [50400, 0.12],
    [105700, 0.22],
    [201775, 0.24],
    [256225, 0.32],
    [384350, 0.35],
    [Infinity, 0.37],
  ],
  head: [
    [17650, 0.1],
    [67300, 0.12],
    [107300, 0.22],
    [205000, 0.24],
    [259000, 0.32],
    [645000, 0.35],
    [Infinity, 0.37],
  ],
};

const STANDARD_DEDUCTION = {
  2025: {
    single: 15750,
    married_joint: 31500,
    married_separate: 15750,
    head: 23625,
  },
  2026: {
    single: 16100,
    married_joint: 32200,
    married_separate: 16100,
    head: 24150,
  },
};

function computeTaxFromBrackets(taxableIncome, brackets) {
  let remaining = Math.max(0, taxableIncome);
  let prevCap = 0;
  let tax = 0;

  for (const [cap, rate] of brackets) {
    const slice = Math.min(remaining, cap - prevCap);
    if (slice > 0) tax += slice * rate;
    remaining -= slice;
    prevCap = cap;
    if (remaining <= 0) break;
  }
  return tax;
}

function getMarginalRate(taxableIncome, brackets) {
  const ti = Math.max(0, taxableIncome);
  for (const [cap, rate] of brackets) {
    if (ti <= cap) return rate;
  }
  return brackets[brackets.length - 1]?.[1] ?? 0;
}

/** ================== COMPONENT ================== */
export default function IncomeTaxCalculator() {
  /** --- top inputs --- */
  const [filingStatus, setFilingStatus] = useState("single");
  const [youngDeps, setYoungDeps] = useState("0"); // 0-16
  const [otherDeps, setOtherDeps] = useState("0"); // 17+
  const [taxYear, setTaxYear] = useState("2025");

  /** --- income --- */
  const [age, setAge] = useState("30");
  const [wages, setWages] = useState("80000");
  const [fedWithheld, setFedWithheld] = useState("9000");
  const [stateWithheld, setStateWithheld] = useState("0");
  const [localWithheld, setLocalWithheld] = useState("0");

  const [hasBizIncome, setHasBizIncome] = useState("no");

  const [socialSecurity, setSocialSecurity] = useState("0");
  const [interestIncome, setInterestIncome] = useState("0");
  const [ordinaryDiv, setOrdinaryDiv] = useState("0");
  const [qualifiedDiv, setQualifiedDiv] = useState("0");
  const [passiveIncome, setPassiveIncome] = useState("0");
  const [stCapGains, setStCapGains] = useState("0");
  const [ltCapGains, setLtCapGains] = useState("0");
  const [otherIncome, setOtherIncome] = useState("0");
  const [stateLocalRate, setStateLocalRate] = useState("0"); // display-only like your earlier file

  /** --- deductions & credits --- */
  const [tipsIncome, setTipsIncome] = useState("0");
  const [overtimeIncome, setOvertimeIncome] = useState("0");
  const [carLoanInterest, setCarLoanInterest] = useState("0");
  const [iraContrib, setIraContrib] = useState("0");
  const [realEstateTax, setRealEstateTax] = useState("0");
  const [mortgageInterest, setMortgageInterest] = useState("0");
  const [charity, setCharity] = useState("0");
  const [studentLoanInterest, setStudentLoanInterest] = useState("0");
  const [childCare, setChildCare] = useState("0");
  const [college1, setCollege1] = useState("0");
  const [college2, setCollege2] = useState("0");
  const [college3, setCollege3] = useState("0");
  const [college4, setCollege4] = useState("0");
  const [otherDeductibles, setOtherDeductibles] = useState("0");

  /** show result only after calculate */
  const [submitted, setSubmitted] = useState(false);

  const yearNum = Number(taxYear) === 2026 ? 2026 : 2025;
  const bracketsByYear = yearNum === 2026 ? BRACKETS_2026 : BRACKETS_2025;

  const standardDeduction = useMemo(() => {
    return STANDARD_DEDUCTION[yearNum]?.[filingStatus] ?? 0;
  }, [yearNum, filingStatus]);

  const totals = useMemo(() => {
    // total income (matches calculator.net layout fields)
    const totalIncome =
      toNum(wages) +
      toNum(tipsIncome) +
      toNum(overtimeIncome) +
      toNum(socialSecurity) +
      toNum(interestIncome) +
      toNum(ordinaryDiv) +
      toNum(qualifiedDiv) +
      toNum(passiveIncome) +
      toNum(stCapGains) +
      toNum(ltCapGains) +
      toNum(otherIncome);

    // apply a few caps like the site hints
    const carLoan = clamp(toNum(carLoanInterest), 0, 10000);
    const studLoan = clamp(toNum(studentLoanInterest), 0, 2500);
    const childCareCap = clamp(toNum(childCare), 0, 6000);

    const itemized =
      carLoan +
      toNum(iraContrib) +
      toNum(realEstateTax) +
      toNum(mortgageInterest) +
      toNum(charity) +
      studLoan +
      childCareCap +
      toNum(college1) +
      toNum(college2) +
      toNum(college3) +
      toNum(college4) +
      toNum(otherDeductibles);

    const deductionUsed = Math.max(standardDeduction, itemized);
    const taxableIncome = Math.max(0, totalIncome - deductionUsed);

    const brackets = bracketsByYear[filingStatus] || bracketsByYear.single;
    const regularTax = computeTaxFromBrackets(taxableIncome, brackets);

    // credits (simple UI replica)
    const young = clamp(Math.floor(toNum(youngDeps)), 0, 50);
    const other = clamp(Math.floor(toNum(otherDeps)), 0, 50);

    const childCredit = young * 2200;
    const otherDepCredit = other * 500;
    const allCredits = childCredit + otherDepCredit;

    const taxAfterCredits = Math.max(0, regularTax - allCredits);

    // pre-payments (THIS was wrong in your old file)
    const prePayments =
      toNum(fedWithheld) + toNum(stateWithheld) + toNum(localWithheld);

    // net: + means owe, - means refund
    const netOweOrRefund = taxAfterCredits - prePayments;

    const mRate = getMarginalRate(taxableIncome, brackets);

    return {
      totalIncome,
      deductionUsed,
      taxableIncome,
      regularTax,
      altMinTax: 0,
      niit: 0,
      allCredits,
      taxAfterCredits,
      mRate,
      prePayments,
      netOweOrRefund,
    };
  }, [
    filingStatus,
    bracketsByYear,
    standardDeduction,
    youngDeps,
    otherDeps,
    wages,
    tipsIncome,
    overtimeIncome,
    socialSecurity,
    interestIncome,
    ordinaryDiv,
    qualifiedDiv,
    passiveIncome,
    stCapGains,
    ltCapGains,
    otherIncome,
    carLoanInterest,
    iraContrib,
    realEstateTax,
    mortgageInterest,
    charity,
    studentLoanInterest,
    childCare,
    college1,
    college2,
    college3,
    college4,
    otherDeductibles,
    fedWithheld,
    stateWithheld,
    localWithheld,
  ]);

  const resultTitle = useMemo(() => {
    if (!submitted) return "";
    const abs = Math.abs(totals.netOweOrRefund);
    const amount = money2(abs);

    if (totals.netOweOrRefund > 0) return `Tax Amount Owe for ${taxYear}: ${amount}`;
    if (totals.netOweOrRefund < 0) return `Tax Refund Estimate for ${taxYear}: ${amount}`;
    return `Estimated Tax for ${taxYear}: ${money2(0)}`;
  }, [submitted, totals.netOweOrRefund, taxYear]);

  const onCalculate = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // optional: window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onClear = () => {
    // make everything blank blocks + hide results
    setFilingStatus("single");
    setYoungDeps("");
    setOtherDeps("");
    setTaxYear("2025");

    setAge("");
    setWages("");
    setFedWithheld("");
    setStateWithheld("");
    setLocalWithheld("");

    setHasBizIncome("no");

    setSocialSecurity("");
    setInterestIncome("");
    setOrdinaryDiv("");
    setQualifiedDiv("");
    setPassiveIncome("");
    setStCapGains("");
    setLtCapGains("");
    setOtherIncome("");
    setStateLocalRate("");

    setTipsIncome("");
    setOvertimeIncome("");
    setCarLoanInterest("");
    setIraContrib("");
    setRealEstateTax("");
    setMortgageInterest("");
    setCharity("");
    setStudentLoanInterest("");
    setChildCare("");
    setCollege1("");
    setCollege2("");
    setCollege3("");
    setCollege4("");
    setOtherDeductibles("");

    setSubmitted(false);
  };

  const SectionBar = ({ children }) => (
    <div
      style={{
        width: "100%",
        background: "#eef2ff",
        border: "1px solid rgba(99, 102, 241, 0.22)",
        padding: "8px 10px",
        borderRadius: 12,
        fontWeight: 800,
        marginTop: 10,
        color: "#312e81",
      }}
    >
      {children}
    </div>
  );

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Income Tax Calculator</h1>
        <p className="muted">
          Enter values and click <b>Calculate</b> to see results (shown only after submission), styled with your
          CalcBase theme.
        </p>
      </header>

      {/* RESULT BLOCK (like calculator.net: top green bar + table) */}
      {submitted && (
        <section className="card" style={{ marginBottom: 16 }}>
          <div
            style={{
              background: "rgba(16, 185, 129, 0.10)",
              border: "1px solid rgba(16, 185, 129, 0.30)",
              padding: "10px 12px",
              borderRadius: 12,
              marginBottom: 10,
              fontWeight: 900,
              fontSize: 18,
              color: "#065f46",
            }}
          >
            {resultTitle}
          </div>

          <table className="table">
            <tbody>
              <tr>
                <td><b>Total Income</b></td>
                <td style={{ textAlign: "right" }}><b>{money0(totals.totalIncome)}</b></td>
              </tr>
              <tr>
                <td>Total Deductions</td>
                <td style={{ textAlign: "right" }}>{money0(totals.deductionUsed)}</td>
              </tr>
              <tr>
                <td>Taxable Income</td>
                <td style={{ textAlign: "right" }}>{money0(totals.taxableIncome)}</td>
              </tr>
              <tr>
                <td><b>Regular Taxes</b></td>
                <td style={{ textAlign: "right" }}><b>{money0(totals.regularTax)}</b></td>
              </tr>
              <tr>
                <td>Alternative Minimum Tax</td>
                <td style={{ textAlign: "right" }}>{money0(totals.altMinTax)}</td>
              </tr>
              <tr>
                <td>Net Investment Income Tax</td>
                <td style={{ textAlign: "right" }}>{money0(totals.niit)}</td>
              </tr>
              <tr>
                <td>All Tax Credits</td>
                <td style={{ textAlign: "right" }}>{money0(totals.allCredits)}</td>
              </tr>
              <tr>
                <td><b>Total Tax with Credits</b></td>
                <td style={{ textAlign: "right" }}><b>{money0(totals.taxAfterCredits)}</b></td>
              </tr>
              <tr>
                <td>Marginal Tax Rate</td>
                <td style={{ textAlign: "right" }}>{Math.round(totals.mRate * 100)}%</td>
              </tr>
              <tr>
                <td>Tax Pre-payments</td>
                <td style={{ textAlign: "right" }}>{money0(totals.prePayments)}</td>
              </tr>
              <tr>
                <td><b>Tax Amount Owe</b></td>
                <td style={{ textAlign: "right" }}>
                  <b>
                    {totals.netOweOrRefund > 0
                      ? money2(totals.netOweOrRefund)
                      : money2(0)}
                  </b>
                </td>
              </tr>
            </tbody>
          </table>

          <p className="small" style={{ marginTop: 10 }}>
            If pre-payments exceed total tax, calculator.net shows a refund; here you can extend the display if you want.
          </p>
        </section>
      )}

      {/* FORM (calculator.net style: big form after result) */}
      <form className="card" onSubmit={onCalculate}>
        <div
          style={{
            width: "100%",
            background: "#eef2ff",
            border: "1px solid rgba(99, 102, 241, 0.22)",
            color: "#312e81",
            padding: "8px 10px",
            borderRadius: 12,
            fontWeight: 800,
          }}
        >
          Modify the values and click the Calculate button to use
        </div>

        <div className="row two" style={{ marginTop: 10 }}>
          <div className="field">
            <label>File Status</label>
            <select value={filingStatus} onChange={(e) => setFilingStatus(e.target.value)}>
              <option value="single">Single</option>
              <option value="married_joint">Married Filing Jointly</option>
              <option value="married_separate">Married Filing Separately</option>
              <option value="head">Head of Household</option>
            </select>
          </div>

          <div className="field">
            <label>Tax Year</label>
            <div className="row" style={{ gap: 14, alignItems: "center" }}>
              <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="taxYear"
                  value="2026"
                  checked={taxYear === "2026"}
                  onChange={(e) => setTaxYear(e.target.value)}
                />
                2026 (return filed in 2027)
              </label>
              <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="taxYear"
                  value="2025"
                  checked={taxYear === "2025"}
                  onChange={(e) => setTaxYear(e.target.value)}
                />
                2025 (return filed in 2026)
              </label>
            </div>
            <div className="small" style={{ marginTop: 6 }}>
              Standard deduction ({taxYear}): <b>{money0(standardDeduction)}</b>
            </div>
          </div>
        </div>

        <div className="row two">
          <div className="field">
            <label>No. of Young Dependents</label>
            <input value={youngDeps} onChange={(e) => setYoungDeps(e.target.value)} placeholder="0" />
            <div className="small">Age 0-16</div>
          </div>
          <div className="field">
            <label>No. of Other Dependents</label>
            <input value={otherDeps} onChange={(e) => setOtherDeps(e.target.value)} placeholder="0" />
            <div className="small">Age 17 or older</div>
          </div>
        </div>

        <SectionBar>Income</SectionBar>

        <div className="row two">
          <div className="field">
            <label>Age</label>
            <input value={age} onChange={(e) => setAge(e.target.value)} placeholder="30" />
          </div>

          <div className="field">
            <label>Wages, Tips, Other Compensation</label>
            <input value={wages} onChange={(e) => setWages(e.target.value)} placeholder="80000" />
            <div className="small">(W-2 box 1)</div>
          </div>
        </div>

        <div className="row two">
          <div className="field">
            <label>Federal Income Tax Withheld</label>
            <input value={fedWithheld} onChange={(e) => setFedWithheld(e.target.value)} placeholder="9000" />
            <div className="small">(W-2 box 2)</div>
          </div>

          <div className="field">
            <label>State Income Tax Withheld</label>
            <input value={stateWithheld} onChange={(e) => setStateWithheld(e.target.value)} placeholder="0" />
            <div className="small">(W-2 box 17)</div>
          </div>
        </div>

        <div className="row two">
          <div className="field">
            <label>Local Income Tax Withheld</label>
            <input value={localWithheld} onChange={(e) => setLocalWithheld(e.target.value)} placeholder="0" />
            <div className="small">(W-2 box 19)</div>
          </div>

          <div className="field">
            <label>Has Business or Self Employment Income?</label>
            <div className="row" style={{ gap: 14, alignItems: "center" }}>
              <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="biz"
                  value="yes"
                  checked={hasBizIncome === "yes"}
                  onChange={(e) => setHasBizIncome(e.target.value)}
                />
                yes
              </label>
              <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="biz"
                  value="no"
                  checked={hasBizIncome === "no"}
                  onChange={(e) => setHasBizIncome(e.target.value)}
                />
                no
              </label>
            </div>
          </div>
        </div>

        <div className="row two">
          <div className="field">
            <label>Social Security Income</label>
            <input value={socialSecurity} onChange={(e) => setSocialSecurity(e.target.value)} placeholder="0" />
            <div className="small">SSA-1099, RRB-1099</div>
          </div>
          <div className="field">
            <label>Interest Income</label>
            <input value={interestIncome} onChange={(e) => setInterestIncome(e.target.value)} placeholder="0" />
            <div className="small">1099-INT</div>
          </div>
        </div>

        <div className="row two">
          <div className="field">
            <label>Ordinary Dividends</label>
            <input value={ordinaryDiv} onChange={(e) => setOrdinaryDiv(e.target.value)} placeholder="0" />
          </div>
          <div className="field">
            <label>Qualified Dividends</label>
            <input value={qualifiedDiv} onChange={(e) => setQualifiedDiv(e.target.value)} placeholder="0" />
            <div className="small">1099-DIV</div>
          </div>
        </div>

        <div className="row two">
          <div className="field">
            <label>Passive Incomes</label>
            <input value={passiveIncome} onChange={(e) => setPassiveIncome(e.target.value)} placeholder="0" />
            <div className="small">e.g. rentals and real estate, royalties</div>
          </div>
          <div className="field">
            <label>Short-term Capital Gains</label>
            <input value={stCapGains} onChange={(e) => setStCapGains(e.target.value)} placeholder="0" />
          </div>
        </div>

        <div className="row two">
          <div className="field">
            <label>Long-term Capital Gains</label>
            <input value={ltCapGains} onChange={(e) => setLtCapGains(e.target.value)} placeholder="0" />
          </div>
          <div className="field">
            <label>Other Income</label>
            <input value={otherIncome} onChange={(e) => setOtherIncome(e.target.value)} placeholder="0" />
            <div className="small">e.g. unemployment pay(1099-G), retirement pay(1099-R)</div>
          </div>
        </div>

        <div className="row">
          <div className="field" style={{ maxWidth: 280 }}>
            <label>State+Local Tax Rate</label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input value={stateLocalRate} onChange={(e) => setStateLocalRate(e.target.value)} placeholder="0" />
              <span>%</span>
            </div>
          </div>
        </div>

        <SectionBar>Deductions &amp; Credits</SectionBar>

        <div className="row two">
          <div className="field">
            <label>Tips Income</label>
            <input value={tipsIncome} onChange={(e) => setTipsIncome(e.target.value)} placeholder="0" />
          </div>
          <div className="field">
            <label>Overtime Income</label>
            <input value={overtimeIncome} onChange={(e) => setOvertimeIncome(e.target.value)} placeholder="0" />
          </div>
        </div>

        <div className="row two">
          <div className="field">
            <label>Car Loan Interest</label>
            <input value={carLoanInterest} onChange={(e) => setCarLoanInterest(e.target.value)} placeholder="0" />
            <div className="small">Max $10,000 for qualified vehicle purchase</div>
          </div>
          <div className="field">
            <label>IRA Contributions</label>
            <input value={iraContrib} onChange={(e) => setIraContrib(e.target.value)} placeholder="0" />
          </div>
        </div>

        <div className="row two">
          <div className="field">
            <label>Real Estate Tax</label>
            <input value={realEstateTax} onChange={(e) => setRealEstateTax(e.target.value)} placeholder="0" />
          </div>
          <div className="field">
            <label>Mortgage Interest</label>
            <input value={mortgageInterest} onChange={(e) => setMortgageInterest(e.target.value)} placeholder="0" />
          </div>
        </div>

        <div className="row two">
          <div className="field">
            <label>Charitable Donations</label>
            <input value={charity} onChange={(e) => setCharity(e.target.value)} placeholder="0" />
          </div>
          <div className="field">
            <label>Student Loan Interest</label>
            <input value={studentLoanInterest} onChange={(e) => setStudentLoanInterest(e.target.value)} placeholder="0" />
            <div className="small">Max $2,500/Person</div>
          </div>
        </div>

        <div className="row two">
          <div className="field">
            <label>Child &amp; Dependent Care Expense</label>
            <input value={childCare} onChange={(e) => setChildCare(e.target.value)} placeholder="0" />
            <div className="small">Max $6,000 total</div>
          </div>
          <div className="field">
            <label>College Education Expense</label>
            <div className="small">Student 1</div>
            <input value={college1} onChange={(e) => setCollege1(e.target.value)} placeholder="0" />
            <div className="small">Student 2</div>
            <input value={college2} onChange={(e) => setCollege2(e.target.value)} placeholder="0" />
            <div className="small">Student 3</div>
            <input value={college3} onChange={(e) => setCollege3(e.target.value)} placeholder="0" />
            <div className="small">Student 4</div>
            <input value={college4} onChange={(e) => setCollege4(e.target.value)} placeholder="0" />
          </div>
        </div>

        <div className="row">
          <div className="field" style={{ maxWidth: 300 }}>
            <label>Other Deductibles</label>
            <input value={otherDeductibles} onChange={(e) => setOtherDeductibles(e.target.value)} placeholder="0" />
          </div>
        </div>

        <div className="row" style={{ marginTop: 14, gap: 10 }}>
          <button type="submit" className="btn">
            Calculate
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClear}>
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}