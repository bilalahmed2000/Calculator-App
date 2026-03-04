import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/CalcBase.css";
import "../css/RandomNumberGenerator.css";

/* ---------- Math sidebar links ---------- */
const mathLinks = [
  { label: "Scientific Calculator", to: "/scientific" },
  { label: "Fraction Calculator", to: "/fraction-calculator" },
  { label: "Percentage Calculator", to: "/percentage-calculator" },
  { label: "Random Number Generator", to: "/random-number-generator" },
  { label: "Triangle Calculator", to: "/triangle-calculator" },
  { label: "Standard Deviation Calculator", to: "/std-dev" },
  { label: "Number Sequence Calculator", to: "/number-sequence" },
  { label: "Statistics Calculator", to: "/statistics" },
];

/* ---------- Core math helpers ---------- */
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randDecimal(min, max, precision) {
  const raw = Math.random() * (max - min) + min;
  return Number(raw.toFixed(precision));
}

/* ---------- Component ---------- */
export default function RandomNumberGenerator() {

  /* ---- Basic section state ---- */
  const [basicMin, setBasicMin] = useState("1");
  const [basicMax, setBasicMax] = useState("100");
  const [basicResult, setBasicResult] = useState(null);
  const [basicError, setBasicError] = useState("");

  const handleBasicGenerate = () => {
    const lo = Number(basicMin);
    const hi = Number(basicMax);

    if (!Number.isFinite(lo) || !Number.isFinite(hi) || basicMin === "" || basicMax === "") {
      setBasicError("Please enter valid numbers for both limits.");
      setBasicResult(null);
      return;
    }
    if (!Number.isInteger(lo) || !Number.isInteger(hi)) {
      setBasicError("Limits must be whole integers.");
      setBasicResult(null);
      return;
    }
    if (lo > hi) {
      setBasicError("Lower limit cannot be greater than upper limit.");
      setBasicResult(null);
      return;
    }

    setBasicError("");
    setBasicResult(randInt(lo, hi));
  };

  const handleBasicClear = () => {
    setBasicMin("1");
    setBasicMax("100");
    setBasicResult(null);
    setBasicError("");
  };

  /* ---- Comprehensive section state ---- */
  const [compMin, setCompMin] = useState("1");
  const [compMax, setCompMax] = useState("100");
  const [compCount, setCompCount] = useState("10");
  const [compType, setCompType] = useState("integer");
  const [compPrecision, setCompPrecision] = useState("2");
  const [compResults, setCompResults] = useState(null);
  const [compError, setCompError] = useState("");

  const handleCompGenerate = () => {
    const lo = Number(compMin);
    const hi = Number(compMax);
    const count = Number(compCount);
    const precision = Number(compPrecision);

    if (!Number.isFinite(lo) || !Number.isFinite(hi) || compMin === "" || compMax === "") {
      setCompError("Please enter valid numbers for both limits.");
      setCompResults(null);
      return;
    }
    if (compType === "integer" && (!Number.isInteger(lo) || !Number.isInteger(hi))) {
      setCompError("Limits must be whole integers when generating integers.");
      setCompResults(null);
      return;
    }
    if (lo > hi) {
      setCompError("Lower limit cannot be greater than upper limit.");
      setCompResults(null);
      return;
    }
    if (!Number.isInteger(count) || count < 1) {
      setCompError("'How many' must be a positive whole number.");
      setCompResults(null);
      return;
    }
    if (count > 10000) {
      setCompError("Maximum 10,000 results allowed at once.");
      setCompResults(null);
      return;
    }
    if (compType === "decimal") {
      if (!Number.isInteger(precision) || precision < 0) {
        setCompError("Precision must be a non-negative whole number.");
        setCompResults(null);
        return;
      }
      if (precision > 20) {
        setCompError("Precision cannot exceed 20 decimal places.");
        setCompResults(null);
        return;
      }
    }

    setCompError("");
    const nums = [];
    for (let i = 0; i < count; i++) {
      nums.push(
        compType === "integer"
          ? randInt(lo, hi)
          : randDecimal(lo, hi, precision)
      );
    }
    setCompResults(nums);
  };

  const handleCompClear = () => {
    setCompMin("1");
    setCompMax("100");
    setCompCount("10");
    setCompType("integer");
    setCompPrecision("2");
    setCompResults(null);
    setCompError("");
  };

  /* ---- Render ---- */
  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Random Number Generator</h1>
        <p className="muted">
          Generate truly random numbers within any range. Pick a single integer for
          quick use, or switch to the comprehensive version for bulk generation,
          decimal precision control, and more.
        </p>
      </header>

      <div className="rng-layout">

        {/* ========= Main content ========= */}
        <div className="rng-main">

          {/* ----- Basic Version ----- */}
          <section className="card">
            <h2 className="card-title">Random Number Generator</h2>
            <p className="rng-desc">
              Enter a lower and upper limit, then click <strong>Generate</strong> to
              produce a random integer within that range.
            </p>

            <div className="row two">
              <div className="field">
                <label>Lower Limit</label>
                <input
                  type="number"
                  value={basicMin}
                  onChange={(e) => setBasicMin(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Upper Limit</label>
                <input
                  type="number"
                  value={basicMax}
                  onChange={(e) => setBasicMax(e.target.value)}
                />
              </div>
            </div>

            <div className="row two rng-btn-row">
              <button type="button" className="btn-primary" onClick={handleBasicGenerate}>
                Generate
              </button>
              <button type="button" className="btn-secondary" onClick={handleBasicClear}>
                Clear
              </button>
            </div>

            {basicError && (
              <div className="rng-error">{basicError}</div>
            )}

            {basicResult !== null && !basicError && (
              <div className="rng-result-box">
                <span className="rng-result-label">Your Random Number</span>
                <span className="rng-result-value">{basicResult}</span>
              </div>
            )}
          </section>

          {/* ----- Comprehensive Version ----- */}
          <section className="card" style={{ marginTop: 18 }}>
            <h2 className="card-title">Comprehensive Version</h2>
            <p className="rng-desc">
              Generate multiple random numbers at once. Switch between integers and
              decimals, and control the number of decimal places.
            </p>

            <div className="row two">
              <div className="field">
                <label>Lower Limit</label>
                <input
                  type="number"
                  value={compMin}
                  onChange={(e) => setCompMin(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Upper Limit</label>
                <input
                  type="number"
                  value={compMax}
                  onChange={(e) => setCompMax(e.target.value)}
                />
              </div>
            </div>

            <div className="row two">
              <div className="field">
                <label>How Many to Generate</label>
                <input
                  type="number"
                  min={1}
                  max={10000}
                  value={compCount}
                  onChange={(e) => setCompCount(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Decimal Precision</label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={compPrecision}
                  disabled={compType === "integer"}
                  onChange={(e) => setCompPrecision(e.target.value)}
                  className={compType === "integer" ? "rng-input-disabled" : ""}
                />
              </div>
            </div>

            <div className="field" style={{ marginBottom: 14 }}>
              <label>Number Type</label>
              <div className="rng-radio-group">
                <label className="rng-radio-label">
                  <input
                    type="radio"
                    name="compType"
                    value="integer"
                    checked={compType === "integer"}
                    onChange={() => setCompType("integer")}
                  />
                  <span>Integer</span>
                </label>
                <label className="rng-radio-label">
                  <input
                    type="radio"
                    name="compType"
                    value="decimal"
                    checked={compType === "decimal"}
                    onChange={() => setCompType("decimal")}
                  />
                  <span>Decimal</span>
                </label>
              </div>
            </div>

            <div className="row two rng-btn-row">
              <button type="button" className="btn-primary" onClick={handleCompGenerate}>
                Generate
              </button>
              <button type="button" className="btn-secondary" onClick={handleCompClear}>
                Clear
              </button>
            </div>

            {compError && (
              <div className="rng-error">{compError}</div>
            )}

            {compResults !== null && !compError && (
              <div className="rng-comp-box">
                <div className="rng-comp-header">
                  {compResults.length}{" "}
                  {compType === "integer" ? "integer" : "decimal"} number
                  {compResults.length !== 1 ? "s" : ""} generated
                  {compType === "decimal" && ` (${compPrecision} decimal place${Number(compPrecision) !== 1 ? "s" : ""})`}
                </div>
                <textarea
                  readOnly
                  className="rng-textarea"
                  value={compResults.join("\n")}
                  rows={Math.min(compResults.length, 14)}
                />
              </div>
            )}
          </section>

        </div>

        {/* ========= Sidebar ========= */}
        <aside className="rng-sidebar">
          <div className="card rng-sidebar-card">
            <h3 className="rng-sidebar-title">Math Calculators</h3>
            <ul className="rng-sidebar-list">
              {mathLinks.map((lnk) => (
                <li key={lnk.to} className="rng-sidebar-item">
                  <Link
                    to={lnk.to}
                    className={
                      lnk.to === "/random-number-generator"
                        ? "rng-sidebar-link rng-sidebar-link--active"
                        : "rng-sidebar-link"
                    }
                  >
                    {lnk.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

      </div>
    </div>
  );
}
